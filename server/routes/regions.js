const express = require('express');
const router = express.Router();
const { getAllRegions, getRegionById, getRegionStats } = require('../controllers/regionController');

router.get('/', getAllRegions);
router.get('/:id', getRegionById);
router.get('/:id/stats', getRegionStats);

module.exports = router;