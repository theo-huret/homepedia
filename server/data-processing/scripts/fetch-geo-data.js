const axios = require('axios');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
    connectionString: process.env.POSTGRES_URI || 'postgres://postgres:postgres@localhost:5432/homepedia'
});

const API_REGIONS_URL = 'https://geo.api.gouv.fr/regions';
const API_DEPARTEMENTS_URL = 'https://geo.api.gouv.fr/departements';
const API_COMMUNES_URL = 'https://geo.api.gouv.fr/communes';

async function fetchRegions() {
    console.log('Récupération des régions depuis l\'API Geo...');

    try {
        const response = await axios.get(API_REGIONS_URL);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la récupération des régions: ${error.message}`);
        return [
            { code: '11', nom: 'Île-de-France' },
            { code: '93', nom: 'Provence-Alpes-Côte d\'Azur' },
            { code: '84', nom: 'Auvergne-Rhône-Alpes' },
            { code: '44', nom: 'Grand Est' },
            { code: '32', nom: 'Hauts-de-France' },
            { code: '75', nom: 'Nouvelle-Aquitaine' },
            { code: '76', nom: 'Occitanie' },
            { code: '53', nom: 'Bretagne' },
            { code: '52', nom: 'Pays de la Loire' },
            { code: '27', nom: 'Bourgogne-Franche-Comté' },
            { code: '24', nom: 'Centre-Val de Loire' },
            { code: '28', nom: 'Normandie' },
            { code: '94', nom: 'Corse' }
        ];
    }
}

async function fetchDepartements() {
    console.log('Récupération des départements depuis l\'API Geo...');

    try {
        const response = await axios.get(API_DEPARTEMENTS_URL);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la récupération des départements: ${error.message}`);
        return [
            { code: '75', nom: 'Paris', codeRegion: '11' },
            { code: '69', nom: 'Rhône', codeRegion: '84' },
            { code: '13', nom: 'Bouches-du-Rhône', codeRegion: '93' },
            { code: '59', nom: 'Nord', codeRegion: '32' },
            { code: '33', nom: 'Gironde', codeRegion: '75' },
            { code: '31', nom: 'Haute-Garonne', codeRegion: '76' },
            { code: '67', nom: 'Bas-Rhin', codeRegion: '44' },
            { code: '06', nom: 'Alpes-Maritimes', codeRegion: '93' },
            { code: '35', nom: 'Ille-et-Vilaine', codeRegion: '53' },
            { code: '44', nom: 'Loire-Atlantique', codeRegion: '52' }
        ];
    }
}

