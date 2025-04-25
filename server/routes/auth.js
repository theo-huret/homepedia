const express = require('express');
const { check } = require('express-validator');
const passport = require('passport');
const router = express.Router();
const {
    register,
    login,
    getMe,
    googleCallback
} = require('../controllers/authController');

const auth = passport.authenticate('jwt', { session: false });

router.post(
    '/register',
    [
        check('nom', 'Le nom est requis').not().isEmpty(),
        check('email', 'Veuillez inclure un email valide').isEmail(),
        check('password', 'Entrez un mot de passe avec 6 caractères ou plus').isLength({ min: 6 })
    ],
    register
);
router.post('/login', login);
router.get('/me', auth, getMe);
router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get('/google/callback', googleCallback);

module.exports = router;