// Jest setup file
require('whatwg-fetch');
require('@testing-library/jest-dom');

global.console = {
    ...console,
    // Uncomment to ignore a specific log level
    // log: jest.fn(),
    // debug: jest.fn(),
    // info: jest.fn(),
    // warn: jest.fn(),
    // error: jest.fn(),
};

// Mock environment variables
process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key';
process.env.NODE_ENV = 'test';
