const { Server } = require('socket.io');
const { loadRoomMessages } = require('./controllers/messageController');
const User = require('./models/User');
const Message = require('./models/Message');
const ChatGroup = require('./models/ChatGroup');
module.exports = function (server) {
    const io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

    let onlineUsers = {};
    let realtimeMessages = [];
    io.on('connection', (socket) => {
        socket.on('add-new-user', (newUser) => {
            onlineUsers[socket.id] = newUser;
            io.emit('get-onlineUser', onlineUsers);
        });

        // start chat with anyone
        socket.on('join_room', async (data) => {
            socket.join(data.room);
            console.log(`${data.fullname} has joined room ${data.room}`);
        });

        socket.on('load_room_message', async ({ socketId, roomId, userId }) => {
            try {
                const messages = await loadRoomMessages(roomId);

                await User.updateOne(
                    { _id: userId },
                    {
                        $pull: { lastSeen: { chatGroupID: roomId } },
                    }
                );
                await User.updateOne(
                    { _id: userId },
                    {
                        $addToSet: { lastSeen: { chatGroupID: roomId, time: new Date() } },
                    }
                );

                io.to(socketId).emit('messages_room', messages);
            } catch (err) {
                io.to(socketId).emit('messages_room', err);
            }
        });

        socket.on('create_direct_chat', async ({ socketId, userId, targetId }) => {
            // TODO: find if userID === targetId
            const chat = await ChatGroup.findOne({
                members: [userId, targetId],
            });
            if (!chat) {
                // TODO: chưa có chat trước đó, tạo mới
                console.log('chua tạo chat!');
                const newChat = await ChatGroup.create({
                    members: [userId, targetId],
                });
            } else {
                // TODO: Đã có chat => load lại tin nhắn trong phòng chat
            }
        });

        // send message to chat room,
        socket.on('send_message', async (data) => {
            const newMessage = await Message.create(data);
            await ChatGroup.findByIdAndUpdate(data.chatGroupID, { lastMessage: newMessage });

            socket.to(data.chatGroupID).emit('receive_message', data);
            // send notification to everyone in chat room
            socket.to(data.chatGroupID).emit('notification', data);
        });

        socket.on('disconnect', async () => {
            const userLeft = onlineUsers[socket.id];
            if (userLeft) {
                await User.findByIdAndUpdate(userLeft._id, { lastActive: new Date() });
                console.log('update last active');
            }
        });
    });

    return io;
};
