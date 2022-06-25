const passportLocalMongoose = require('passport-local-mongoose');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const userSchema = new Schema({
    username: {type: String, required: true},
    password: {type: String}
})

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema)

module.exports = User