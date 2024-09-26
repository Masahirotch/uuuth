const winston = require("winston")
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
  const env = process.env.NODE_ENV || "development"
  const isDevelopment = env === "development"
  return isDevelopment ? "debug" : "info"
}

// Define different colors for each level.
// Colors make the log message more visible,
// adding the ability to focus or ignore messages.
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
}

// Tell winston that you want to link the colors
// defined above to the severity levels.
winston.addColors(colors)

// Chose the aspect of your log customizing the log format.
const format = winston.format.combine(
  // Add the message timestamp with the preferred format
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:SSS" }),
  // Define the format of the message showing the timestamp, the level and the message
  winston.format.printf(({ lvl, message, timestamp }) => `${timestamp} [${lvl}] ${message}`)
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
    filename: "logs/error.log",
    level: "error",
    maxsize: 10 * 1024 * 1024,
    maxFiles: 3,
  }),
  new winston.transports.File({
    filename: "logs/info.log",
    level: "info",
    maxsize: 10 * 1024 * 1024,
    maxFiles: 5,
  }),
  // Allow to print all the error message inside the all.log file
  // (also the error log that are also printed inside the error.log)
  // new winston.transports.File({ filename: 'logs/all.log' }),
]

// Create the logger instance that has to be exported
// and used to log messages.
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
})

const UAParser = require("ua-parser-js")

const header = (req) => {
  try {
    if (!req) return ""
    const p = new UAParser(req.headers["user-agent"])
    const reg = /Line\/[0-9a-zA-Z.]+ [LIF]+/i
    const line = p.getUA().match(reg)
    return `${req.url} ${
      (req.body.userId ||
        req.body.ID ||
        req.body.new_info_order ||
        req.body.new_info_order.userId) ??
      "=NoID="
    } ${req.ip} ${line} ${p.getBrowser().name}:${p.getBrowser().version} ${p.getOS().name}:${
      p.getOS().version
    } ${p.getDevice().type}:${p.getDevice().model}`
  } catch (err) {
    return err
  }
}

const error = (req, err) => {
  try {
    logger.error(`${header(req)}\n${err.stack}`)
  } catch {
    /* Nothing to do */
  }
}

const user = (req) => {
  try {
    logger.info(header(req))
  } catch {
    /* Nothing to do */
  }
}
const aecUser = (loginInfo) => {
  try {
    logger.info(loginInfo)
  } catch (error) {
    console.log(error);
  }
}

const order = (req, errorMessage) => {
  try {
    const products = []
    req.body.new_info_order.orderArray.forEach((product) => {
      products.push(`id:${product.productId}@${product.productPrice}*${product.quantity}`)
    })
    logger.info(`${header(req)} ${errorMessage ? `${errorMessage} +  ` : ""}[${products}]`)
  } catch (err) {
    console.log(err)
    /* Nothing to do */
  }
}

const message = (req) => {
  try {
    const messages = []
    req.body.messages.forEach((msg) => {
      switch (msg.type) {
        case "image":
          messages.push(`${msg.type}:${msg.originalContentUrl}`)
          break
        case "movie":
          messages.push(`${msg.type}:${msg.originalContentUrl}`)
          break
        default: // <= case "text":
          messages.push(`${msg.type}:${msg.text}`)
          break
      }
    })
    logger.info(`${header(req)} to:${req.body.userId} [${messages}]`)
  } catch {
    /* Nothing to do */
  }
}

module.exports = { logger, error, user, order, message, aecUser }
