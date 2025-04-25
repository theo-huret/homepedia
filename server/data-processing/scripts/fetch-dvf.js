const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const csv = require('csv-parser');
const { pipeline } = require('stream/promises');
const { createReadStream, createWriteStream } = require('fs');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const zlib = require('zlib');

dotenv.config();

const pool = new Pool({
    connectionString: process.env.POSTGRES_URI || 'postgres://postgres:postgres@localhost:5432/homepedia'
});

const DVF_URL = 'https://files.data.gouv.fr/geo-dvf/latest/csv/2022/full.csv.gz';
const DATA_DIR = path.join(__dirname, '../data');
const FILE_PATH = path.join(DATA_DIR, 'dvf_2022.csv.gz');
const EXTRACTED_PATH = path.join(DATA_DIR, 'dvf_2022.csv');

async function downloadFile() {
    try {
        await fs.ensureDir(DATA_DIR);

        console.log('Téléchargement du fichier DVF...');
        const response = await axios({
            method: 'GET',
            url: DVF_URL,
            responseType: 'stream'
        });

        const writer = createWriteStream(FILE_PATH);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (error) {
        console.error('Erreur lors du téléchargement:', error);
        throw error;
    }
}

async function extractFile() {
    try {
        console.log('Extraction du fichier...');
        await pipeline(
            createReadStream(FILE_PATH),
            zlib.createGunzip(),
            createWriteStream(EXTRACTED_PATH)
        );
        console.log('Extraction terminée');
    } catch (error) {
        console.error('Erreur lors de l\'extraction:', error);
        throw error;
    }
}

async function getReferencesIds() {
    const client = await pool.connect();
    try {
        const communesMap = new Map();
        const typesMap = new Map();

        const communesResult = await client.query('SELECT id, code_insee FROM communes');
        communesResult.rows.forEach(row => {
            communesMap.set(row.code_insee, row.id);
        });

        const typesResult = await client.query('SELECT id, code FROM types_bien');
        typesResult.rows.forEach(row => {
            typesMap.set(row.code, row.id);
        });

        return { communesMap, typesMap };
    } finally {
        client.release();
    }
}

async function insertMissingCommunes(transactions) {
    const client = await pool.connect();
    try {
        const existingResult = await client.query('SELECT code_insee FROM communes');
        const existingCodes = new Set(existingResult.rows.map(row => row.code_insee));

        const uniqueCommunes = new Map();
        transactions.forEach(transaction => {
            if (!existingCodes.has(transaction.code_commune) && !uniqueCommunes.has(transaction.code_commune)) {
                uniqueCommunes.set(transaction.code_commune, {
                    code_insee: transaction.code_commune,
                    nom: transaction.nom_commune,
                    code_postal: transaction.code_postal,
                    departement_id: null,
                    latitude: transaction.latitude || null,
                    longitude: transaction.longitude || null
                });
            }
        });

        const departementsResult = await client.query('SELECT id, code FROM departements');
        const departementsMap = new Map();
        departementsResult.rows.forEach(row => {
            departementsMap.set(row.code, row.id);
        });

        const communesMap = new Map();
        for (const commune of uniqueCommunes.values()) {
            const codeDept = commune.code_insee.substring(0, commune.code_insee.length >= 3 && commune.code_insee[0] === '9' ? 3 : 2);
            commune.departement_id = departementsMap.get(codeDept) || null;

            if (commune.departement_id) {
                const result = await client.query(
                    `INSERT INTO communes (code_insee, nom, code_postal, departement_id, latitude, longitude) 
                     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
                    [commune.code_insee, commune.nom, commune.code_postal, commune.departement_id, commune.latitude, commune.longitude]
                );
                communesMap.set(commune.code_insee, result.rows[0].id);
            }
        }

        return communesMap;
    } finally {
        client.release();
    }
}

async function insertMissingTypesBien(transactions) {
    const client = await pool.connect();
    try {
        const existingResult = await client.query('SELECT code, libelle FROM types_bien');
        const existingCodes = new Set(existingResult.rows.map(row => row.code));

        const typeMapping = {
            'Appartement': 'APPARTEMENT',
            'Maison': 'MAISON',
            'Dépendance': 'DEPENDANCE',
            'Local industriel. commercial ou assimilé': 'LOCAL_COMMERCIAL'
        };

        const uniqueTypes = new Map();
        transactions.forEach(transaction => {
            if (transaction.type_local && !uniqueTypes.has(transaction.type_local)) {
                const code = typeMapping[transaction.type_local] || transaction.type_local.toUpperCase().replace(/\s+/g, '_');
                if (!existingCodes.has(code)) {
                    uniqueTypes.set(transaction.type_local, {
                        code: code,
                        libelle: transaction.type_local
                    });
                }
            }
        });

        const typesMap = new Map();
        for (const type of uniqueTypes.values()) {
            const result = await client.query(
                'INSERT INTO types_bien (code, libelle) VALUES ($1, $2) RETURNING id',
                [type.code, type.libelle]
            );
            typesMap.set(type.libelle, result.rows[0].id);
        }

        return typesMap;
    } finally {
        client.release();
    }
}

async function processCSV() {
    try {
        console.log('Lecture du fichier CSV et insertion dans la base de données...');

        const transactions = [];
        let count = 0;

        await new Promise((resolve, reject) => {
            createReadStream(EXTRACTED_PATH)
                .pipe(csv())
                .on('data', (data) => {
                    transactions.push(data);
                    count++;

                    if (count % 1000 === 0) {
                        console.log(`Lignes lues : ${count}`);
                    }
                })
                .on('end', resolve)
                .on('error', reject);
        });

        console.log(`${transactions.length} transactions lues du CSV`);

        const newCommunesMap = await insertMissingCommunes(transactions);
        const newTypesMap = await insertMissingTypesBien(transactions);

        const { communesMap, typesMap } = await getReferencesIds();

        for (const [code, id] of newCommunesMap.entries()) {
            communesMap.set(code, id);
        }

        const typeLocalToIdMap = new Map();
        const client = await pool.connect();
        try {
            const typeResult = await client.query('SELECT id, libelle FROM types_bien');
            typeResult.rows.forEach(row => {
                typeLocalToIdMap.set(row.libelle, row.id);
            });
        } finally {
            client.release();
        }

        const client2 = await pool.connect();
        try {
            await client2.query('BEGIN');

            let batchSize = 0;
            let batchTransactions = [];
            let totalInserted = 0;

            for (const data of transactions) {
                const communeId = communesMap.get(data.code_commune);
                const typeBienId = data.type_local ? typeLocalToIdMap.get(data.type_local) : null;

                if (communeId) {
                    batchTransactions.push({
                        date_mutation: data.date_mutation,
                        nature_mutation: data.nature_mutation,
                        valeur_fonciere: data.valeur_fonciere || null,
                        adresse_numero: data.adresse_numero || null,
                        adresse_suffixe: data.adresse_suffixe || null,
                        adresse_nom_voie: data.adresse_nom_voie || null,
                        adresse_code_voie: data.adresse_code_voie || null,
                        code_postal: data.code_postal || null,
                        commune_id: communeId,
                        type_bien_id: typeBienId,
                        surface_reelle_bati: data.surface_reelle_bati || null,
                        nombre_pieces: data.nombre_pieces_principales || null,
                        surface_terrain: data.surface_terrain || null,
                        longitude: data.longitude || null,
                        latitude: data.latitude || null
                    });

                    batchSize++;

                    if (batchSize >= 1000) {
                        await insertBatch(client2, batchTransactions);
                        totalInserted += batchSize;
                        console.log(`${totalInserted} transactions insérées...`);
                        batchTransactions = [];
                        batchSize = 0;
                    }
                }
            }

            if (batchSize > 0) {
                await insertBatch(client2, batchTransactions);
                totalInserted += batchSize;
            }

            console.log(`Insertion terminée : ${totalInserted} transactions au total`);
            await client2.query('COMMIT');
        } catch (error) {
            await client2.query('ROLLBACK');
            throw error;
        } finally {
            client2.release();
        }
    } catch (error) {
        console.error('Erreur lors du traitement du CSV:', error);
        throw error;
    }
}

async function insertBatch(client, transactions) {
    const valueStrings = [];
    const valueParams = [];
    let paramIndex = 1;

    transactions.forEach((transaction) => {
        const values = [
            transaction.date_mutation,
            transaction.nature_mutation,
            transaction.valeur_fonciere,
            transaction.adresse_numero,
            transaction.adresse_suffixe,
            transaction.adresse_nom_voie,
            transaction.adresse_code_voie,
            transaction.code_postal,
            transaction.commune_id,
            transaction.type_bien_id,
            transaction.surface_reelle_bati,
            transaction.nombre_pieces,
            transaction.surface_terrain,
            transaction.longitude,
            transaction.latitude
        ];

        const placeholders = values.map((_, i) => `$${paramIndex + i}`).join(', ');
        valueStrings.push(`(${placeholders})`);
        valueParams.push(...values);
        paramIndex += values.length;
    });

    if (valueStrings.length > 0) {
        const query = `
            INSERT INTO transactions (
                date_mutation, nature_mutation, valeur_fonciere, 
                adresse_numero, adresse_suffixe, adresse_nom_voie, adresse_code_voie, code_postal, 
                commune_id, type_bien_id, surface_reelle_bati, nombre_pieces, surface_terrain, 
                longitude, latitude
            ) VALUES ${valueStrings.join(', ')}
        `;

        await client.query(query, valueParams);
    }
}

async function main() {
    try {
        await downloadFile();
        await extractFile();
        await processCSV();
        console.log('Traitement terminé avec succès');
    } catch (error) {
        console.error('Erreur dans le processus:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

async function initMissingDepartements() {
    const client = await pool.connect();
    try {
        const deptCount = await client.query('SELECT COUNT(*) FROM departements');

        if (parseInt(deptCount.rows[0].count) === 0) {
            console.log('Aucun département trouvé. Initialisation des départements pour la France métropolitaine...');

            const departements = [
                {code: '01', nom: 'Ain', region_id: 84},
                {code: '02', nom: 'Aisne', region_id: 32},
                // Ajouter les autres départements selon vos besoins...
                {code: '75', nom: 'Paris', region_id: 11},
                {code: '76', nom: 'Seine-Maritime', region_id: 28},
                {code: '77', nom: 'Seine-et-Marne', region_id: 11},
                {code: '78', nom: 'Yvelines', region_id: 11},
                {code: '91', nom: 'Essonne', region_id: 11},
                {code: '92', nom: 'Hauts-de-Seine', region_id: 11},
                {code: '93', nom: 'Seine-Saint-Denis', region_id: 11},
                {code: '94', nom: 'Val-de-Marne', region_id: 11},
                {code: '95', nom: 'Val-d\'Oise', region_id: 11}
            ];

            for (const dept of departements) {
                await client.query(
                    'INSERT INTO departements (code, nom, region_id) VALUES ($1, $2, $3) ON CONFLICT (code) DO NOTHING',
                    [dept.code, dept.nom, dept.region_id]
                );
            }

            console.log('Départements initialisés.');
        }
    } catch (error) {
        console.error('Erreur lors de l\'initialisation des départements:', error);
    } finally {
        client.release();
    }
}

async function init() {
    try {
        await initMissingDepartements();
        await main();
    } catch (error) {
        console.error('Erreur d\'initialisation:', error);
        process.exit(1);
    }
}

init();