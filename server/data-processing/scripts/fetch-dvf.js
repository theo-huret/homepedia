const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const csv = require('csv-parser');
const { pipeline } = require('stream/promises');
const { createReadStream, createWriteStream } = require('fs');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// Connexion à PostgreSQL
const pool = new Pool({
    connectionString: process.env.POSTGRES_URI || 'postgres://postgres:postgres@localhost:5432/homepedia'
});

// Définition des URLs
const DVF_URL = 'https://files.data.gouv.fr/geo-dvf/latest/csv/2022/full.csv.gz';
const DATA_DIR = path.join(__dirname, '../data');
const FILE_PATH = path.join(DATA_DIR, 'dvf_2022.csv.gz');
const EXTRACTED_PATH = path.join(DATA_DIR, 'dvf_2022.csv');

// Mapping des colonnes (basé sur les exemples fournis)
const COLUMN_MAPPING = {
    '_0': 'id_mutation',
    '_1': 'date_mutation',
    '_2': 'numero_disposition',
    '_3': 'nature_mutation',
    '_4': 'valeur_fonciere',
    '_5': 'adresse_numero',
    '_6': 'adresse_suffixe',
    '_7': 'adresse_nom_voie',
    '_8': 'adresse_code_voie',
    '_9': 'code_postal',
    '_10': 'code_commune',
    '_11': 'nom_commune',
    '_12': 'code_departement',
    // Ajout d'autres mappings basés sur l'exemple et le schéma
    '_28': 'nombre_lots',
    '_29': 'code_type_local',
    '_30': 'type_local',
    '_31': 'surface_reelle_bati',
    '_32': 'nombre_pieces_principales',
    '_33': 'code_nature_culture',
    '_34': 'nature_culture',
    '_37': 'surface_terrain',
    '_38': 'longitude',
    '_39': 'latitude'
};

