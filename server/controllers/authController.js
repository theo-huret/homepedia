const passport = require('passport');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const register = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { nom, email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Cet email est déjà utilisé'
            });
        }

        const user = await User.create({
            nom,
            email,
            password
        });

        sendTokenResponse(user, 201, res);
    } catch (error) {
        next(error);
    }
};

const login = (req, res, next) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err) {
            return next(err);
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: info.message
            });
        }

        sendTokenResponse(user, 200, res);
    })(req, res, next);
};

const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

const googleCallback = (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user) => {
        if (err) {
            return next(err);
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Échec de l\'authentification avec Google'
            });
        }

        const token = user.getSignedJwtToken();
        res.redirect(`${process.env.FRONTEND_URL}?token=${token}`);
    })(req, res, next);
};

const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();

    res.status(statusCode).json({
        success: true,
        token
    });
};

module.exports = {
    register,
    login,
    getMe,
    googleCallback
};