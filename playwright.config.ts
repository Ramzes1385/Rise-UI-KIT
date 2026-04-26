/**
 * Конфигурация Playwright для E2E и Visual Regression тестов.
 * E2E запускается на preview-сервере, screenshot — на Storybook.
 */

import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
	testDir: './tests',
	timeout: 30_000,
	expect: {
		timeout: 5_000,
		toHaveScreenshot: {
			maxDiffPixelRatio: 0.01,
		},
	},
	use: {
		trace: 'on-first-retry',
		video: 'retain-on-failure',
		screenshot: 'only-on-failure',
	},
	projects: [
		{
			name: 'e2e-chromium',
			testMatch: /e2e\/.*\.spec\.ts/,
			use: {
				...devices['Desktop Chrome'],
				baseURL: 'http://localhost:4173',
			},
		},
		{
			name: 'visual-chromium',
			testMatch: /visual\/.*\.spec\.ts/,
			use: {
				...devices['Desktop Chrome'],
				baseURL: 'http://localhost:6006',
			},
		},
	],
	webServer: [
		{
			command: 'npm run preview -- --port 4173',
			port: 4173,
			reuseExistingServer: !process.env.CI,
		},
		{
			command: 'npm run storybook -- --ci --port 6006',
			port: 6006,
			reuseExistingServer: !process.env.CI,
		},
	],
})
