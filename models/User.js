const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        require: true,
        unique: true,
        lowercase: true,
    },

    password: {
        type: String,
        minlength: 4,
        require: true,
    },
    isActive: {
        type: Boolean,
        default: false,
    },

    phoneNumber: {
        type: String,
        default: '',
    },
    fullname: {
        type: String,
        maxlength: 50,
        default: '',
    },
    address: {
        street: String,
        wards: String,
        district: String,
        city: String,
        default: {
            street: "",
            wards: "",
            district: "",
            city: "",
        },
    },
    birthDay: {
        type: Date,
        default: new Date(1990, 0, 1),
    },
    avatar: {
        type: String,
        default: '',
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
});

// encrypt password
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    // hash the password with bcrypt
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

userSchema.methods.checkPassword = async function (providedPassword) {
    return await bcrypt.compare(providedPassword, this.password);
};

userSchema.methods.genResetPasswordToken =  function (){
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.resetPasswordToken = resetToken;
    this.resetPasswordExpires = Date.now() + 3600000; // 15 minutes

    return resetToken;
}

const User = mongoose.model('User', userSchema);
module.exports = User;
