const mongoose = require('mongoose');
const dotenv = require('dotenv').config({ path: './.env' });
const db = process.env.DATABASE_LOCAL;
const port = process.env.PORT || 3000;
const http = require('http');

mongoose
    .connect(db)
    .then(() => console.log('DB connected'))
    .catch((err) => console.log(err));
const app = require('./app');
const server = http.createServer(app);
const io = require('./socket')(server);

server.listen(port, () => {
    console.log(`Listening on ${port}...`);
});
