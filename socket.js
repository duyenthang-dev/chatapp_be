const { Server } = require('socket.io');
const { loadRoomMessages } = require('./controllers/messageController');
const User = require('./models/User');
const Message = require('./models/Message');
const ChatGroup = require('./models/ChatGroup');
const mongoose = require('mongoose');
module.exports = function (server) {
    const io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

    let onlineUsers = {};

    let map1 = new Map();

    io.on('connection', (socket) => {
        socket.on('add-new-user', (newUser) => {
            onlineUsers[socket.id] = newUser;
            map1.set(newUser._id, socket.id);
            io.emit('get-onlineUser', onlineUsers);

        });

        // start chat with anyone
        socket.on('join_room', async (data) => {
            socket.join(data.room);
            console.log(`${data.fullname} has joined room ${data.room}`);
        });

        socket.on('load_room_message', async ({ socketId, roomId, userId, prevRoomId }) => {
            try {
                const messages = await loadRoomMessages(roomId);

                console.log(roomId, prevRoomId);

                await User.updateOne(
                    { _id: userId },
                    {
                        $pull: { "lastSeen": { "chatGroupID": { $in: [roomId, prevRoomId] } } },
                    }
                );
                await User.updateOne(
                    { _id: userId },
                    {
                        $push: {
                            "lastSeen": {
                                $each: [
                                    {
                                        "chatGroupID": roomId,
                                        "time": new Date(),
                                    },
                                    {
                                        "chatGroupID": prevRoomId,
                                        "time": new Date(),
                                    },
                                ],
                            },
                        },
                    }
                )

                io.to(socketId).emit('messages_room', messages);
            } catch (err) {
                io.to(socketId).emit('messages_room', err);
            }
        });

        socket.on('get_list_rooms', async (id) => {
            const groupChat = await ChatGroup.find({ members: id }).populate([
                {
                    path: 'members',
                    model: 'User',
                    select: '_id fullname avatar',
                },

                {
                    path: 'lastMessage',
                    model: 'Message',
                    select: '-isRead -chatGroupID -__v',
                },
            ]);
            socket.emit('room_list', groupChat);
        });

        // tạo phòng chat mới
        socket.on('create_direct_chat', async ({ socketId, userId, targetId }) => {
            // TODO: find if userID === targetId
            const id1 = mongoose.Types.ObjectId(userId);
            const id2 = mongoose.Types.ObjectId(targetId);
            const chat = await ChatGroup.findOne({
                members: { $all: [id1, id2] },
            });

            if (!chat) {
                // TODO: chưa có chat trước đó, tạo mới
                let newChat = await ChatGroup.create({
                    members: [userId, targetId],
                });

                (newChat = await ChatGroup.findById(newChat._id).populate({
                    path: 'members',
                    model: 'User',
                    select: '_id fullname avatar',
                })),
                    // io.in(newChat._id).emit('direct_chat_created', newChat);
                    socket.emit('direct_chat_created', newChat);
            } else {
                // TODO: Đã có chat => load lại tin nhắn trong phòng chat
                // console.log(chat);
                socket.emit('direct_chat_existed', chat);
            }
        });

        // send message to chat room,
        socket.on('send_message', async (data) => {
            console.log(data);
            const newMessage = await Message.create(data);
            await ChatGroup.findByIdAndUpdate(data.chatGroupID, {
                lastMessage: newMessage,
                isEmpty: false,
            });

            await User.updateOne(
                { _id: data.author },
                {
                    $pull: { "lastSeen": { "chatGroupID": data.chatGroupID } },
                }
            );
            await User.updateOne(
                { _id: data.author },
                {
                    $push: {
                        "lastSeen": {
                            "chatGroupID": data.chatGroupID,
                            "time": new Date(),
                        },
                    },
                }
            );

            data['_id'] = newMessage._id;

            socket.to(data.chatGroupID).emit('receive_message', data);
            // send notification to everyone in chat room
            socket.to(data.chatGroupID).emit('notification', data);

            if (!data.receiver) return;
            const groupChat = await ChatGroup.find({ members: data.receiver }).populate([
                {
                    path: 'members',
                    model: 'User',
                    select: '_id fullname avatar',
                },

                {
                    path: 'lastMessage',
                    model: 'Message',
                    select: '-isRead -chatGroupID -__v',
                },
            ]);

            if (data.receiver) {
                let socketID = map1.get(data.receiver);

                console.log(socketID);
                io.to(socketID).emit('refresh_chat', groupChat);
            }

            // socket.emit('refresh_chat', "hihi");
        });

        socket.on('disconnect', async () => {
            const kq = await ChatGroup.deleteMany({isEmpty: true, type: 0})
            const userLeft = onlineUsers[socket.id];
            if (userLeft) {
                await User.findByIdAndUpdate(userLeft._id, { lastActive: new Date() });
                console.log('update last active');
            }
        });
    });

    return io;
};
