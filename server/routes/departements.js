const express = require('express');
const router = express.Router();
const { getAllDepartements, getDepartementById, getDepartementStats } = require('../controllers/departementController');

router.get('/', getAllDepartements);
router.get('/:id', getDepartementById);
router.get('/:id/stats', getDepartementStats);

module.exports = router;