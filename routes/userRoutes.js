const express = require('express');
const router = express.Router();
const {
    getUser,
    updateUser,
    forgotPassword,
    resetPassword,
    changePassword,
    uploadAvatar,
    findByName,
    uploadImage,
    getAllUsers
} = require('./../controllers/userController');
const auth = require('./../middlewares/auth');

router.route("/").get(auth.protectedAPI, getAllUsers)
router.route('/me').get(auth.protectedAPI, getUser).patch(auth.protectedAPI, updateUser);
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password/:token').patch(resetPassword);
router.route('/change-password').patch(changePassword)
router.route('/uploadAvatar').post( auth.protectedAPI, uploadImage, uploadAvatar);
router.route('/find/:fullname').get(auth.protectedAPI, findByName)
module.exports = router;

// passport.authenticate('jwt', { session: false }), getUser
