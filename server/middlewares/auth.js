const passport = require('passport');

const protect = passport.authenticate('jwt', { session: false });

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Non autorisé, authentification nécessaire'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Rôle ${req.user.role} non autorisé à accéder à cette ressource`
            });
        }

        next();
    };
};

module.exports = {
    protect,
    authorize
};