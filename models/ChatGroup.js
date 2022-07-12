const mongoose = require('mongoose');

const chatGroupSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            default: ""
        },
        members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },

        topic: {
            type: String,
        },
        createAt: {
            type: Date,
            default: new Date(),
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);



// chatGroupSchema.pre("save", (next) => {

// })

const ChatGroup = mongoose.model('ChatGroup', chatGroupSchema);
module.exports = ChatGroup;
