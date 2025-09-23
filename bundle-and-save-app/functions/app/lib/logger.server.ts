import winston from 'winston'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'bundle-and-save-app' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
})

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }))
}

export { logger }

// Helper functions for common logging patterns
export const logError = (message: string, error?: Error, meta?: object) => {
  logger.error(message, { error: error?.message, stack: error?.stack, ...meta })
}

export const logInfo = (message: string, meta?: object) => {
  logger.info(message, meta)
}

export const logWarning = (message: string, meta?: object) => {
  logger.warn(message, meta)
}

export const logDebug = (message: string, meta?: object) => {
  logger.debug(message, meta)
}
