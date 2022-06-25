const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    chatGroupID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ChatGroup",
    },
    
    isRead: {
        type: Boolean,
        default: false,
    },
    createAt: {
        type: Date,
        default: Date.now(),
    },
    body: {
        type: String,
    }

});
const Message = mongoose.model('Message', messageSchema);
module.exports = Message;