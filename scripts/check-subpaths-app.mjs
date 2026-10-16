/**
 * Точечная установка на деле (PLAN, Н.2, вариант «б»): приложение Vite из tarball пакета (`npm pack`) берёт компонент с подпути.
 * Нужна сборка: `npm run build`.
 *
 * Сценарии — маленькие приложения во временной папке, `vue` — из node_modules репозитория:
 * - `subpath-button` — `@ramzes1385/rise-ui-kit/BaseButton` + `tokens.css`: в JS нет кода BaseTable и BaseEditor,
 *   в CSS есть `.base-button` и токены, нет `.base-table`;
 * - `root-button` — то же из корня пакета + `styles.css`: с чем сравнивается размер;
 * - `subpath-select` — `@ramzes1385/rise-ui-kit/BaseSelect` (внутри BaseDropdown, BaseInput, BaseIcon…) + `tokens.css`:
 *   их CSS приходит сам, а снимок страницы с открытым списком совпадает со снимком `root-select` (корень + `styles.css`);
 * - `config-subpath` — `BaseButton` с подпути + `createUiKitConfig` из `@ramzes1385/rise-ui-kit/config` (настройки без регистрации
 *   компонентов): в JS нет BaseTable и BaseEditor, а настройки (`defaults`) доходят до компонента — класс `base-button--soft`;
 *   `config-root` — то же, но `createUiKitConfig` из корня пакета (тряска дерева отсекает реестр компонентов);
 * - `plugin` — `createUiKitPlugin` из корня: тяжёлые компоненты (BaseTable…) не в стартовом JS, а в чанке по `import()` (FOLLOW_UPS № 58).
 *
 * В каждом сценарии код компонента должен дойти до приложения (класс `base-button`/`base-select` в JS), а в браузере —
 * отрисоваться: так ловится тряска дерева, которая выбрасывает компонент целиком (импорт есть, а компонент `undefined`).
 *
 * Флаги: `--no-screenshot` — без снимков (нет Chromium для Playwright); `--keep` — не удалять временную папку.
 */

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { gzipSync } from 'node:zlib'
import { build, preview } from 'vite'

const ROOT = resolve(join(import.meta.dirname, '..'))
const PACKAGE = '@ramzes1385/rise-ui-kit'
const args = process.argv.slice(2)
const SCREENSHOT = !args.includes('--no-screenshot')

const SELECT_OPTIONS =
	"[{ value: 'msk', label: 'Москва' }, { value: 'spb', label: 'Санкт-Петербург' }, { value: 'vlg', label: 'Волгоград' }]"

const BUTTON_APP = from => `import { createApp, h } from 'vue'
import { BaseButton } from '${from}'
createApp({ render: () => h('main', { style: 'padding: 24px' }, [h(BaseButton, null, () => 'Сохранить')]) }).mount('#app')
`

const SELECT_APP = from => `import { createApp, h, ref } from 'vue'
import { BaseSelect } from '${from}'
createApp({
	setup() {
		const value = ref('spb')
		return () => h('main', { style: 'padding: 24px; width: 320px; height: 320px' }, [
			h(BaseSelect, { label: 'Город', options: ${SELECT_OPTIONS}, modelValue: value.value, 'onUpdate:modelValue': next => (value.value = next) }),
		])
	},
}).mount('#app')
`

const PLUGIN_APP = `import { createApp, h, resolveComponent } from 'vue'
import { createUiKitPlugin } from '${PACKAGE}'
createApp({ render: () => h('main', { style: 'padding: 24px' }, [h(resolveComponent('BaseButton'), null, () => 'Сохранить')]) })
	.use(createUiKitPlugin())
	.mount('#app')
`

const CONFIG_APP = (buttonFrom, configFrom) => `import { createApp, h } from 'vue'
import { BaseButton } from '${buttonFrom}'
import { createUiKitConfig } from '${configFrom}'
createApp({ render: () => h('main', { style: 'padding: 24px' }, [h(BaseButton, null, () => 'Сохранить')]) })
	.use(createUiKitConfig({ locale: 'en', theme: 'corporate', motion: 'subtle', defaults: { BaseButton: { variant: 'soft' } } }))
	.mount('#app')
`

const SCENARIOS = [
	{ name: 'subpath-button', css: 'tokens.css', code: BUTTON_APP(`${PACKAGE}/BaseButton`), marker: 'base-button' },
	{ name: 'root-button', css: 'styles.css', code: BUTTON_APP(PACKAGE), marker: 'base-button' },
	{ name: 'subpath-select', css: 'tokens.css', code: SELECT_APP(`${PACKAGE}/BaseSelect`), marker: 'base-select' },
	{ name: 'root-select', css: 'styles.css', code: SELECT_APP(PACKAGE), marker: 'base-select' },
	{
		name: 'config-subpath',
		css: 'tokens.css',
		code: CONFIG_APP(`${PACKAGE}/BaseButton`, `${PACKAGE}/config`),
		marker: 'base-button',
		applied: 'base-button--soft',
	},
	{
		name: 'config-root',
		css: 'tokens.css',
		code: CONFIG_APP(`${PACKAGE}/BaseButton`, PACKAGE),
		marker: 'base-button',
		applied: 'base-button--soft',
	},
	{ name: 'plugin', css: 'styles.css', code: PLUGIN_APP, marker: 'base-button' },
]

