const mongoose = require('mongoose');

const chatGroupSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            default: '',
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
        isEmpty: { type: Boolean, default: true },
        avatar: {
            type: String,
            default:
                'https://res.cloudinary.com/master-dev/image/upload/v1657890992/ChatApp/uploads/avatar/default-groupchat_m55nta.jpg',
        },
        
        type: {
            type: Number,
            default: 0,
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// chatGroupSchema.pre("find", (next) => {
//     consolee
// })

const ChatGroup = mongoose.model('ChatGroup', chatGroupSchema);
module.exports = ChatGroup;
