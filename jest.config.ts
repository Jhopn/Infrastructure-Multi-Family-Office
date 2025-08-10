import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleNameMapper: {
    '^connection/(.*)$': '<rootDir>/src/connection/$1',
    '^controllers/(.*)$': '<rootDir>/src/controllers/$1',
    '^common/(.*)$': '<rootDir>/src/common/$1',
    '^middlewares/(.*)$': '<rootDir>/src/middlewares/$1',
    '^controllers/auth-controller/(.*)$': '<rootDir>/src/controllers/auth-controller/$1',
  },
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/prisma/',
  ],
  verbose: true,
};

export default config;


