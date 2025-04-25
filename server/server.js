const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const compression = require('compression');
const passport = require('passport');
const errorHandler = require('./middlewares/errorHandler');
const routes = require('./routes');

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use(helmet());
app.use(compression());

// Initialiser Passport pour l'authentification
app.use(passport.initialize());
require('./config/passport');

const pgPool = new Pool({
    connectionString: process.env.POSTGRES_URI || 'postgres://postgres:postgres@localhost:5432/homepedia'
});

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/homepedia', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'homepedia'
})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('MongoDB Connection Error:', err));

app.get('/', (req, res) => {
    res.send('HOMEPEDIA API est en ligne');
});

app.use('/api', routes);
app.use(errorHandler);
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route non trouvée: ${req.originalUrl}`
    });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Serveur HOMEPEDIA en cours d'exécution sur le port ${PORT}`);
    console.log(`API accessible à l'adresse: http://localhost:${PORT}/api`);
});