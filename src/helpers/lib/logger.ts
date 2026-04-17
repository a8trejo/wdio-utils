import { createLogger, format, transports } from 'winston'

const logLevel = () => {
    // Add logic here to determine log level
    return 'debug'
}

// Custom colors for different log types
const colors = {
    success: 'green',
    info: 'blue',
    warn: 'yellow',
    error: 'red',
    debug: 'magenta',
}

// Add custom colors to Winston
format.colorize().addColors(colors)

const logFormat = format.combine(
    format.colorize(),
    format.printf(log => {
        // Check if log.message is a string before using string methods
        if (typeof log.message === 'string') {
            if (log.message.includes('assert :: ')) {
                const msg = log.message.split('assert')[1]
                return `[${log.level}]:\n \x1b[32;1massert\x1b[0m\x1b[32m${msg}\x1b[0m`
            }
        }

        // Default format for non-string messages or messages without chai
        return `[${log.level}]: ${log.message}`
    })
)

const logger = createLogger({
    level: logLevel(),
    format: logFormat,
    transports: [new transports.Console()],
})

export default logger
