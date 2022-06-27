const express = require('express');
const router = express.Router();
const {
    getUser,
    updateUser,
    forgotPassword,
    resetPassword,
    getAllUsers
} = require('./../controllers/userController');
const auth = require('./../middlewares/auth');
router.route('/').get(getAllUsers);
router.route('/me').get(auth.protectedAPI, getUser).patch(auth.protectedAPI, updateUser);
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password/:token').patch(resetPassword);
module.exports = router;

// passport.authenticate('jwt', { session: false }), getUser
