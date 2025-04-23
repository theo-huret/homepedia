const express = require('express');
const router = express.Router();
const { getCommunes, getCommuneById, getCommuneStats, searchCommunes } = require('../controllers/communeController');

router.get('/search', searchCommunes);
router.get('/', getCommunes);
router.get('/:id', getCommuneById);
router.get('/:id/stats', getCommuneStats);

module.exports = router;