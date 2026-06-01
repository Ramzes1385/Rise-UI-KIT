/**
 * Конфигурация Playwright для Storybook smoke и Visual Regression тестов.
 * Все текущие сценарии используют Storybook iframe.
 */

import { defineConfig, devices } from '@playwright/test'

const DEFAULT_STORYBOOK_URL = 'http://localhost:6006'

const storybookUrl = process.env.STORYBOOK_URL ?? DEFAULT_STORYBOOK_URL
const storybookPort = getPort(storybookUrl)

function getPort(url: string): number {
	const parsedUrl = new URL(url)

	if (parsedUrl.port) return Number(parsedUrl.port)

	return parsedUrl.protocol === 'https:' ? 443 : 80
}

function shouldReuse(): boolean {
	return process.env.PLAYWRIGHT_REUSE_SERVER === 'true'
}

export default defineConfig({
	testDir: '../..',
	snapshotPathTemplate: '{testDir}/tests/visual-snapshots/{testFilePath}-snapshots/{arg}-{projectName}{ext}',
	timeout: 60_000,
	workers: 2,
	expect: {
		timeout: 5_000,
		toHaveScreenshot: {
			// 15% покрывает кросс-платформенные отличия анти-алиасинга Inter Variable
			// (Windows: GDI ClearType, Linux: FreeType) и 1-2px дрожание размеров
			// текста между двумя рендерами одной woff2 на разных OS. Реальные
			// визуальные регрессии (layout-shift, color-shift, сломанные компоненты)
			// дают diff > 0.3 и ловятся отдельно. Без этого расширения тесты флакают
			// на каждое обновление зависимостей/Chromium, хотя рендер визуально идентичен.
			maxDiffPixelRatio: 0.15,
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
			testMatch: /src[\\/].*\.e2e\.spec\.ts$/,
			use: {
				...devices['Desktop Chrome'],
				baseURL: storybookUrl,
			},
		},
		{
			name: 'visual-chromium',
			testMatch: /src[\\/].*\.visual\.spec\.ts$/,
			use: {
				...devices['Desktop Chrome'],
				baseURL: storybookUrl,
			},
		},
	],
	webServer: shouldReuse()
		? []
		: [
				{
					command: `npm run storybook -- --ci --port ${storybookPort}`,
					port: storybookPort,
					reuseExistingServer: false,
				},
		  ],
})