/**
 * Предел gzip-JS приложения с кнопкой и `createUiKitConfig` (замер 16.10: 77,4 КБ при 27,8 КБ у одной кнопки): настройки языка тянут
 * словари ru и en (≈50 КБ gzip), без реестра компонентов — а с `createUiKitPlugin` стартовый JS 451,8 КБ
 */
const CONFIG_JS_MAX = 90 * 1024

const kb = bytes => `${(bytes / 1024).toFixed(1)} КБ`

function packTarball(dir) {
	if (!existsSync(join(ROOT, 'dist/components/BaseButton/index.js'))) throw new Error('нет dist/ с подпутями — сначала `npm run build`')
	const output = execFileSync('npm', ['pack', '--ignore-scripts', '--json', '--pack-destination', dir], { cwd: ROOT, encoding: 'utf8' })
	return join(dir, JSON.parse(output)[0].filename)
}

function installPackage(tarball, app) {
	const target = join(app, 'node_modules', PACKAGE)
	mkdirSync(target, { recursive: true })
	execFileSync('tar', ['-xzf', tarball, '-C', target, '--strip-components=1'])
	symlinkSync(join(ROOT, 'node_modules/vue'), join(app, 'node_modules/vue'), 'dir')
}

const STATIC_IMPORT = /\b(?:import|export)\s*(?:[\w$*{},\s]*?\bfrom\s*)?["']\.\/([^"']+\.js)["']/g

/** Стартовый JS: вход из index.html и всё, что он импортирует статически; остальное — чанки по `import()` */
function initialScripts(dir) {
	const entry = /<script type="module"[^>]*src="\/assets\/([^"]+)"/.exec(readFileSync(join(dir, 'index.html'), 'utf8'))?.[1]
	const seen = new Set()
	const visit = name => {
		if (seen.has(name)) return
		seen.add(name)
		for (const [, next] of readFileSync(join(dir, 'assets', name), 'utf8').matchAll(STATIC_IMPORT)) visit(next)
	}
	if (entry) visit(entry)
	return seen
}

function readOutput(dir, extension, only) {
	const assets = join(dir, 'assets')
	const files = readdirSync(assets).filter(name => name.endsWith(extension) && (!only || only.has(name)))
	const text = files.map(name => readFileSync(join(assets, name), 'utf8')).join('\n')
	return { text, gzip: files.reduce((sum, name) => sum + gzipSync(readFileSync(join(assets, name)), { level: 9 }).length, 0) }
}

async function buildScenario(app, scenario) {
	const dir = join(app, scenario.name)
	mkdirSync(dir)
	writeFileSync(
		join(dir, 'index.html'),
		'<!doctype html><html lang="ru"><body><div id="app"></div><script type="module" src="./main.js"></script></body></html>\n',
	)
	writeFileSync(join(dir, 'main.js'), `import '${PACKAGE}/${scenario.css}'\n${scenario.code}`)
	await build({ root: dir, configFile: false, logLevel: 'error', build: { outDir: 'dist', emptyOutDir: true } })
	const out = join(dir, 'dist')
	const initial = initialScripts(out)
	const all = readOutput(out, '.js')
	return {
		...scenario,
		dir: out,
		js: readOutput(out, '.js', initial),
		lazy: all.gzip - readOutput(out, '.js', initial).gzip,
		allJs: all.text,
		css: readOutput(out, '.css'),
	}
}

function expect(problems, condition, message) {
	if (!condition) problems.push(message)
}

