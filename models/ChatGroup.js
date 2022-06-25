const mongoose = require('mongoose');

const chatGroupSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    members: [User],
    messages: [Message],
    lastMessage: Message,
   
    topic: {
        type: String,
    },
    createAt: {
        type: Date,
        default: Date.now(),
    }

});

const ChatGroup = mongoose.model('ChatRoom', chatGroupSchema);
module.exports = ChatGroup;