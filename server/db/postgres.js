const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
    connectionString: process.env.POSTGRES_URI || 'postgres://postgres:postgres@localhost:5432/homepedia'
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    getClient: async () => {
        const client = await pool.connect();
        const query = client.query;
        const release = client.release;

        // Redéfinition pour les logs
        client.query = (...args) => {
            console.log('Exécution de la requête:', args[0]);
            return query.apply(client, args);
        };

        client.release = () => {
            console.log('Connexion client retournée au pool');
            return release.apply(client);
        };

        return client;
    }
};