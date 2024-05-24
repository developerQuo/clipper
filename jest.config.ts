import type { Config } from 'jest';
import nextJest from 'next/jest.js';
import jestModuleNameMapper from 'jest-module-name-mapper';

const createJestConfig = nextJest({
	// Provide the path to your Next.js app to load next.config.js and .env files in your test environment
	dir: './',
});

// Add any custom config to be passed to Jest
const config: Config = {
	coverageProvider: 'v8',
	testEnvironment: 'jsdom',
	// Add more setup options before each test is run
	// setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
	verbose: true,
	moduleNameMapper: jestModuleNameMapper(),
	testPathIgnorePatterns: [
		'/node_modules/',
		'/.next/',
		'/styles/',
		'/public/',
		'/coverage/',
	],
	// msw 2.0 호환 options
	setupFiles: ['./jest.polyfills.js'],
	testEnvironmentOptions: {
		customExportConditions: [''],
	},
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config);