async function downloadFile(url, outputPath) {
    console.log(`Téléchargement du fichier depuis ${url}...`);

    // S'assurer que le répertoire existe
    await fs.ensureDir(path.dirname(outputPath));

    // Télécharger en streaming
    const response = await axios({
        method: 'GET',
        url,
        responseType: 'stream'
    });

    const writer = createWriteStream(outputPath);

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

async function extractFile(inputPath, outputPath) {
    console.log('Extraction du fichier...');

    // Nous utilisons gunzip à partir de zlib
    const { createGunzip } = require('zlib');

    await pipeline(
        createReadStream(inputPath),
        createGunzip(),
        createWriteStream(outputPath)
    );

    console.log('Extraction terminée.');
}

async function processDVF(filePath) {
    console.log('Traitement des données DVF...');

    // Transaction pour l'insertion par lots
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        let count = 0;
        let skipped = 0;
        const batchSize = 1000;
        let batch = [];

        // Créer un stream de lecture du CSV
        const stream = createReadStream(filePath)
            .pipe(csv({
                separator: ',',
                headers: true,
                skipLines: 0
            }));

        // Afficher les en-têtes pour débogage
        stream.on('headers', (headers) => {
            console.log('En-têtes détectés:', headers.join(', '));
        });

        // Traiter le stream ligne par ligne
        for await (const rawData of stream) {
            // Convertir les noms de colonnes génériques (_0, _1, etc.) en noms descriptifs
            const data = {};
            for (const [genericKey, value] of Object.entries(rawData)) {
                const descriptiveKey = COLUMN_MAPPING[genericKey] || genericKey;
                data[descriptiveKey] = value;
            }

            // Afficher les 3 premières lignes pour débogage (après conversion)
            if (count < 3) {
                console.log(`Ligne convertie ${count + 1}:`, JSON.stringify({
                    id_mutation: data.id_mutation,
                    date_mutation: data.date_mutation,
                    code_commune: data.code_commune,
                    nom_commune: data.nom_commune,
                    type_local: data.type_local
                }));
            }

            // Vérifier que les champs essentiels sont présents
            if (!data.code_commune || !data.date_mutation) {
                skipped++;
                continue;
            }

            // Transformer les données pour correspondre à notre schéma
            const transaction = {
                id_mutation: data.id_mutation,
                date_mutation: data.date_mutation,
                nature_mutation: data.nature_mutation,
                valeur_fonciere: data.valeur_fonciere ? parseFloat(data.valeur_fonciere) : null,
                adresse_numero: data.adresse_numero,
                adresse_suffixe: data.adresse_suffixe,
                adresse_nom_voie: data.adresse_nom_voie,
                adresse_code_voie: data.adresse_code_voie,
                code_postal: data.code_postal,
                code_commune: data.code_commune,
                nom_commune: data.nom_commune,
                type_local: data.type_local,
                surface_reelle_bati: data.surface_reelle_bati ? parseFloat(data.surface_reelle_bati) : null,
                nombre_pieces_principales: data.nombre_pieces_principales ? parseInt(data.nombre_pieces_principales) : null,
                surface_terrain: data.surface_terrain ? parseFloat(data.surface_terrain) : null,
                longitude: data.longitude ? parseFloat(data.longitude) : null,
                latitude: data.latitude ? parseFloat(data.latitude) : null
            };

            // Ajouter au lot actuel
            batch.push(transaction);
            count++;

            // Insérer par lots pour de meilleures performances
            if (batch.length >= batchSize) {
                await insertBatch(client, batch);
                batch = [];
                console.log(`${count} transactions traitées, ${skipped} ignorées...`);
            }

            // Limiter le nombre de transactions pour les tests
            if (count >= 10000) {
                console.log('Limite de 10 000 entrées atteinte. Arrêt du traitement.');
                break;
            }
        }

        // Insérer le dernier lot s'il reste des données
        if (batch.length > 0) {
            await insertBatch(client, batch);
        }

        await client.query('COMMIT');
        console.log(`Traitement terminé. ${count} transactions importées, ${skipped} ignorées.`);

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erreur pendant le traitement des données:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function insertBatch(client, batch) {
    // Nous allons d'abord récupérer ou insérer les communes si nécessaires
    const communeEntries = [...new Set(batch.map(t => `${t.code_commune}:${t.nom_commune}`))];
    const communeMap = new Map();

    for (const communeEntry of communeEntries) {
        const [codeCommune, nomCommune] = communeEntry.split(':');

        if (!codeCommune) continue; // Ignorer les codes vides

        try {
            // S'assurer que le code_insee est une chaîne et qu'il a la bonne longueur
            const codeInsee = String(codeCommune).padStart(5, '0');

            // Vérifier si la commune existe
            const communeResult = await client.query(
                'SELECT id FROM communes WHERE code_insee = $1',
                [codeInsee]
            );

            if (communeResult.rows.length > 0) {
                // La commune existe déjà
                communeMap.set(codeCommune, communeResult.rows[0].id);
                console.log(`Commune existante: ${codeInsee} (${nomCommune})`);
            } else {
                // Si la commune n'existe pas, on l'insère avec toutes les colonnes requises
                const newCommune = await client.query(`
                    INSERT INTO communes (
                        code_insee, 
                        nom, 
                        code_postal
                    ) VALUES ($1, $2, $3) RETURNING id`,
                    [
                        codeInsee,
                        nomCommune || `Commune ${codeInsee}`,
                        batch.find(t => t.code_commune === codeCommune)?.code_postal || null
                    ]
                );

                communeMap.set(codeCommune, newCommune.rows[0].id);
                console.log(`Commune créée: ${codeInsee} (${nomCommune})`);
            }
        } catch (error) {
            console.error(`Erreur lors du traitement de la commune ${codeCommune}:`, error.message);
            // Afficher les détails de l'erreur pour le débogage
            console.error("Détails:", error);
        }
    }

    // Ensuite, on fait de même pour les types de bien
    const typeLocaux = [...new Set(batch.map(t => t.type_local).filter(Boolean))];
    const typeBienMap = new Map();

    for (const typeLocal of typeLocaux) {
        try {
            // Standardiser le code
            const typeBienCode = typeLocal.toUpperCase().replace(/[^A-Z0-9_]/g, '_');

            const typeResult = await client.query(
                'SELECT id FROM types_bien WHERE code = $1 OR libelle = $2',
                [typeBienCode, typeLocal]
            );

            if (typeResult.rows.length > 0) {
                typeBienMap.set(typeLocal, typeResult.rows[0].id);
            } else {
                const newType = await client.query(
                    'INSERT INTO types_bien (code, libelle) VALUES ($1, $2) RETURNING id',
                    [typeBienCode, typeLocal]
                );
                typeBienMap.set(typeLocal, newType.rows[0].id);
                console.log(`Type de bien créé: ${typeBienCode} (${typeLocal})`);
            }
        } catch (error) {
            console.error(`Erreur lors du traitement du type de bien ${typeLocal}:`, error.message);
        }
    }

    // Maintenant, insérer les transactions
    let inserted = 0;
    let failed = 0;

    for (const transaction of batch) {
        try {
            const communeId = communeMap.get(transaction.code_commune);

            if (!communeId) {
                console.log(`Commune non trouvée pour le code: ${transaction.code_commune}`);
                failed++;
                continue;
            }

            // Récupérer l'ID du type de bien
            let typeBienId = null;
            if (transaction.type_local) {
                typeBienId = typeBienMap.get(transaction.type_local);
            }

            // Insérer la transaction
            await client.query(`
                INSERT INTO transactions (
                  date_mutation, nature_mutation, valeur_fonciere, 
                  adresse_numero, adresse_suffixe, adresse_nom_voie, adresse_code_voie,
                  code_postal, commune_id, type_bien_id, surface_reelle_bati, 
                  nombre_pieces, surface_terrain, longitude, latitude
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            `, [
                transaction.date_mutation,
                transaction.nature_mutation,
                transaction.valeur_fonciere,
                transaction.adresse_numero,
                transaction.adresse_suffixe,
                transaction.adresse_nom_voie,
                transaction.adresse_code_voie,
                transaction.code_postal,
                communeId,
                typeBienId,
                transaction.surface_reelle_bati,
                transaction.nombre_pieces_principales,
                transaction.surface_terrain,
                transaction.longitude,
                transaction.latitude
            ]);

            inserted++;
        } catch (error) {
            failed++;
            if (failed < 5) {
                console.error(`Erreur lors de l'insertion de la transaction ${transaction.id_mutation}:`, error.message);
            }
        }
    }

    console.log(`Lot traité: ${inserted} insertions réussies, ${failed} échecs`);
}

async function main() {
    try {
        // S'assurer que le répertoire existe
        await fs.ensureDir(DATA_DIR);

        // Télécharger le fichier
        await downloadFile(DVF_URL, FILE_PATH);

        // Extraire le fichier
        await extractFile(FILE_PATH, EXTRACTED_PATH);

        // Traiter les données
        await processDVF(EXTRACTED_PATH);

        console.log('Collecte et traitement des données DVF terminés avec succès.');
    } catch (error) {
        console.error('Erreur lors de la collecte ou du traitement des données:', error);
    } finally {
        // Fermer la connexion à la base de données
        pool.end();
    }
}

// Exécuter le script
main();