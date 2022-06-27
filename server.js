const mongoose = require('mongoose');
const dotenv = require('dotenv').config({ path: './.env' });
const db = process.env.DATABASE_LOCAL;
const port = process.env.PORT || 3000;

mongoose
    .connect(db)
    .then(() => console.log('DB connected'))
    .catch((err) => console.log(err));
const server = require('./app');
server.listen(port, () => {
    console.log(`Listening on ${port}...`);
});
