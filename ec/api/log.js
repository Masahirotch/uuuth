const winston = require('winston');
// Define your severity levels.
// With them, You can create log files,
// see or hide levels based on the running ENV.
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
}

// This method set the current severity based on
// the current NODE_ENV: show all the log levels
// if the server was run in development mode; otherwise,
// if it was run in production, show info, warn and error messages.
const level = () => {
    const env = process.env.NODE_ENV || 'development'
    const isDevelopment = env === 'development'
    return isDevelopment ? 'debug' : 'info'
}

// Define different colors for each level.
// Colors make the log message more visible,
// adding the ability to focus or ignore messages.
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
}

// Tell winston that you want to link the colors
// defined above to the severity levels.
winston.addColors(colors)

// Chose the aspect of your log customizing the log format.
const format = winston.format.combine(
    // Add the message timestamp with the preferred format
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:SSS' }),
    // Define the format of the message showing the timestamp, the level and the message
    winston.format.printf(
        ({level, message, timestamp}) => `${timestamp} [${level}] ${message}`,
    ),
)

// Define which transports the logger must use to print out messages.
// In this example, we are using three different transports
const transports = [
    // Allow the use the console to print the messages
    new winston.transports.Console({
        // Tell Winston that the logs must be colored
        format: winston.format.colorize({ all: true }),
    }),
    // Allow to print all the error level messages inside the error.log file
    new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        maxsize: 10 * 1024 * 1024,
        maxFiles: 3,
    }),
    new winston.transports.File({
        filename: 'logs/info.log',
        level: 'info',
        maxsize: 10 * 1024 * 1024,
        maxFiles: 5,
    }),
    // Allow to print all the error message inside the all.log file
    // (also the error log that are also printed inside the error.log)
    //new winston.transports.File({ filename: 'logs/all.log' }),
]

// Create the logger instance that has to be exported
// and used to log messages.
const logger = winston.createLogger({
    level: level(),
    levels,
    format,
    transports,
})

const UAParser = require('ua-parser-js')
const header = req => {
    if (!req) return ""
    const p = new UAParser(req.headers["user-agent"])
    const reg = /Line\/[0-9a-zA-Z\.]+ [LIF]+/i
    const line = p.getUA().match(reg)
    return `${req.url} ${(req.body.userId || (req.body.userProfile ? JSON.parse( req.body.userProfile ).userId : "=NoID="))} ${req.ip} ${line} ${p.getBrowser().name}:${p.getBrowser().version} ${p.getOS().name}:${p.getOS().version} ${p.getDevice().type}:${p.getDevice().model}`
}

const error = (req, err) => {
    try {
        logger.error(`${header(req)}\n${err.stack}`)
    } catch (err) {console.log(err)}
}

const user = req => {
    try {
        logger.info(header(req))
    } catch (err) {console.log(err)}
}

const pay = (req) => {
    try {
        logger.info(`${header(req)} [${req.body.amount}@${req.body.currency}]`)
    } catch (err) {console.log(err)}
}

const cart = (req, opName) => {
    try {
        const carts = JSON.parse( req.body.cart )
        let products = []
        carts.forEach(cart => {
            products.push(`pid:${cart.product_id}@${cart.price}*${cart.quantity}`)
        })
        logger.info(`${header(req)} ${opName}: [${products}]`)
    } catch (err) {console.log(err)}
}

const regist = req => {
    try {
        const carts = JSON.parse( req.body.cart )
        let products = []
        carts.forEach(cart => {
            products.push(`pid:${cart.product_id}@${cart.price}*${cart.quantity}`)
        })
        const detail = JSON.parse( req.body.orderDetail )
        logger.info(`${header(req)} [sum:${detail.fullCartPrice}=${detail.cartPrice}+${detail.shippingPrice}] [${products}]`)
    } catch (err) {console.log(err)}
}

const complete = req => {
    try {
        const stripeToken = JSON.parse( req.body.stripeToken )
        let types = []
        stripeToken.payment_method_types.forEach(type => {
            types.push(type)
        })
        logger.info(`${header(req)} [oid:${req.body.order_id} sum:${stripeToken.amount}@${stripeToken.currency} by:${types}] -> ${stripeToken.status}`)
    } catch (err) {console.log(err)}
}

module.exports = {logger, error, user, pay, cart, regist, complete}