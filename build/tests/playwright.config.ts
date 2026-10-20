/**
 * Все текущие сценарии используют Storybook iframe.
 *
 * Сервер Storybook (`STORYBOOK_SERVER`):
 * - `static` (по умолчанию, режим CI) — собранный `storybook-static` (`npm run build-storybook`) отдаёт `scripts/serve-storybook-static.mjs`:
 *   старт мгновенный, страницы не собираются на лету, поэтому тесты не зависят от скорости машины;
 * - `dev` — dev-сервер Storybook (`npm run test:e2e:dev`): для локальной отладки с правкой кода на лету, старт долгий.
 * `PLAYWRIGHT_REUSE_SERVER=true` — сервер уже запущен (CI поднимает его сам, один на e2e и скриншоты).
 */

import { existsSync, readdirSync } from 'node:fs'
import { homedir, platform } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, devices } from '@playwright/test'

const DEFAULT_STORYBOOK_URL = 'http://localhost:6006'

const storybookUrl = process.env.STORYBOOK_URL ?? DEFAULT_STORYBOOK_URL
const storybookPort = getPort(storybookUrl)

function getPort(url: string): number {
	const parsedUrl = new URL(url)

	if (parsedUrl.port) return Number(parsedUrl.port)

	return parsedUrl.protocol === 'https:' ? 443 : 80
}

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const staticDir = join(repoRoot, 'storybook-static')
const DEV_SERVER_START_TIMEOUT = 300_000

function shouldReuse(): boolean {
	return process.env.PLAYWRIGHT_REUSE_SERVER === 'true'
}

function getServerMode(): 'static' | 'dev' {
	const mode = process.env.STORYBOOK_SERVER ?? 'static'

	if (mode !== 'static' && mode !== 'dev') throw new Error(`STORYBOOK_SERVER: «static» или «dev», получено «${mode}»`)

	return mode
}

function getBrowsersDir(): string {
	const custom = process.env.PLAYWRIGHT_BROWSERS_PATH

	if (custom === '0') return join(repoRoot, 'node_modules', 'playwright-core', '.local-browsers')
	if (custom) return custom
	if (platform() === 'win32') return join(process.env.LOCALAPPDATA ?? join(homedir(), 'AppData', 'Local'), 'ms-playwright')

	return platform() === 'darwin' ? join(homedir(), 'Library', 'Caches', 'ms-playwright') : join(homedir(), '.cache', 'ms-playwright')
}

/** Запись видео требует ffmpeg из набора браузеров Playwright; без него тест падает при старте, а не пишет видео. */
function hasFfmpeg(): boolean {
	const dir = getBrowsersDir()

	return existsSync(dir) && readdirSync(dir).some(name => name.startsWith('ffmpeg-'))
}

function getVideoMode(): 'retain-on-failure' | 'off' {
	return process.env.PLAYWRIGHT_VIDEO !== 'off' && hasFfmpeg() ? 'retain-on-failure' : 'off'
}

function getWebServers() {
	if (shouldReuse()) return []

	if (getServerMode() === 'dev') {
		return [
			{
				command: `npm run storybook -- --ci --port ${storybookPort}`,
				port: storybookPort,
				reuseExistingServer: false,
				timeout: DEV_SERVER_START_TIMEOUT,
			},
		]
	}

	if (!existsSync(join(staticDir, 'index.json'))) {
		throw new Error('Нет storybook-static: соберите Storybook (`npm run build-storybook`) или запустите `npm run test:e2e:dev`.')
	}

	return [
		{
			command: 'node scripts/serve-storybook-static.mjs',
			cwd: repoRoot,
			env: { PORT: String(storybookPort) },
			port: storybookPort,
			reuseExistingServer: false,
		},
	]
}

export default defineConfig({
	testDir: '../..',
	// Рабочие копии агентов (git worktree) лежат внутри репозитория: их src/ подходит под testMatch, но это не наши тесты
	testIgnore: ['**/node_modules/**', '**/.kilo/**', '**/.claude/worktrees/**'],
	snapshotPathTemplate: '{testDir}/tests/visual-snapshots/{testFilePath}-snapshots/{arg}-{projectName}{ext}',
	timeout: 60_000,
	workers: 2,
	expect: {
		timeout: 5_000,
		toHaveScreenshot: {
			// 15% покрывает кросс-платформенные отличия анти-алиасинга шрифтов кита
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
		video: getVideoMode(),
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
	webServer: getWebServers(),
})
