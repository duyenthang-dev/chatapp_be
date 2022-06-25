const express = require('express');
const router = express.Router();
const authController = require('./../controllers/authController');
const passport = require('passport');
const auth = require('./../middlewares/auth');

router.post('/register', authController.register);
router.post(
    '/login',
    passport.authenticate('local', { session: false, failureMessage: true }),
    authController.login
);
router.post('/refresh-token', authController.refreshToken);
router.delete('/logout', authController.logout)

module.exports = router;
