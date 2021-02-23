const express = require('express');
const rateLimit = require('express-rate-limit');
const WebSocket = require('ws');
const cors = require('cors');
const helmet = require('helmet');



const app = express();

app.use(cors());

app.use(helmet());

app.use(express.json({
    limit: '15kb'
}));