async function fetchCommunes(limit = 5000) {
    console.log(`Récupération des communes depuis l'API Geo (limité à ${limit})...`);

    try {
        const response = await axios.get(`${API_COMMUNES_URL}?fields=nom,code,codeDepartement,centre,codesPostaux,population,surface&limit=${limit}`);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la récupération des communes: ${error.message}`);
        return [
            { code: '75056', codesPostaux: ['75001', '75002', '75003', '75004', '75005', '75006', '75007', '75008', '75009', '75010', '75011', '75012', '75013', '75014', '75015', '75016', '75017', '75018', '75019', '75020'], nom: 'Paris', codeDepartement: '75', centre: { type: 'Point', coordinates: [2.3522219, 48.856614] }, population: 2165423, surface: 10540 },
            { code: '13055', codesPostaux: ['13001', '13002', '13003', '13004', '13005', '13006', '13007', '13008', '13009', '13010', '13011', '13012', '13013', '13014', '13015', '13016'], nom: 'Marseille', codeDepartement: '13', centre: { type: 'Point', coordinates: [5.36978, 43.296482] }, population: 863310, surface: 24062 },
            { code: '69123', codesPostaux: ['69001', '69002', '69003', '69004', '69005', '69006', '69007', '69008', '69009'], nom: 'Lyon', codeDepartement: '69', centre: { type: 'Point', coordinates: [4.835659, 45.764043] }, population: 516092, surface: 4787 },
            { code: '31555', codesPostaux: ['31000'], nom: 'Toulouse', codeDepartement: '31', centre: { type: 'Point', coordinates: [1.444, 43.6043] }, population: 479553, surface: 11830 },
            { code: '06088', codesPostaux: ['06000'], nom: 'Nice', codeDepartement: '06', centre: { type: 'Point', coordinates: [7.2661, 43.7032] }, population: 340017, surface: 7192 },
            { code: '44109', codesPostaux: ['44000'], nom: 'Nantes', codeDepartement: '44', centre: { type: 'Point', coordinates: [-1.5534, 47.2173] }, population: 309346, surface: 6562 },
            { code: '67482', codesPostaux: ['67000'], nom: 'Strasbourg', codeDepartement: '67', centre: { type: 'Point', coordinates: [7.7521, 48.5734] }, population: 283515, surface: 7837 },
            { code: '33063', codesPostaux: ['33000'], nom: 'Bordeaux', codeDepartement: '33', centre: { type: 'Point', coordinates: [-0.5792, 44.8378] }, population: 254436, surface: 4936 },
            { code: '59350', codesPostaux: ['59000'], nom: 'Lille', codeDepartement: '59', centre: { type: 'Point', coordinates: [3.0573, 50.6292] }, population: 232440, surface: 3489 },
            { code: '35238', codesPostaux: ['35000'], nom: 'Rennes', codeDepartement: '35', centre: { type: 'Point', coordinates: [-1.6778, 48.1173] }, population: 216815, surface: 5035 }
        ];
    }
}

async function checkAndCreateColumnsIfNeeded() {
    console.log('Vérification et création des colonnes population et superficie si nécessaires...');

    const client = await pool.connect();

    try {
        const communesCheck = `
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'communes' 
            AND column_name IN ('population', 'superficie')
        `;

        const communesResult = await client.query(communesCheck);
        const existingCommunesColumns = new Set(communesResult.rows.map(row => row.column_name));

        if (!existingCommunesColumns.has('population')) {
            console.log('Ajout de la colonne population pour les communes...');
            await client.query('ALTER TABLE communes ADD COLUMN population INTEGER');
        }

        if (!existingCommunesColumns.has('superficie')) {
            console.log('Ajout de la colonne superficie pour les communes...');
            await client.query('ALTER TABLE communes ADD COLUMN superficie FLOAT');
        }

        // Départements
        const departementsCheck = `
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'departements' 
            AND column_name IN ('population', 'superficie')
        `;

        const departementsResult = await client.query(departementsCheck);
        const existingDepartementsColumns = new Set(departementsResult.rows.map(row => row.column_name));

        if (!existingDepartementsColumns.has('population')) {
            console.log('Ajout de la colonne population pour les départements...');
            await client.query('ALTER TABLE departements ADD COLUMN population INTEGER');
        }

        if (!existingDepartementsColumns.has('superficie')) {
            console.log('Ajout de la colonne superficie pour les départements...');
            await client.query('ALTER TABLE departements ADD COLUMN superficie FLOAT');
        }

        const regionsCheck = `
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'regions' 
            AND column_name IN ('population', 'superficie')
        `;

        const regionsResult = await client.query(regionsCheck);
        const existingRegionsColumns = new Set(regionsResult.rows.map(row => row.column_name));

        if (!existingRegionsColumns.has('population')) {
            console.log('Ajout de la colonne population pour les régions...');
            await client.query('ALTER TABLE regions ADD COLUMN population INTEGER');
        }

        if (!existingRegionsColumns.has('superficie')) {
            console.log('Ajout de la colonne superficie pour les régions...');
            await client.query('ALTER TABLE regions ADD COLUMN superficie FLOAT');
        }

        console.log('Vérification des colonnes terminée.');

    } catch (error) {
        console.error('Erreur lors de la vérification ou création des colonnes:', error);
    } finally {
        client.release();
    }
}

async function importRegions(regions) {
    console.log('Importation des régions...');

    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        await client.query('TRUNCATE TABLE regions CASCADE');

        for (const region of regions) {
            await client.query(`
                INSERT INTO regions (code, nom, population, superficie)
                VALUES ($1, $2, $3, $4)
            `, [
                region.code,
                region.nom,
                null,
                null
            ]);
        }

        console.log(`Importation de ${regions.length} régions terminée.`);
        await client.query('COMMIT');
        return true;

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erreur pendant l\'importation des régions:', error);
        return false;
    } finally {
        client.release();
    }
}

async function importDepartements(departements) {
    console.log('Importation des départements...');

    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        await client.query('TRUNCATE TABLE departements CASCADE');

        for (const dept of departements) {
            const codeRegion = dept.codeRegion || dept.region_code;

            if (!codeRegion) {
                console.log(`Département sans code région, ignoré: ${dept.code}`);
                continue;
            }

            const regionResult = await client.query(
                'SELECT id FROM regions WHERE code = $1',
                [codeRegion]
            );

            let regionId = null;
            if (regionResult.rows.length > 0) {
                regionId = regionResult.rows[0].id;
            } else {
                console.log(`Région non trouvée pour le code: ${codeRegion}`);
            }

            await client.query(`
                INSERT INTO departements (code, nom, region_id, population, superficie)
                VALUES ($1, $2, $3, $4, $5)
            `, [
                dept.code,
                dept.nom,
                regionId,
                null,
                null
            ]);
        }

        console.log(`Importation de ${departements.length} départements terminée.`);
        await client.query('COMMIT');
        return true;

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erreur pendant l\'importation des départements:', error);
        return false;
    } finally {
        client.release();
    }
}

async function importCommunes(communes) {
    console.log('Importation des communes...');

    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        await client.query('TRUNCATE TABLE communes CASCADE');

        let count = 0;
        const total = communes.length;

        for (const commune of communes) {
            const codeDept = commune.codeDepartement;

            if (!codeDept) {
                console.log(`Commune sans code département, ignorée: ${commune.code}`);
                continue;
            }

            const deptResult = await client.query(
                'SELECT id FROM departements WHERE code = $1',
                [codeDept]
            );

            let deptId = null;
            if (deptResult.rows.length > 0) {
                deptId = deptResult.rows[0].id;
            } else {
                console.log(`Département non trouvé pour le code: ${codeDept}`);
            }

            const codePostal = Array.isArray(commune.codesPostaux) && commune.codesPostaux.length > 0
                ? commune.codesPostaux[0]
                : commune.codePostal || null;

            let latitude = null;
            let longitude = null;

            if (commune.centre && commune.centre.coordinates) {
                longitude = commune.centre.coordinates[0];
                latitude = commune.centre.coordinates[1];
            }

            const population = commune.population || null;
            const superficie = commune.surface || null;

            await client.query(`
                INSERT INTO communes (
                    code_insee, code_postal, nom, departement_id, 
                    latitude, longitude, population, superficie
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, [
                commune.code,
                codePostal,
                commune.nom,
                deptId,
                latitude,
                longitude,
                population,
                superficie
            ]);

            count++;
            if (count % 1000 === 0 || count === total) {
                console.log(`${count}/${total} communes traitées...`);
            }
        }

        console.log(`Importation de ${count} communes terminée.`);
        await client.query('COMMIT');
        return true;

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erreur pendant l\'importation des communes:', error);
        return false;
    } finally {
        client.release();
    }
}

