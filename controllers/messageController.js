const Message = require('./../models/Message');
const ChatGroup = require('./../models/ChatGroup');
const createError = require('http-errors');

exports.addMessage = async (req, res, next) => {
    try {
        const { chatGroupID, author, body } = req.body;
        const newMessage = await Message.create({
            chatGroupID,
            author,
            body,
        });
        if (!newMessage) {
            return next(createError.InternalServerError(err?.message));
        }
        await ChatGroup.findByIdAndUpdate(chatGroupID, { lastMessage: newMessage });

        res.status(201).json({
            success: true,
            data: {
                newMessage,
            },
        });
    } catch (err) {
        return next(createError.InternalServerError(err?.message));
    }
};

exports.getMessages = async (req, res) => {
    const { id } = req.params;
    // console.log(id);
    try {
        const messgages = await Message.find({ chatGroupID: id }).populate({
            path: 'author',
            select: '_id fullname avatar',
        });

        res.status(200).json({
            success: true,
            data: {
                messgages,
            },
        });
    } catch (error) {
        return next(createError.InternalServerError(err));
    }
};

exports.loadRoomMessages = async (roomID) => {
    try {
        const messages = await Message.find({ chatGroupID: roomID }).populate({
            path: 'author',
            select: '_id fullname avatar',
        });

        return messages;
    } catch (error) {
        return error;
    }
};
