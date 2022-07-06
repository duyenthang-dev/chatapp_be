const passport = require('passport');
const JWTStrategy = require('passport-jwt').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const { ExtractJwt } = require('passport-jwt');
const User = require('./../models/User');
const createError = require('http-errors');
// to protect api, limiting request access to database
const jwtConfig = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken('Authorization'),
    secretOrKey: process.env.ACCESS_TOKEN_SECRET,
};
passport.use(
    new JWTStrategy(jwtConfig, async (payload, done) => {
        try {
            console.log(payload);
            const user = await User.findById(payload.id);
            if (!user) {
                done(new Exception('User not found!', 401), false);
            }
            // success case
            return done(null, user);
        } catch (err) {
            done(err, false);
        }
    })
);

// to authenticate user with username and password
const localConfig = {
    usernameField: 'email',
    passwordField: 'password',
};
passport.use(
    new LocalStrategy(localConfig, async (email, password, done) => {
        try {
            if (!email || !password) {
                done(createError.BadRequest('Email and password are required'));
            }
            const user = await User.findOne({ email }).select('+password');
            if (!user) {
                done(createError.Unauthorized('Invalid email'));
            }
            const isValid = await user.checkPassword(password);
            if (!isValid) {
                done(createError.Unauthorized('Wrong password'));
            }

            // success case
            done(null, user);
        } catch (err) {
            done(err, false);
        }
    })
);

// middleware verify access token
exports.protectedAPI = (req, res, next) => {
    
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err || !user) {
            return next(createError.Unauthorized(info?.message ? info.message : "User is not authorized"));
        } else {
            req.user = user;
            next();
        }
    })(req, res, next);
};
