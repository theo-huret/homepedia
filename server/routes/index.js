const express = require('express');
const router = express.Router();
const regionsRoutes = require('./regions');
const departementsRoutes = require('./departements');
const communesRoutes = require('./communes');
const statsRoutes = require('./stats');
const authRoutes = require('./auth');

router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'API HOMEPEDIA opérationnelle'
    });
});

router.use('/regions', regionsRoutes);
router.use('/departements', departementsRoutes);
router.use('/communes', communesRoutes);
router.use('/stats', statsRoutes);
router.use('/auth', authRoutes);

module.exports = router;