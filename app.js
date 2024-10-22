const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const Redis = require('ioredis');
const apiRoutes = require('./routes/api');
const xmlParser = require('express-xml-bodyparser');
const dotenv = require('dotenv');


dotenv.config();

const app = express();


// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.text({ type: 'application/xml' }));
app.use(xmlParser());
app.use(bodyParser.urlencoded({ extended: true }));

// Multer for handling multipart/form-data
const upload = multer();
app.use(upload.none());


// API routes
app.use('/api', apiRoutes);

module.exports = app;
