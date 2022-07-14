const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
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
            default: true,
        },

        lastActive: {
            type: Date,
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
                street: '',
                wards: '',
                district: '',
                city: '',
            },
        },

        lastSeen: [{
            chatGroupID: String,
            time: String,
        }],

        birthDay: {
            type: Date,
            default: new Date(1990, 0, 1),
        },
        avatar: {
            type: String,
            default: 'https://res.cloudinary.com/master-dev/image/upload/v1657251169/ChatApp/uploads/avatar/default-avatar_glrb8q.png',
        },
        resetPasswordToken: String,
        resetPasswordExpires: Date,
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// virtual populate
userSchema.virtual('chatgroups', {
    ref: 'ChatGroup',
    foreignField: 'members',
    localField: '_id',
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

userSchema.methods.genResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.resetPasswordToken = resetToken;
    this.resetPasswordExpires = Date.now() + 3600000; // 15 minutes

    return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
