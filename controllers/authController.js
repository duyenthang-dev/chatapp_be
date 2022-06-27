const User = require('./../models/User');
const createError = require('http-errors');
const jwt = require('jsonwebtoken');
const {signAccessToken, signRefreshToken, verifyRefreshToken} = require('../utils/jwtToken')

exports.register = async function (req, res, next) {
    
    try {
        
        const { fullname, email, password } = req.body;
        if (!email || !password || !fullname)
            return next(createError.BadRequest('Name, Email and password must be provided'));
        const newUser = await User.create({
            fullname: req.body.fullname,
            email: req.body.email,
            password: req.body.password,
        });
        console.log("hihi")

        const accessToken = signAccessToken(newUser._id);
        const refreshToken = signRefreshToken(newUser._id);

        res.status(201).json({
            success: true,
            accessToken,
            refreshToken,
            data: {
                user: newUser,
            },
        });
    } catch (err) {
        console.log(err);
        if (err?.code === 11000) {
            return next(createError.BadRequest('Email already exists'));
        }
        return next(createError.InternalServerError('Server error'));
    }
};
exports.login = async function (req, res, next) {
    try {
        const accessToken = signAccessToken(req.user.id);
        const refreshToken = signRefreshToken(req.user._id);
        // res.setHeader('Authorization', accessToken);
        res.status(200).json({
            success: true,
            accessToken,
            refreshToken,
        });
    } catch (err) {
        return next(createError.InternalServerError('Server error'));
    }
};

exports.refreshToken = async function (req, res, next) {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return next(createError.BadRequest('Refresh token are required'));
        const id = await verifyRefreshToken(refreshToken);
        const accessToken = signAccessToken(id);
        const refToken = signRefreshToken(id);
        res.status(200).json({
            success: true,
            accessToken,
            refreshToken: refToken,
        });
    } catch (err) {
        return next(createError.InternalServerError('Server error'));
    }
};

exports.logout = async function (req, res, next) {

};
