const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const csv = require('csv-parser');
const { Pool } = require('pg');
const { createReadStream } = require('fs');
const dotenv = require('dotenv');

dotenv.config();

// Connexion à PostgreSQL
const pool = new Pool({
    connectionString: process.env.POSTGRES_URI || 'postgres://postgres:postgres@localhost:5432/homepedia'
});

// Définition des URLs
const INCOME_URL = 'https://www.insee.fr/fr/statistiques/fichier/6692291/FILO2019_DISP_COM.zip';
const EDUCATION_URL = 'https://data.education.gouv.fr/api/records/1.0/download/?dataset=fr-en-adresse-et-geolocalisation-etablissements-premier-et-second-degre';

const DATA_DIR = path.join(__dirname, '../data');
const INCOME_PATH = path.join(DATA_DIR, 'income.zip');
const INCOME_EXTRACTED = path.join(DATA_DIR, 'income.csv');
const EDUCATION_PATH = path.join(DATA_DIR, 'education.csv');

async function downloadFile(url, outputPath) {
    console.log(`Téléchargement du fichier depuis ${url}...`);

    // S'assurer que le répertoire existe
    await fs.ensureDir(path.dirname(outputPath));

    const response = await axios({
        method: 'GET',
        url,
        responseType: 'stream'
    });

    const writer = fs.createWriteStream(outputPath);

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

async function extractZip(zipPath, outputDir) {
    console.log(`Extraction du fichier ${zipPath}...`);

    const extract = require('extract-zip');

    await fs.ensureDir(outputDir);
    await extract(zipPath, { dir: outputDir });

    console.log('Extraction terminée.');
}

async function processIncomeData(filePath) {
    console.log('Traitement des nouvelles données de revenus...');

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Créer la table si elle n'existe pas
        await client.query(`
      CREATE TABLE IF NOT EXISTS indicateurs_economiques_communes (
        id SERIAL PRIMARY KEY,
        commune_id INTEGER REFERENCES communes(id),
        annee INTEGER NOT NULL,
        revenu_median DECIMAL(10, 2),
        taux_chomage DECIMAL(5, 2),
        taux_pauvrete DECIMAL(5, 2),
        nb_entreprises INTEGER,
        date_maj TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(commune_id, annee)
      )
    `);

        const stream = createReadStream(filePath)
            .pipe(csv({
                separator: ';',
                mapHeaders: ({ header }) => header.trim(),
                mapValues: ({ value }) => value.trim()
            }));

        for await (const data of stream) {
            const codeCommune = data.codgeo;
            const annee = parseInt(data.an);
            const revenuMedian = parseFloat(data.med_disp.replace(',', '.')) || null;

            if (!codeCommune || !annee || !revenuMedian) continue;

            const communeResult = await client.query(
                'SELECT id FROM communes WHERE code_insee = $1',
                [codeCommune]
            );

            if (communeResult.rows.length > 0) {
                const communeId = communeResult.rows[0].id;

                const exists = await client.query(
                    'SELECT id FROM indicateurs_economiques_communes WHERE commune_id = $1 AND annee = $2',
                    [communeId, annee]
                );

                if (exists.rows.length === 0) {
                    await client.query(`
            INSERT INTO indicateurs_economiques_communes (
              commune_id, annee, revenu_median, date_maj
            ) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
          `, [communeId, annee, revenuMedian]);
                }
            }
        }

        await client.query('COMMIT');
        console.log('Importation des nouvelles données de revenus terminée.');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erreur pendant le traitement des données de revenus:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function processEducationData(filePath) {
    console.log('Traitement des données d\'éducation...');

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        await client.query(`
            CREATE TABLE IF NOT EXISTS indicateurs_education_communes (
                id SERIAL PRIMARY KEY,
                commune_id INTEGER REFERENCES communes(id),
                annee INTEGER NOT NULL,
                nb_ecoles_primaires INTEGER,
                nb_colleges INTEGER,
                nb_lycees INTEGER,
                nb_universites INTEGER,
                date_maj TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(commune_id, annee)
            )
        `);

        const schoolCounts = {};

        const stream = createReadStream(filePath)
            .pipe(csv({ separator: ';' }));

        for await (const data of stream) {
            const codeCommune = data.code_commune;
            const typeEtablissement = data.nature_uai_libe;

            if (codeCommune && typeEtablissement) {
                if (!schoolCounts[codeCommune]) {
                    schoolCounts[codeCommune] = {
                        primaire: 0,
                        college: 0,
                        lycee: 0,
                        universite: 0
                    };
                }

                const type = typeEtablissement.toUpperCase();

                if (type.includes('ECOLE')) {
                    schoolCounts[codeCommune].primaire++;
                } else if (type.includes('COLLEGE')) {
                    schoolCounts[codeCommune].college++;
                } else if (type.includes('LYCEE')) {
                    schoolCounts[codeCommune].lycee++;
                } else if (type.includes('UNIVERSITE') || type.includes('SUP')) {
                    schoolCounts[codeCommune].universite++;
                }
            }
        }

        for (const [codeCommune, counts] of Object.entries(schoolCounts)) {
            const communeResult = await client.query(
                'SELECT id FROM communes WHERE code_insee = $1',
                [codeCommune]
            );

            if (communeResult.rows.length > 0) {
                const communeId = communeResult.rows[0].id;

                const checkResult = await client.query(
                    'SELECT id FROM indicateurs_education_communes WHERE commune_id = $1 AND annee = $2',
                    [communeId, 2022]
                );

                if (checkResult.rows.length === 0) {
                    await client.query(`
                        INSERT INTO indicateurs_education_communes (
                            commune_id, annee, nb_ecoles_primaires, nb_colleges, nb_lycees, nb_universites, date_maj
                        ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
                    `, [
                        communeId,
                        2022,
                        counts.primaire,
                        counts.college,
                        counts.lycee,
                        counts.universite
                    ]);
                }
            } else {
                console.warn(`Commune INSEE ${codeCommune} non trouvée dans la base`);
            }
        }

        await client.query('COMMIT');
        console.log('Importation des données d\'éducation terminée.');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erreur pendant le traitement des données d\'éducation:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function main() {
    try {
        // Télécharger les fichiers
        await downloadFile(EDUCATION_URL, EDUCATION_PATH);

        // Traiter les données
        await processIncomeData(INCOME_EXTRACTED);
        await processEducationData(EDUCATION_PATH);

        console.log('Collecte et traitement des données socio-économiques terminés avec succès.');
    } catch (error) {
        console.error('Erreur lors de la collecte ou du traitement des données:', error);
    } finally {
        // Fermer la connexion à la base de données
        pool.end();
    }
}

// Exécuter le script
main();