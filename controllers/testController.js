let users = [
    { id: 1, name: 'Hà Duyên Thắng', username: 'user1' },
    { id: 2, name: 'Nguyễn Tiến Dũng', username: 'user1' },
    { id: 3, name: 'Mai Nguyện Ước', username: 'user1' },
];
//let user = users[0];

exports.getAllItems = (req, res) => {
    res.status(200).json({
        status: 'success',
        data: { users },
    });
};

exports.getItem = (req, res) => {
    res.status(200).json({
        status: 'success',
        data: {
            user: users.filter(e => e.id == Number.parseInt(req.params.id)),
        },
    });
};
exports.createItem = (req, res) => {
    res.status(201).json({
        status: 'success',
        data: {
            user,
        },
    });
};

exports.updateItem = (req, res) => {
    res.status(200).json({
        status: 'success',
        data: {
            user: 'update user successfully',
        },
    });
};

exports.deleteItem = (req, res) => {
    res.status(204).json({
        status: 'success',
        data: null,
    });
};
