import type {Config} from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',

  automock: false,
  bail: true,
  clearMocks: true,
  collectCoverage: true,
  coveragePathIgnorePatterns: [
    '<rootDir>/test/_helpers.ts',
    '<rootDir>/test/services/',
    '<rootDir>/node_modules/'
  ],
  coverageReporters: ['text'],
  globals: {
    'ts-jest': {
      diagnostics: true
    }
  },
  moduleFileExtensions: ['js', 'json', 'node', 'ts'],
  roots: ['<rootDir>/test/'],
  setupFiles: ['<rootDir>/test/_setup.ts'],
  testEnvironment: 'node',
  testMatch: undefined,
  testRegex: '(\\.|/)spec\\.ts$'
};

export default config;
