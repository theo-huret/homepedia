const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// Connexion à PostgreSQL
const pool = new Pool({
    connectionString: process.env.POSTGRES_URI || 'postgres://postgres:postgres@localhost:5432/homepedia'
});

async function aggregatePricesCommunes() {
    console.log('Agrégation des prix moyens par commune...');

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Supprimer les données existantes
        await client.query('TRUNCATE TABLE prix_moyens_communes');

        // Agréger par commune, type de bien, année et trimestre
        await client.query(`
      INSERT INTO prix_moyens_communes (
        commune_id, type_bien_id, annee, trimestre, prix_moyen_m2, nombre_transactions
      )
      SELECT 
        commune_id,
        type_bien_id,
        EXTRACT(YEAR FROM date_mutation) AS annee,
        EXTRACT(QUARTER FROM date_mutation) AS trimestre,
        CASE 
          WHEN SUM(surface_reelle_bati) > 0 
          THEN SUM(valeur_fonciere) / SUM(surface_reelle_bati)
          ELSE NULL
        END AS prix_moyen_m2,
        COUNT(*) AS nombre_transactions
      FROM transactions
      WHERE 
        commune_id IS NOT NULL AND
        type_bien_id IS NOT NULL AND
        surface_reelle_bati > 0 AND
        valeur_fonciere > 0
      GROUP BY commune_id, type_bien_id, annee, trimestre
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

        // Vérifier si la table existe, sinon la créer
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

        // Supprimer les données existantes
        await client.query('TRUNCATE TABLE prix_moyens_departements');

        // Agréger par département, type de bien, année et trimestre
        await client.query(`
      INSERT INTO prix_moyens_departements (
        departement_id, type_bien_id, annee, trimestre, prix_moyen_m2, nombre_transactions
      )
      SELECT 
        d.id AS departement_id,
        t.type_bien_id,
        t.annee,
        t.trimestre,
        AVG(t.prix_moyen_m2) AS prix_moyen_m2,
        SUM(t.nombre_transactions) AS nombre_transactions
      FROM prix_moyens_communes t
      JOIN communes c ON t.commune_id = c.id
      JOIN departements d ON c.departement_id = d.id
      GROUP BY d.id, t.type_bien_id, t.annee, t.trimestre
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

async function main() {
    try {
        await aggregatePricesCommunes();
        await aggregatePricesDepartements();

        console.log('Agrégation des prix immobiliers terminée avec succès.');
    } catch (error) {
        console.error('Erreur lors de l\'agrégation des prix:', error);
    } finally {
        // Fermer la connexion à la base de données
        pool.end();
    }
}

// Exécuter le script
main();