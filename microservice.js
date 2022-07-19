const app = require('./express.js')
const winston = require('winston');
const dotenv = require('dotenv').config()

const logConfiguration = {
    'transports': [
        new winston.transports.Console()
    ]
};

const logger = winston.createLogger(logConfiguration);

logger.info('Microservice initiated');

app.ready()
app.steady()
app.go()

module.exports = { logger }