/**
 * Helper function for jwt token
 */

const jwt = require('jsonwebtoken');
const createError = require('http-errors');

exports.signAccessToken = (id) => {
    return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
    });
};

exports.signRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
    });
};

exports.verifyRefreshToken = (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                return reject(createError.Unauthorized('Wrong token'));
            }
            resolve(decoded.id);
        });
    });
};