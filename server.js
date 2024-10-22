const mongoose = require('mongoose');
const app = require('./app');

const port = process.env.PORT || 5000;

mongoose.set('strictQuery', false);

mongoose.connect(process.env.DATABASE_URL)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(port, () => console.log(`Node.js application is running on port ${port}`));
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB', err);
    });
