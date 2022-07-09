const { Server } = require('socket.io');

module.exports = function (server) {
    const io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        }
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

        // send message to chat room,
        socket.on('send_message', (data) => {
            console.log(data)
            socket.to(data.chatGroupID).emit('receive_message', data);
            // send notification to everyone in chat room
            socket.to(data.chatGroupID).emit('notification', data);
        });
    });

    return io;
};
