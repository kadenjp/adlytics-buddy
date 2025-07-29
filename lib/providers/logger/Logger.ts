// Browser-safe logger that conditionally uses Winston only on server-side
let winston: any = null;

// Only import winston on server-side
if (typeof window === 'undefined') {
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        winston = require('winston');
    } catch (_error) {
        // Winston not available, fallback to console
        winston = null;
    }
}

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

// Server-side Winston logger instance
let winstonLogger: any = null;

// Initialize Winston only on server-side
const initializeWinston = () => {
    if (!winston || winstonLogger) return;

    // Add colors to winston
    winston.addColors(logColors);

    // Custom format for development
    const developmentFormat = winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.colorize({ all: true }),
        winston.format.printf(
            (info: any) => `${info.timestamp} [${info.level}]: ${info.message}`
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
    const getTransports = (): any[] => {
        const env = process.env.NODE_ENV || 'development';
        const isDevelopment = env === 'development';
        const isTest = env === 'test';

        const transports: any[] = [];

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

            // Only add file transports on server-side in production
            if (typeof window === 'undefined') {
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
        }

        return transports;
    };

    // Create the logger instance
    winstonLogger = winston.createLogger({
        level: getLogLevel(),
        levels: logLevels,
        transports: getTransports(),
        exitOnError: false,
    });
};

// Initialize Winston if available
if (winston) {
    initializeWinston();
}

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
                const consoleMethod = console[level as 'error' | 'warn' | 'info' | 'debug'] || console.log;
                consoleMethod(this.formatMessage(message), meta);
            }
            return;
        }

        try {
            // Use Winston on server-side, console on client-side
            if (winstonLogger && typeof window === 'undefined') {
                if (meta) {
                    winstonLogger.log(level, this.formatMessage(message), { meta });
                } else {
                    winstonLogger.log(level, this.formatMessage(message));
                }
            } else {
                // Browser fallback to console
                const consoleMethod = console[level as 'error' | 'warn' | 'info' | 'debug'] || console.log;
                consoleMethod(this.formatMessage(message), meta);
            }
        } catch (_error) {
            // Fallback to console if winston fails
            const consoleMethod = console[level as 'error' | 'warn' | 'info' | 'debug'] || console.log;
            consoleMethod(this.formatMessage(message), meta);
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
export { winstonLogger };

// Factory function to create context-specific loggers
export const createLogger = (context: string): Logger => {
    return new Logger(context);
};
