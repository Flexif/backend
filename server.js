const mongoose = require('mongoose');
const app = require('./app');

const port = process.env.PORT || 10000;

mongoose.set('strictQuery', false);

mongoose.connect(process.env.DATABASE_URL)
    .then(() => {
        console.log('Connected to MongoDB');
        // Bind to 0.0.0.0 instead of default localhost (127.0.0.1)
        app.listen(port, '0.0.0.0', () => console.log(`Node.js application is running on port ${port}`));
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB', err);
    });
