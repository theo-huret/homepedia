const { Pool } = require('pg');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const pgPool = new Pool({
    connectionString: process.env.POSTGRES_URI || 'postgres://postgres:postgres@localhost:5432/homepedia'
});

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/homepedia';
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then()
    .catch(err => console.log('MongoDB Connection Error:', err));

const pgQuery = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pgPool.query(text, params);
        const duration = Date.now() - start;
        console.log('PG Query executed in', duration, 'ms');
        return res;
    } catch (error) {
        console.error('Error executing query', { text, params, error });
        throw error;
    }
};

const executeMongoQuery = async (model, operation, query) => {
    const start = Date.now();
    try {
        const result = await model[operation](query);
        const duration = Date.now() - start;
        console.log('Mongo Query executed in', duration, 'ms');
        return result;
    } catch (error) {
        console.error('Error executing mongo query', { model, operation, query, error });
        throw error;
    }
};

module.exports = {
    pgQuery,
    executeMongoQuery,
    pgPool,
    mongoose
};