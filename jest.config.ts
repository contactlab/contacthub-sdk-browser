import type {Config} from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',

  automock: false,
  bail: true,
  collectCoverage: true,
  coveragePathIgnorePatterns: [
    '<rootDir>/test/_helpers.ts',
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
  testEnvironment: 'node',
  testMatch: undefined,
  testRegex: '(\\.|/)spec\\.ts$'
};

export default config;
