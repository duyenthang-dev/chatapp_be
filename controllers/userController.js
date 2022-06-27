const User = require('./../models/User');
const createError = require('http-errors');
const sendEmail = require('./../utils/mailSender');
const {signAccessToken, signRefreshToken} = require('../utils/jwtToken')

exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find();
        return res.status(200).json({
            success: true,
            data: {
                users,
            },
        });
    } catch (err) {
        console.error(err);
        return next(createError.BadRequest('Bad request'));
    }
};

// TODO: US 15: let user view their profile
exports.getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        return res.status(200).json({
            success: true,
            data: {
                user,
            },
        });
    } catch (err) {
        console.error(err);
        return next(createError.BadRequest('Bad request'));
    }
};

exports.createUser = async (req, res) => {
    try {
        const newUser = await User.create(req.body);
        console.log(newUser);
        res.status(200).json({
            success: true,
            data: {
                user: newUser,
            },
        });
    } catch (err) {
        console.error(err);
        return next(createError.BadRequest('Bad request'));
    }
};

// TODO: US 15: let user update their profile
exports.updateUser = async (req, res, next) => {
    try {
        console.log(req.body);
        const user = await User.findByIdAndUpdate(req.user.id, req.body, {
            new: true,
            runValidators: true,
        });
        res.status(200).json({
            success: true,
            data: {
                user,
            },
        });
    } catch (err) {
        console.error(err);
        return next(createError.BadRequest('Bad request'));
    }
};

exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(204).json({
            success: true,
            data: null,
        });
    } catch (err) {
        console.error(err);
        return next(createError.BadRequest('Bad request'));
    }
};

// TODO: reset password by sending reset token via email
exports.forgotPassword = async (req, res, next) => {
    //1. get user
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(createError.NotFound('There is no user founded with email address'));
    }

    //2. generate random token
    const resetToken = user.genResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    //3. send it to user email
    const resetURL = `${req.protocol}://${req.get(
        'host'
    )}/api/v1/users/reset-password/${resetToken}`;

    const message = `Quên mật khẩu của bạn? Nhập mật khẩu mới và xác nhận mật khẩu tại đường dẫn sau: ${resetURL}\n`;
    try {
        await sendEmail({
            email: user.email,
            subject: 'Đường link lấy lại mật khẩu (có hiệu lực trong 10 phút)',
            message,
        });
        console.log(resetURL);

        res.status(200).json({
            success: true,
            message: 'Token sent to email',
        });
    } catch (err) {
        console.log(err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(
            createError.InternalServerError(
                'Something went wrong when sending the email. Try again later'
            )
        );
    }
};

exports.resetPassword = async (req, res, next) => {
    console.log(req.params.token);
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
        return next(createError.BadRequest('Token invalid or token has expires'));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });
    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);

    res.status(200).json({
        success: true,
        accessToken,
        refreshToken,
        data: {
            user,
        },
    });
};
