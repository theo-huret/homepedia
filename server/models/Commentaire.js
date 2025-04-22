const mongoose = require('mongoose');

const CommentaireSchema = new mongoose.Schema({
    commune_id: {
        type: String,
        required: true,
        index: true
    },
    utilisateur_id: {
        type: String,
        required: true,
        index: true
    },
    note: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    texte: {
        type: String,
        required: true
    },
    date_creation: {
        type: Date,
        default: Date.now
    },
    categories: {
        type: [String],
        index: true
    },
    sentiment_score: {
        type: Number,
        min: -1,
        max: 1,
        index: true
    },
    mots_cles: [String]
});

module.exports = mongoose.model('Commentaire', CommentaireSchema);