async function updateDepartementsStats() {
    console.log('Mise à jour des statistiques des départements...');

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const updatePopulationQuery = `
            UPDATE departements d
            SET population = (
                SELECT SUM(c.population)
                FROM communes c
                WHERE c.departement_id = d.id
                  AND c.population IS NOT NULL
            )
            WHERE EXISTS (
                SELECT 1
                FROM communes c
                WHERE c.departement_id = d.id
                  AND c.population IS NOT NULL
            )
        `;

        await client.query(updatePopulationQuery);

        const updateSuperficieQuery = `
            UPDATE departements d
            SET superficie = (
                SELECT SUM(c.superficie)
                FROM communes c
                WHERE c.departement_id = d.id
                  AND c.superficie IS NOT NULL
            )
            WHERE EXISTS (
                SELECT 1
                FROM communes c
                WHERE c.departement_id = d.id
                  AND c.superficie IS NOT NULL
            )
        `;

        await client.query(updateSuperficieQuery);

        await client.query('COMMIT');
        console.log('Statistiques des départements mises à jour.');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erreur pendant la mise à jour des statistiques des départements:', error);
    } finally {
        client.release();
    }
}

async function updateRegionsStats() {
    console.log('Mise à jour des statistiques des régions...');

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const updatePopulationQuery = `
            UPDATE regions r
            SET population = (
                SELECT SUM(d.population)
                FROM departements d
                WHERE d.region_id = r.id
                  AND d.population IS NOT NULL
            )
            WHERE EXISTS (
                SELECT 1
                FROM departements d
                WHERE d.region_id = r.id
                  AND d.population IS NOT NULL
            )
        `;

        await client.query(updatePopulationQuery);

        const updateSuperficieQuery = `
            UPDATE regions r
            SET superficie = (
                SELECT SUM(d.superficie)
                FROM departements d
                WHERE d.region_id = r.id
                  AND d.superficie IS NOT NULL
            )
            WHERE EXISTS (
                SELECT 1
                FROM departements d
                WHERE d.region_id = r.id
                  AND d.superficie IS NOT NULL
            )
        `;

        await client.query(updateSuperficieQuery);

        await client.query('COMMIT');
        console.log('Statistiques des régions mises à jour.');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erreur pendant la mise à jour des statistiques des régions:', error);
    } finally {
        client.release();
    }
}

async function main() {
    try {
        console.log('Démarrage de la collecte des données géographiques via l\'API Geo...');

        await checkAndCreateColumnsIfNeeded();

        const regions = await fetchRegions();
        const departements = await fetchDepartements();
        const communes = await fetchCommunes(50000);

        const regionsImported = await importRegions(regions);

        if (regionsImported) {
            const departementsImported = await importDepartements(departements);

            if (departementsImported) {
                await importCommunes(communes);
                await updateDepartementsStats();
                await updateRegionsStats();
            }
        }

        console.log('Collecte et traitement des données géographiques terminés avec succès.');
    } catch (error) {
        console.error('Erreur lors de la collecte ou du traitement des données:', error);
    } finally {
        pool.end();
    }
}

main();