const User = require('./../models/User');
const ChatGroup = require('./../models/ChatGroup');
const createError = require('http-errors');

//TODO: tạo 1 chat group
exports.createChat = async function (req, res, next) {
    try {
        const {receiverId, name} = req.body;
        const senderId = req.user.id;
        const receiver = await User.findById(receiverId);
        const sender = await User.findById(senderId);
        if (!sender || !receiver) {
            return next(createError.BadRequest('Cant find sender or receiver!'));
        }
        const newChat = await ChatGroup.create({
            name,
            members: [senderId, receiverId],
        });
        res.status(201).json({
            success: true,
            data: {
                newChat,
            },
        });
    } catch (err) {
        return next(createError.InternalServerError(err));
    }
};

// TODO: get chat by id
exports.getChat = async function (req, res, next) {
    try {
        console.log(process.env.DATABASE_LOCAL)
        const {id} = req.params;
        console.log(id)
        const groupChat = await ChatGroup.findById(id).populate({
            path: 'members',
            select: '-password -__v'
        });
        if (!groupChat) {
            return next(createError.NotFound('Cant find group chat!'));
        }
        res.status(200).json({
            success: true,
            data: {
                groupChat,
            },
        });
    } catch (err) {
        return next(createError.InternalServerError(err));
    }
};

exports.uploadFile = async function (req, res, next) {
    
}