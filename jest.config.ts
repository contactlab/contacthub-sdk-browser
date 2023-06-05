import type {JestConfigWithTsJest} from 'ts-jest';

const config: JestConfigWithTsJest = {
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
  moduleFileExtensions: ['js', 'json', 'node', 'ts'],
  roots: ['<rootDir>/test/'],
  setupFiles: ['<rootDir>/test/_setup.ts'],
  testEnvironment: 'node',
  testMatch: undefined,
  testRegex: '(\\.|/)spec\\.ts$',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {diagnostics: true}]
  }
};

export default config;
