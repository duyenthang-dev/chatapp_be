const mongoose = require('mongoose');
// let now = new Date();
// now.setHours(now.getHours() + 2);
// now = new Date(now)
const messageSchema = new mongoose.Schema(
    {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },

        chatGroupID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ChatGroup',
        },

        isRead: {
            type: Boolean,
            default: false,
        },
        createAt: {
            type: Date,
            default: new Date,
        },
        body: {
            type: String,
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);
const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
