const { Server } = require('socket.io');
const { loadRoomMessages } = require('./controllers/messageController');
module.exports = function (server) {
    const io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

    let onlineUsers = [];
    io.on('connection', (socket) => {
        //  console.log(`User Connected: ${socket.id}`);
        // add user to onlineUsers
        socket.on('add-new-user', (newUser) => {
            if (!onlineUsers.some((user) => user._id === newUser._id)) {
                newUser.socketId = socket.id;
                onlineUsers.push(newUser);
                console.log('connected user', onlineUsers);
            }
            io.emit('get-onlineUser', onlineUsers);
        });

        // start chat with anyone
        socket.on('join_room', (data) => {
            socket.join(data.room);
            console.log(`${data.fullname} has joined room ${data.room}`);
        });

        socket.on('load_room_message', async ({ socketId, roomId }) => {
            try {
                console.log(roomId);
                const messages = await loadRoomMessages(roomId);
                console.log(messages);

                io.to(socketId).emit('messages_room', messages);
            } catch (err) {
                io.to(socketId).emit('messages_room', err);
            }
        });

        // send message to chat room,
        socket.on('send_message', (data) => {
            // io.in("room1").emit(/* ... */);
            console.log(data);
            socket.to(data.chatGroupID).emit('receive_message', data);
            // send notification to everyone in chat room
            socket.to(data.chatGroupID).emit('notification', data);
        });
    });

    return io;
};
