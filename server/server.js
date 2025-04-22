const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const helmet = require('helmet');
const compression = require('compression');

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(compression());

const pgPool = new Pool({
    connectionString: process.env.POSTGRES_URI || 'postgres://postgres:postgres@localhost:5432/homepedia'
});

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/homepedia', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('MongoDB Connection Error:', err));

app.get('/', (req, res) => {
    res.send('HOMEPEDIA API is running');
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));