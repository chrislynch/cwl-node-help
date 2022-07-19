const app = require('./express.js')
const winston = require('winston');
const dotenv = require('dotenv').config()
const fs = require('fs')
const rabbit = require('./rabbit.js')

const logConfiguration = {
    'transports': [
        new winston.transports.Console()
    ]
};

const logger = winston.createLogger(logConfiguration);

logger.info('Microservice startup');

// Start up any queues defined in the /queues folder
const queues = {}
fs.readdirSync(process.cwd() + '/queues').forEach(file => {
    fileParts= file.split('.')
    var queue = fileParts[0]
    console.log(file);
    queues[queue] = require(process.cwd() + '/queues/' + file)
    if(queues[queue].consume){
        logger.info("Starting consuming queue " + queue)
        rabbit.consume(process.env['RABBIT_HOST'],queue,queues[queue].consume)
    }
});

// Start up the Express server to deal with real time API requests.
logger.info('Starting API Express server')
app.ready()
app.steady()
app.go()

module.exports = { logger }