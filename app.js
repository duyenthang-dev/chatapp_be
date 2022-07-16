const express = require('express');
const cors = require('cors');
const passport = require('passport');
const createError = require('http-errors');


const testRouter = require('./routes/testRoutes');
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const chatRouter = require('./routes/chatRoutes');
const messageRouter = require('./routes/messageRoutes');
// const connect = require('./database')

//middleware that convert request body to JSON.
const app = express();
app.use(express.json());
app.use(cors());
app.use(passport.initialize());
app.use('/api/v1/tests', testRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/chats', chatRouter);
app.use("/api/v1/messages", messageRouter);


// wrong api
app.all('*', (res, req, next) => {
    return next(createError.NotFound(`Can't find ${req?.req?.originalUrl} on this server`));
});

// middleware that handling error
app.use((err, req, res, next) => {
    console.log(err.message)
    
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (!err.message) {
        next();
    }
    res.status(err.statusCode).json({
        success: false,
        status: err.status,
        message: err?.message,
    });
});

module.exports = app;