function checkContent(results, problems) {
	for (const result of Object.values(results)) {
		expect(
			problems,
			result.js.text.includes(result.marker),
			`${result.name}: в стартовом JS нет кода компонента (${result.marker}) — его выбросила тряска дерева`,
		)
	}
	const plugin = results.plugin
	expect(problems, !/base-table/.test(plugin.js.text), 'plugin: BaseTable попал в стартовый JS приложения с createUiKitPlugin')
	expect(problems, /base-table/.test(plugin.allJs), 'plugin: нет чанка BaseTable для import()')
	const button = results['subpath-button']
	for (const name of ['config-subpath', 'config-root']) {
		const config = results[name]
		expect(problems, !/base-table|base-editor/.test(config.js.text), `${name}: в JS есть код BaseTable или BaseEditor`)
		expect(
			problems,
			!/base-table|base-editor/.test(config.allJs),
			`${name}: BaseTable или BaseEditor попали в сборку (в том числе чанком по import())`,
		)
		expect(
			problems,
			config.js.gzip < CONFIG_JS_MAX,
			`${name}: JS ${kb(config.js.gzip)} — больше ${kb(CONFIG_JS_MAX)}: в сборку попало лишнее`,
		)
		expect(problems, config.lazy === 0, `${name}: в сборке есть чанки по import() — реестр компонентов плагина не отсечён`)
	}
	expect(problems, !/base-table|base-editor/.test(button.js.text), 'subpath-button: в JS есть код BaseTable или BaseEditor')
	expect(problems, button.css.text.includes('.base-button'), 'subpath-button: в CSS нет .base-button')
	expect(problems, button.css.text.includes('--rise-color-primary-500'), 'subpath-button: в CSS нет токенов (tokens.css)')
	expect(problems, !button.css.text.includes('.base-table'), 'subpath-button: в CSS есть .base-table')
	const select = results['subpath-select']
	for (const name of ['.base-select', '.base-dropdown', '.base-input', '.base-icon']) {
		expect(problems, select.css.text.includes(name), `subpath-select: в CSS нет ${name} (стили внутреннего компонента)`)
	}
	expect(problems, !/base-table|base-editor/.test(select.js.text), 'subpath-select: в JS есть код BaseTable или BaseEditor')
	expect(problems, !select.css.text.includes('.base-table'), 'subpath-select: в CSS есть .base-table')
}

/** Открывает приложение; у выпадающего списка — раскрывает его. Снимок — в `file`, без снимка — `null`, если компонент не отрисован */
async function screenshot(browser, result, file) {
	const server = await preview({ root: result.dir, configFile: false, logLevel: 'error', build: { outDir: '.' }, preview: { port: 0 } })
	const page = await browser.newPage({ viewport: { width: 400, height: 400 }, reducedMotion: 'reduce' })
	page.on('pageerror', error => result.errors.push(error.message))
	page.on('console', message => message.type() === 'error' && result.errors.push(message.text()))
	try {
		await page.goto(server.resolvedUrls.local[0])
		const rendered = await page
			.locator(`.${result.marker}`)
			.first()
			.waitFor({ timeout: 5000 })
			.then(
				() => true,
				() => false,
			)
		if (!rendered) return null
		if (result.marker === 'base-select') {
			await page.getByRole('combobox').first().click()
			await page.getByRole('option', { name: 'Волгоград' }).waitFor()
		}
		if (result.applied) await page.locator(`.${result.applied}`).first().waitFor({ timeout: 5000 })
		await page.screenshot({ path: file, animations: 'disabled' })
		return readFileSync(file)
	} finally {
		await page.close()
		await server.close()
	}
}

async function compareScreenshots(app, results, problems) {
	const { chromium } = await import('playwright')
	const browser = await chromium.launch()
	const shots = {}
	try {
		for (const result of Object.values(results)) {
			result.errors = []
			shots[result.name] = await screenshot(browser, result, join(app, `${result.name}.png`))
			expect(problems, shots[result.name] !== null, `${result.name}: компонент не отрисовался в браузере (.${result.marker})`)
			expect(problems, result.errors.length === 0, `${result.name}: ошибки в консоли браузера: ${result.errors.join('; ')}`)
		}
	} finally {
		await browser.close()
	}
	for (const [subpath, root] of [
		['subpath-button', 'root-button'],
		['subpath-select', 'root-select'],
	]) {
		const same = Boolean(shots[subpath] && shots[root] && shots[subpath].equals(shots[root]))
		expect(problems, same, `${subpath}: снимок с подпути отличается от снимка из корня (${app})`)
		console.log(
			`Снимок ${subpath} и ${root}${subpath.endsWith('select') ? ' (открытый список)' : ''}: ${same ? 'совпадают байт в байт' : 'различаются'}.`,
		)
	}
}

function report(results) {
	console.log('Размер приложения (gzip, вместе с vue):')
	for (const [name, { js, lazy, css }] of Object.entries(results)) {
		console.log(`  ${name}: JS ${kb(js.gzip)}${lazy > 0 ? ` (+ ${kb(lazy)} по import())` : ''}, CSS ${kb(css.gzip)}`)
	}
}

async function main() {
	const app = mkdtempSync(join(tmpdir(), 'rise-subpaths-'))
	const problems = []
	try {
		installPackage(packTarball(app), app)
		const results = {}
		for (const scenario of SCENARIOS) results[scenario.name] = await buildScenario(app, scenario)
		report(results)
		checkContent(results, problems)
		if (SCREENSHOT) await compareScreenshots(app, results, problems)
		else console.log('Снимки пропущены (--no-screenshot).')
	} finally {
		if (args.includes('--keep') || problems.length > 0) console.log(`Папка приложения: ${app}`)
		else rmSync(app, { recursive: true, force: true })
	}
	if (problems.length > 0) {
		console.error(problems.map(problem => `  ✗ ${problem}`).join('\n'))
		process.exit(1)
	}
	console.log('Подпути: ✓ приложение из tarball собирает только использованные компоненты.')
}

main().catch(error => {
	console.error(`check-subpaths-app: ${error.message}`)
	process.exit(1)
})
