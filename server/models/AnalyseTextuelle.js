const mongoose = require('mongoose');

const AnalyseTextuelleSchema = new mongoose.Schema({
    commune_id: {
        type: String,
        required: true,
        index: true
    },
    date_analyse: {
        type: Date,
        default: Date.now,
        index: true
    },
    source: {
        type: String,
        required: true
    },
    nuage_mots: {
        type: Map,
        of: Number
    },
    scores_sentiment: {
        type: Map,
        of: Number
    },
    tendances: [{
        theme: String,
        evolution: Number,
        mentions: Number
    }]
});

module.exports = mongoose.model('AnalyseTextuelle', AnalyseTextuelleSchema);