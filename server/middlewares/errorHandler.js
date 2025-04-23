const errorHandler = (err, req, res, next) => {
    console.error('Erreur :', err);

    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message || 'Erreur interne du serveur';

    if (err.code) {
        switch (err.code) {
            case '23505':
                statusCode = 400;
                message = 'Une entrée avec ces informations existe déjà';
                break;
            case '23503':
                statusCode = 400;
                message = 'La ressource référencée n\'existe pas';
                break;
            case '42P01':
                statusCode = 500;
                message = 'Erreur de base de données: table non définie';
                break;
            case '42703':
                statusCode = 500;
                message = 'Erreur de base de données: colonne non définie';
                break;
        }
    }

    if (err.name === 'ValidationError' || err.name === 'CastError') {
        statusCode = 400;
        message = 'Données invalides';
    }

    res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
    });
};

module.exports = errorHandler;