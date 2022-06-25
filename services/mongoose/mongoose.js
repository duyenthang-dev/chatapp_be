require('dotenv').config()

const mongoose = require('mongoose');
const User = require('./schemas/userSchema')


mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true, useUnifiedTopology: true}, (err) => {
    if(err) throw err
    console.log("Database connected")
})

module.exports = User