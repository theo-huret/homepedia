const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
    connectionString: process.env.POSTGRES_URI || 'postgres://postgres:postgres@localhost:5432/homepedia'
});

async function aggregatePricesCommunes() {
    console.log('Agrégation des prix moyens par commune...');

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Réinitialisation de la table des prix moyens par commune
        await client.query('TRUNCATE TABLE prix_moyens_communes');

        await client.query(`
      INSERT INTO prix_moyens_communes (
        commune_id, type_bien_id, annee, trimestre, prix_moyen_m2, nombre_transactions
      )
      WITH filtered_transactions AS (
        SELECT 
          t.commune_id,
          t.type_bien_id,
          EXTRACT(YEAR FROM t.date_mutation) AS annee,
          EXTRACT(QUARTER FROM t.date_mutation) AS trimestre,
          t.valeur_fonciere,
          t.surface_reelle_bati
        FROM transactions t
        WHERE
          t.commune_id IS NOT NULL AND
          t.type_bien_id IS NOT NULL AND
          t.surface_reelle_bati IS NOT NULL AND
          t.surface_reelle_bati > 9 AND -- Surface minimum réaliste
          t.valeur_fonciere > 10000 AND -- Prix minimum réaliste
          t.valeur_fonciere / t.surface_reelle_bati < 6000 -- Filtre de prix maximum général
      )
      SELECT 
        commune_id,
        type_bien_id,
        annee,
        trimestre,
        CASE 
          WHEN SUM(surface_reelle_bati) > 0 THEN SUM(valeur_fonciere) / SUM(surface_reelle_bati)
          ELSE NULL
        END AS prix_moyen_m2,
        COUNT(*) AS nombre_transactions
      FROM filtered_transactions
      GROUP BY commune_id, type_bien_id, annee, trimestre
      HAVING COUNT(*) >= 10 -- Minimum 10 transactions pour améliorer la fiabilité statistique
    `);

        await client.query('COMMIT');
        console.log('Agrégation des prix par commune terminée.');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erreur pendant l\'agrégation des prix par commune:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function aggregatePricesDepartements() {
    console.log('Agrégation des prix moyens par département...');

    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        await client.query(`
      CREATE TABLE IF NOT EXISTS prix_moyens_departements (
        id SERIAL PRIMARY KEY,
        departement_id INTEGER REFERENCES departements(id),
        type_bien_id INTEGER REFERENCES types_bien(id),
        annee INTEGER NOT NULL,
        trimestre INTEGER,
        prix_moyen_m2 DECIMAL(10, 2),
        nombre_transactions INTEGER,
        date_maj TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(departement_id, type_bien_id, annee, trimestre)
      )
    `);

        await client.query('TRUNCATE TABLE prix_moyens_departements');
        await client.query(`
      INSERT INTO prix_moyens_departements (
        departement_id, type_bien_id, annee, trimestre, prix_moyen_m2, nombre_transactions
      )
      SELECT 
        d.id AS departement_id,
        t.type_bien_id,
        t.annee,
        t.trimestre,
        -- Calcul pondéré par le nombre de transactions
        SUM(t.prix_moyen_m2 * t.nombre_transactions) / SUM(t.nombre_transactions) AS prix_moyen_m2,
        SUM(t.nombre_transactions) AS nombre_transactions
      FROM prix_moyens_communes t
      JOIN communes c ON t.commune_id = c.id
      JOIN departements d ON c.departement_id = d.id
      GROUP BY d.id, t.type_bien_id, t.annee, t.trimestre
      HAVING SUM(t.nombre_transactions) >= 20 -- Minimum 20 transactions par département/trimestre
    `);

        await client.query('COMMIT');
        console.log('Agrégation des prix par département terminée.');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erreur pendant l\'agrégation des prix par département:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function fillMissingPriceData() {
    console.log('Correction des données anormales...');

    const client = await pool.connect();

    try {
        // Repérer et corriger les communes avec prix anormalement élevés
        await client.query(`
            UPDATE prix_moyens_communes 
            SET prix_moyen_m2 = NULL
            WHERE prix_moyen_m2 > 8000  -- Définit un maximum plus raisonnable
            OR nombre_transactions < 5
        `);

        // S'assurer que les départements ont des prix cohérents
        await client.query(`
            UPDATE prix_moyens_departements
            SET prix_moyen_m2 = NULL
            WHERE prix_moyen_m2 > 7000  -- Maximum pour un département entier
            OR nombre_transactions < 10
        `);

        // Détection des anomalies statistiques (écarts importants)
        const detectQuery = `
            WITH dept_avg AS (
                SELECT 
                    c.departement_id,
                    t.type_bien_id,
                    AVG(t.prix_moyen_m2) AS dept_prix_moyen_m2
                FROM prix_moyens_communes t
                JOIN communes c ON t.commune_id = c.id
                GROUP BY c.departement_id, t.type_bien_id
            )
            UPDATE prix_moyens_communes pmc
            SET prix_moyen_m2 = NULL
            FROM communes c, dept_avg da
            WHERE pmc.commune_id = c.id
            AND c.departement_id = da.departement_id
            AND pmc.type_bien_id = da.type_bien_id
            AND pmc.prix_moyen_m2 > da.dept_prix_moyen_m2 * 2.5  -- 2.5x la moyenne départementale
        `;

        await client.query(detectQuery);

        console.log('Correction des données terminée.');
    } catch (error) {
        console.error('Erreur pendant la correction des données:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function main() {
    try {
        await aggregatePricesCommunes();
        await aggregatePricesDepartements();
        await fillMissingPriceData();

        console.log('Agrégation des prix immobiliers terminée avec succès.');
    } catch (error) {
        console.error('Erreur lors de l\'agrégation des prix:', error);
    } finally {
        pool.end();
    }
}

main();