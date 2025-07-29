import winston from 'winston';

// Define log levels with colors
const logLevels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

const logColors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
};

// Add colors to winston
winston.addColors(logColors);

// Custom format for development
const developmentFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `${info.timestamp} [${info.level}]: ${info.message}`
    )
);

// Custom format for production
const productionFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

// Determine log level based on environment
const getLogLevel = (): string => {
    const env = process.env.NODE_ENV || 'development';
    const isDevelopment = env === 'development';
    const isTest = env === 'test';

    if (isTest) return 'error'; // Only log errors in test environment
    return isDevelopment ? 'debug' : 'warn';
};

// Create transports based on environment
const getTransports = (): winston.transport[] => {
    const env = process.env.NODE_ENV || 'development';
    const isDevelopment = env === 'development';
    const isTest = env === 'test';

    const transports: winston.transport[] = [];

    if (isTest) {
        // In test environment, use minimal console transport
        transports.push(
            new winston.transports.Console({
                silent: true, // Silent by default in tests
                format: winston.format.simple(),
            })
        );
    } else if (isDevelopment) {
        // In development, log to console
        transports.push(
            new winston.transports.Console({
                format: developmentFormat,
            })
        );
    } else {
        // In production, log to console with JSON format
        transports.push(
            new winston.transports.Console({
                format: productionFormat,
            })
        );

        // Optionally add file transports for production
        transports.push(
            new winston.transports.File({
                filename: 'logs/error.log',
                level: 'error',
                format: productionFormat,
            }),
            new winston.transports.File({
                filename: 'logs/combined.log',
                format: productionFormat,
            })
        );
    }

    return transports;
};

// Create the logger instance
const logger = winston.createLogger({
    level: getLogLevel(),
    levels: logLevels,
    transports: getTransports(),
    exitOnError: false,
});

// Logger interface for better type safety
export interface ILogger {
    error(message: string, meta?: any): void;
    warn(message: string, meta?: any): void;
    info(message: string, meta?: any): void;
    http(message: string, meta?: any): void;
    debug(message: string, meta?: any): void;
}

// Enhanced logger class with additional functionality
export class Logger implements ILogger {
    private context: string;
    private isTest: boolean;

    constructor(context: string = 'Application') {
        this.context = context;
        this.isTest = process.env.NODE_ENV === 'test';
    }

    private formatMessage(message: string): string {
        return `[${this.context}] ${message}`;
    }

    private logSafely(level: string, message: string, meta?: any): void {
        // In test environment, fallback to console if winston fails
        if (this.isTest) {
            // Silent in test unless specifically enabled
            if (process.env.LOGGER_ENABLED === 'true') {
                console[level as 'error' | 'warn' | 'info' | 'debug'] || console.log(this.formatMessage(message), meta);
            }
            return;
        }

        try {
            if (meta) {
                logger.log(level, this.formatMessage(message), { meta });
            } else {
                logger.log(level, this.formatMessage(message));
            }
        } catch (error) {
            // Fallback to console if winston fails
            console[level as 'error' | 'warn' | 'info' | 'debug'] || console.log(this.formatMessage(message), meta);
        }
    }

    error(message: string, meta?: any): void {
        this.logSafely('error', message, meta);
    }

    warn(message: string, meta?: any): void {
        this.logSafely('warn', message, meta);
    }

    info(message: string, meta?: any): void {
        this.logSafely('info', message, meta);
    }

    http(message: string, meta?: any): void {
        this.logSafely('http', message, meta);
    }

    debug(message: string, meta?: any): void {
        this.logSafely('debug', message, meta);
    }

    // Convenience methods for common logging patterns
    apiRequest(method: string, url: string, statusCode?: number): void {
        this.http(`${method} ${url}${statusCode ? ` - ${statusCode}` : ''}`);
    }

    apiError(method: string, url: string, error: Error, statusCode?: number): void {
        this.error(`${method} ${url} - ${error.message}${statusCode ? ` - ${statusCode}` : ''}`, {
            stack: error.stack,
            statusCode,
        });
    }

    stripeEvent(eventType: string, eventId?: string): void {
        this.info(`Stripe event: ${eventType}${eventId ? ` (${eventId})` : ''}`);
    }

    stripeError(eventType: string, error: Error, eventId?: string): void {
        this.error(`Stripe event error: ${eventType} - ${error.message}${eventId ? ` (${eventId})` : ''}`, {
            stack: error.stack,
            eventId,
        });
    }

    databaseOperation(operation: string, table: string, success: boolean = true): void {
        const level = success ? 'info' : 'error';
        const message = `Database ${operation} on ${table} ${success ? 'succeeded' : 'failed'}`;
        this.logSafely(level, message);
    }

    userAction(userId: string, action: string, details?: any): void {
        this.info(`User action: ${action} by user ${userId}`, { userId, action, details });
    }
}

// Create default logger instance
export const defaultLogger = new Logger();

// Export the winston instance for advanced usage
export { logger as winstonLogger };

// Factory function to create context-specific loggers
export const createLogger = (context: string): Logger => {
    return new Logger(context);
};
