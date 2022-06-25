const mongoose = require('mongoose');
const dotenv = require('dotenv').config({ path: './.env' });
const db = process.env.DATABASE_LOCAL;
const port = process.env.PORT || 3000;

mongoose
    .connect(db)
    .then(() => console.log('DB connected'))
    .catch((err) => console.log(err));
const app = require('./app');
app.listen(port, () => {
    console.log(`Listening on ${port}...`);
});
