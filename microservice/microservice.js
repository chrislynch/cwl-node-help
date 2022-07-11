const winston = require('winston');

const logConfiguration = {
    'transports': [
        new winston.transports.Console()
    ]
};

const logger = winston.createLogger(logConfiguration);

logger.info('Microservice initiated');

module.exports = { logger }