const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/User');

passport.use(
    new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password'
        },
        async (email, password, done) => {
            try {
                const user = await User.findOne({ email }).select('+password');

                if (!user) {
                    return done(null, false, { message: 'Email ou mot de passe incorrect' });
                }

                const isMatch = await user.matchPassword(password);

                if (!isMatch) {
                    return done(null, false, { message: 'Email ou mot de passe incorrect' });
                }

                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    )
);

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'votre_secret_jwt_secret'
};

passport.use(
    new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
        try {
            const user = await User.findById(jwt_payload.id);

            if (user) {
                return done(null, user);
            }

            return done(null, false);
        } catch (error) {
            return done(error, false);
        }
    })
);

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/api/auth/google/callback'
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ googleId: profile.id });

                if (user) {
                    return done(null, user);
                }

                user = await User.findOne({ email: profile.emails[0].value });

                if (user) {
                    user.googleId = profile.id;
                    await user.save();
                    return done(null, user);
                }

                user = await User.create({
                    nom: profile.displayName,
                    email: profile.emails[0].value,
                    googleId: profile.id,
                    password: Math.random().toString(36).slice(-8)
                });

                return done(null, user);
            } catch (error) {
                return done(error, false);
            }
        }
    )
);

module.exports = passport;