/** @type {import('jest').Config} */
export default {
    preset: 'ts-jest/presets/default-esm',
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    testEnvironment: 'jsdom',
    roots: ['<rootDir>'],
    testMatch: [
        '**/__tests__/**/*.+(ts|tsx|js)',
        '**/*.(test|spec).+(ts|tsx|js)'
    ],
    transform: {
        '^.+\\.(ts|tsx)$': [
            'ts-jest',
            {
                useESM: true,
                tsconfig: {
                    module: 'ES2022'
                }
            }
        ]
    },
    collectCoverageFrom: [
        'lib/**/*.{ts,tsx}',
        'components/**/*.{ts,tsx}',
        'app/**/*.{ts,tsx}',
        'hooks/**/*.{ts,tsx}',
        'contexts/**/*.{ts,tsx}',
        '!**/*.d.ts',
        '!**/*.test.{ts,tsx}',
        '!**/*.spec.{ts,tsx}',
        '!**/index.ts',
        '!app/layout.tsx',
        '!app/globals.css'
    ],
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1'
    },
    transformIgnorePatterns: [
        'node_modules/(?!(isows|@supabase|@viem|.*\\.mjs$))'
    ],
    testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/']
};
