const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/homepedia';

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('MongoDB Connection Error:', err));

module.exports = mongoose;