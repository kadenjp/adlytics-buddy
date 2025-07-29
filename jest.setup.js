// Jest setup file
require('whatwg-fetch');
require('@testing-library/jest-dom');

// Suppress console warnings in tests to reduce noise
// These warnings are mostly React act() warnings that are expected in our test environment
global.console = {
    ...console,
    error: jest.fn(),
    warn: jest.fn(),
};

// Mock environment variables
process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key';
process.env.NODE_ENV = 'test';
