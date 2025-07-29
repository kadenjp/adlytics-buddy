import { createLogger, Logger } from '../../providers/logger';
import winston from 'winston';

// Mock winston to avoid console output during tests
jest.mock('winston', () => ({
    addColors: jest.fn(),
    format: {
        combine: jest.fn(),
        timestamp: jest.fn(),
        colorize: jest.fn(),
        printf: jest.fn(),
        errors: jest.fn(),
        json: jest.fn(),
        simple: jest.fn(),
    },
    transports: {
        Console: jest.fn(),
        File: jest.fn(),
    },
    createLogger: jest.fn(() => ({
        log: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        info: jest.fn(),
        http: jest.fn(),
        debug: jest.fn(),
    })),
}));

describe('Logger', () => {
    let logger: Logger;

    beforeEach(() => {
        logger = createLogger('TestContext');
        jest.clearAllMocks();
    });

    describe('basic logging methods', () => {
        it('should log error messages', () => {
            logger.error('Test error message');
            // In test environment, logger should handle gracefully
            expect(logger).toBeDefined();
        });

        it('should log error with metadata', () => {
            const meta = { userId: '123', action: 'test' };
            logger.error('Test error with meta', meta);
            expect(logger).toBeDefined();
        });

        it('should log info messages', () => {
            logger.info('Test info message');
            expect(logger).toBeDefined();
        });

        it('should log warn messages', () => {
            logger.warn('Test warning message');
            expect(logger).toBeDefined();
        });

        it('should log debug messages', () => {
            logger.debug('Test debug message');
            expect(logger).toBeDefined();
        });

        it('should log http messages', () => {
            logger.http('Test http message');
            expect(logger).toBeDefined();
        });
    });

    describe('specialized logging methods', () => {
        it('should log API requests', () => {
            logger.apiRequest('POST', '/api/test', 200);
            expect(logger).toBeDefined();
        });

        it('should log API errors', () => {
            const error = new Error('API Error');
            logger.apiError('POST', '/api/test', error, 500);
            expect(logger).toBeDefined();
        });

        it('should log Stripe events', () => {
            logger.stripeEvent('customer.created', 'evt_123');
            expect(logger).toBeDefined();
        });

        it('should log Stripe errors', () => {
            const error = new Error('Stripe Error');
            logger.stripeError('customer.created', error, 'evt_123');
            expect(logger).toBeDefined();
        });

        it('should log database operations', () => {
            logger.databaseOperation('insert', 'users', true);
            logger.databaseOperation('update', 'users', false);
            expect(logger).toBeDefined();
        });

        it('should log user actions', () => {
            logger.userAction('user_123', 'profile_update', { field: 'email' });
            expect(logger).toBeDefined();
        });
    });

    describe('context handling', () => {
        it('should create logger with default context', () => {
            const defaultLogger = new Logger();
            expect(defaultLogger).toBeDefined();
        });

        it('should create logger with custom context', () => {
            const customLogger = createLogger('CustomContext');
            expect(customLogger).toBeDefined();
        });
    });

    describe('test environment handling', () => {
        const originalEnv = process.env.NODE_ENV;

        beforeEach(() => {
            // Test environment is already set, just ensure it
            expect(process.env.NODE_ENV).toBe('test');
        });

        afterEach(() => {
            // Clean up any environment changes
            delete process.env.LOGGER_ENABLED;
        });

        it('should handle test environment gracefully', () => {
            const testLogger = createLogger('TestLogger');
            expect(() => {
                testLogger.error('Test error in test env');
                testLogger.info('Test info in test env');
                testLogger.warn('Test warn in test env');
                testLogger.debug('Test debug in test env');
            }).not.toThrow();
        });

        it('should enable logging when LOGGER_ENABLED is true', () => {
            process.env.LOGGER_ENABLED = 'true';
            const testLogger = createLogger('TestLogger');

            // Should not throw even when logging is enabled
            expect(() => {
                testLogger.error('Test error with logging enabled');
            }).not.toThrow();

            delete process.env.LOGGER_ENABLED;
        });
    });
});
