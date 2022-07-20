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

                // console.log(roomId, prevRoomId);

                await User.updateOne(
                    { _id: userId },
                    {
                        $pull: { lastSeen: { chatGroupID: { $in: [roomId, prevRoomId] } } },
                    }
                );
                await User.updateOne(
                    { _id: userId },
                    {
                        $push: {
                            lastSeen: {
                                $each: [
                                    {
                                        chatGroupID: roomId,
                                        time: new Date(),
                                    },
                                    {
                                        chatGroupID: prevRoomId,
                                        time: new Date(),
                                    },
                                ],
                            },
                        },
                    }
                );

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
                    select: '-password -__v -resetPasswordExpires -resetPasswordToken',
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
                members: { $all: [id1, id2]},
                type : 0
            });

            if (!chat) {
                // TODO: chưa có chat trước đó, tạo mới
                console.log("chua co")
                let newChat = await ChatGroup.create({
                    members: [userId, targetId],
                });

                (newChat = await ChatGroup.findById(newChat._id).populate({
                    path: 'members',
                    model: 'User',
                    select: '-password -__v -resetPasswordExpires -resetPasswordToken',
                })),
                    // io.in(newChat._id).emit('direct_chat_created', newChat);
                    socket.emit('direct_chat_created', newChat);
            } else {
                // TODO: Đã có chat => load lại tin nhắn trong phòng chat
                // console.log(chat);
                console.log("da co")
                socket.emit('direct_chat_existed', chat);
            }
        });

        // tạo nhóm chat mới
        socket.on('create_group_chat', async ({ name, members }) => {
            let newChat = await ChatGroup.create({
                name: name,
                members: [...members],
                type: 1,
            });

            (newChat = await ChatGroup.findById(newChat._id).populate({
                path: 'members',
                model: 'User',
                select: '-password -__v -resetPasswordExpires -resetPasswordToken',
            })),
                // io.in(newChat._id).emit('direct_chat_created', newChat);
                socket.emit('group_chat_created', newChat);
        });

        // send message to chat room,
        socket.on('send_message', async (data) => {
            let newMessage = await Message.create(data);
            newMessage = await Message.findById(newMessage._id).populate({
                path: 'author',
                model: 'User',
                select: '-password -__v -resetPasswordExpires -resetPasswordToken',
            })
            await ChatGroup.findByIdAndUpdate(data.chatGroupID, {
                lastMessage: newMessage,
                isEmpty: false,
            });

            await User.updateOne(
                { _id: data.author },
                {
                    $pull: { lastSeen: { chatGroupID: data.chatGroupID } },
                }
            );
            await User.updateOne(
                { _id: data.author },
                {
                    $push: {
                        lastSeen: {
                            chatGroupID: data.chatGroupID,
                            time: new Date(),
                        },
                    },
                }
            );

            data['_id'] = newMessage._id;

            io.in(data.chatGroupID).emit('receive_message', newMessage);
            // send notification to everyone in chat room
            socket.to(data.chatGroupID).emit('notification', newMessage);

            // if (!data.receiver) return;
            // const groupChat = await ChatGroup.find({ members: data.receiver }).populate([
            //     {
            //         path: 'members',
            //         model: 'User',
            //         select: '_id fullname avatar',
            //     },

            //     {
            //         path: 'lastMessage',
            //         model: 'Message',
            //         select: '-isRead -chatGroupID -__v',
            //     },
            // ]);

            // console.log('alo');

            // if (data.receiver) {
            //     let socketID = map1.get(data.receiver);

            //     console.log(data.receiver);
            //     console.log("hihi", socketID);
            //     io.to(socketID).emit('refresh_chat', groupChat);
            // }

            // socket.emit('refresh_chat', "hihi");
        });

        // console.log("online user: ", onlineUsers)
        socket.on('disconnect', async (reason) => {
            console.log("disconnect reason: ", reason);
            const kq = await ChatGroup.deleteMany({ isEmpty: true, type: 0 });
            const userLeft = onlineUsers[socket.id];
            if (userLeft) {
                await User.findByIdAndUpdate(userLeft._id, { lastActive: new Date() });
                console.log('update last active');
                delete onlineUsers[socket.id];
            }
          
        });

        socket.on('error', (error) => {
            // ...
            console.log("error reason: " , error);
        });

        socket.on('logout', async (data) => {
            console.log(`${data.fullname} has logged out`);
            const kq = await ChatGroup.deleteMany({ isEmpty: true, type: 0 });
            const userLeft = onlineUsers[socket.id];
            if (userLeft) {
                await User.findByIdAndUpdate(userLeft._id, { lastActive: new Date() });
                console.log('update last active');
                delete onlineUsers[socket.id];
            }
          
            socket.disconnect();
            // socket.io.reconnect();
        })
    });

    return io;
};
