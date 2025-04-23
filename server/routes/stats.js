const express = require('express');
const router = express.Router();
const {
    getPricesByRegion,
    getPricesByDepartement,
    getPricesByCommune,
    getPriceEvolution,
    getTransactionVolume,
    getHomepageStats,
    getTypesBien
} = require('../controllers/statsController');

router.get('/homepage', getHomepageStats);
router.get('/prices/regions', getPricesByRegion);
router.get('/prices/departements', getPricesByDepartement);
router.get('/prices/communes', getPricesByCommune);
router.get('/prices/evolution', getPriceEvolution);
router.get('/transactions/volume', getTransactionVolume);
router.get('/types-bien', getTypesBien);

module.exports = router;