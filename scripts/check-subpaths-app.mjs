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
 * - `subpath-date-picker` — `@ramzes1385/rise-ui-kit/BaseDatePicker`: компонент с календарём и разделами словаря дат;
 * - `config-subpath-ru` — кнопка + `createUiKitConfig` без языка (русский по умолчанию): в сборке нет ни раздела `text` словаря `ru`,
 *   ни словаря `en`; `config-subpath` и `config-root` подключают `en` (`registerLocale(en)`, `locale: 'en'`);
 * - `bare-app` и `bare-app-en` — приложение без кита и с `registerLocale(en)`: разница gzip — вес словаря `en` (предел `EN_MAX`);
 *   `config-subpath` и `config-root` сверяются с `JS_MAX` без него;
 * - `subpath-roadmap-edit` / `subpath-flow-map-edit` — `BaseRoadmap` и `BaseFlowMap` с подпути в `mode: 'edit'` + `tokens.css`: правка (у карты — палитра
 *   и инспектор) и её внутренние компоненты грузятся по `import()`, их CSS (BaseTabs, BaseTextarea…) подключают сами ленивые чанки: после показа правки
 *   правила есть на странице и снимок верный; `subpath-roadmap-view` / `subpath-flow-map-view` — просмотр: этих стилей в стартовом CSS нет;
 * - `plugin` — `createUiKitPlugin` из корня: тяжёлые компоненты (BaseTable…) не в стартовом JS, а в чанке по `import()` (FOLLOW_UPS № 58);
 *   плагин подключает `en` сам;
 * - автоимпорт (без сети, на пакете из tarball): `RiseUiResolver` из `/resolver` отдаёт для каждого публичного компонента подпуть, который
 *   есть в `exports` и в файлах пакета; `global.d.ts` перечисляет те же компоненты; модуль `/nuxt` ставит плагин, файл которого лежит в пакете,
 *   а с языком `zh` или `ja` в настройках — CSS шрифта иероглифов из `exports` пакета.
 *   Сборка приложения с `unplugin-vue-components` и Nuxt тянет пакеты из реестра — `npm run test:autoimport` (scripts/check-autoimport-app.mjs).
 *
 * Стартовый JS каждого сценария ограничен храповиком `JS_MAX`; словари проверяются по строке `text.EMPTY` (`ru` и `en`).
 *
 * В каждом сценарии код компонента должен дойти до приложения (класс `base-button`/`base-select` в JS), а в браузере —
 * отрисоваться: так ловится тряска дерева, которая выбрасывает компонент целиком (импорт есть, а компонент `undefined`).
 *
 * Шрифты кита (src/styles/fonts) приходят со стилями сами: в CSS каждого приложения есть `@font-face` Rise Grotesk и Rise Mono,
 * в сборке — все woff2 из `dist/fonts` пакета; в браузере Rise Grotesk (латиница, кириллица, знаки клавиш) и Rise Mono (400 и 700)
 * загружаются из сборки приложения (`document.fonts.load`, ответы 200). Шрифты иероглифов — только со словарём с подпути: `locale-zh`
 * и `locale-ja` (кнопка + `registerLocale(zh)`, словарь из `/locales/zh`) получают `@font-face` Rise CJK SC / JP и нарезку, а браузер
 * скачивает лишь куски со знаками на странице; у остальных сценариев (и у тех, что берут из корня `en`) ни CSS, ни файлов иероглифов
 * в сборке нет.
 *
 * Флаги: `--no-screenshot` — без снимков (нет Chromium для Playwright); `--keep` — не удалять временную папку.
 */

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
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

const DATE_PICKER_APP = from => `import { createApp, h, ref } from 'vue'
import { BaseDatePicker } from '${from}'
createApp({
	setup() {
		const value = ref(new Date(2025, 4, 7))
		return () => h('main', { style: 'padding: 24px; width: 320px' }, [
			h(BaseDatePicker, { label: 'Дата', modelValue: value.value, 'onUpdate:modelValue': next => (value.value = next) }),
		])
	},
}).mount('#app')
`

/** Кнопка с подписью на языке с иероглифами + словарь с подпути `/locales/<язык>`: шрифт языка (`fonts/cjk/<язык>.css`) приходит с ним */
const LOCALE_APP = (code, label) => `import { createApp, h } from 'vue'
import { BaseButton } from '${PACKAGE}/BaseButton'
import { registerLocale, setLocale } from '${PACKAGE}'
import { ${code} } from '${PACKAGE}/locales/${code}'
registerLocale(${code})
setLocale('${code}')
document.documentElement.lang = '${code}'
createApp({ render: () => h('main', { style: 'padding: 24px' }, [h(BaseButton, null, () => '${label}')]) }).mount('#app')
`

/** Кнопка + `createUiKitConfig`; `en` — английский язык: словарь `en` подключается явно (`registerLocale(en)`), как и все языки, кроме `ru` */
const CONFIG_APP = (buttonFrom, configFrom, { en = true } = {}) => `import { createApp, h } from 'vue'
import { BaseButton } from '${buttonFrom}'
import { createUiKitConfig } from '${configFrom}'
${en ? `import { en, registerLocale } from '${PACKAGE}'\nregisterLocale(en)\n` : ''}createApp({ render: () => h('main', { style: 'padding: 24px' }, [h(BaseButton, null, () => 'Сохранить')]) })
	.use(createUiKitConfig({ ${en ? "locale: 'en', " : ''}theme: 'corporate', motion: 'subtle', defaults: { BaseButton: { variant: 'soft' } } }))
	.mount('#app')
`

/** BaseRoadmap в «Правке»: правка и её внутренние компоненты (BaseTabs, BaseTextarea, BaseSelect…) — чанки по `import()`, их CSS подключает вход подпути */
const ROADMAP_EDIT_APP = from => `import { createApp, h } from 'vue'
import { BaseRoadmap } from '${from}'
const data = { version: 1, title: 'Путь', stages: [{ id: 's1', title: 'Основы', topics: [{ id: 't1', title: 'HTML', hours: 2 }] }] }
createApp({ render: () => h('main', { style: 'padding: 24px; width: 960px' }, [h(BaseRoadmap, { data, mode: 'edit', modes: ['view', 'edit'] })]) }).mount('#app')
`

/** Корень пакета + `styles.css` и переопределение `.base-tabs` той же специфичности после него: CSS ленивой части (слой `rise`) его не перебивает */
const ROOT_OVERRIDE_APP = `import { createApp, h } from 'vue'
import { BaseRoadmap } from '${PACKAGE}'
const override = document.createElement('style')
override.textContent = '.base-tabs { display: grid; }'
document.head.append(override)
const data = { version: 1, title: 'Путь', stages: [{ id: 's1', title: 'Основы', topics: [{ id: 't1', title: 'HTML', hours: 2 }] }] }
createApp({ render: () => h('main', { style: 'padding: 24px; width: 960px' }, [h(BaseRoadmap, { data, mode: 'edit', modes: ['view', 'edit'] })]) }).mount('#app')
`

/** BaseFlowMap в «Правке»: палитра и инспектор — чанки по `import()`, их CSS (BaseTabs, BaseInput…) подключают сами чанки */
const FLOW_MAP_EDIT_APP = from => `import { createApp, h } from 'vue'
import { BaseFlowMap } from '${from}'
const data = {
	version: 1,
	title: 'Заказы',
	nodes: [
		{ id: 'web', kind: 'client', label: 'Сайт', position: { x: 0, y: 0 }, isPinned: true },
		{ id: 'api', kind: 'gateway', label: 'API', position: { x: 300, y: 0 }, isPinned: true },
	],
	edges: [{ id: 'e1', source: 'web', target: 'api', label: 'HTTPS' }],
}
createApp({ render: () => h('main', { style: 'padding: 24px; width: 1500px; height: 640px' }, [h(BaseFlowMap, { data, mode: 'edit', modes: ['view', 'edit'] })]) }).mount('#app')
`

/** Просмотр BaseFlowMap и BaseRoadmap: ленивые части (правка, палитра, инспектор) не открываются, их CSS в стартовом CSS не нужен */
const FLOW_MAP_VIEW_APP = from => FLOW_MAP_EDIT_APP(from).replace(", mode: 'edit', modes: ['view', 'edit']", '')
const ROADMAP_VIEW_APP = from => ROADMAP_EDIT_APP(from).replace(", mode: 'edit', modes: ['view', 'edit']", '')

/** Приложение без кита и то же приложение с `registerLocale(en)`: разница gzip — вес словаря `en` отдельно от остального JS */
const BARE_APP = withEn => `import { createApp, h } from 'vue'
${withEn ? `import { en, registerLocale } from '${PACKAGE}'\nregisterLocale(en)\n` : ''}createApp({ render: () => h('main', { class: 'app-ready' }, 'ok') }).mount('#app')
`

const SCENARIOS = [
	{ name: 'subpath-button', css: 'tokens.css', code: BUTTON_APP(`${PACKAGE}/BaseButton`), marker: 'base-button' },
	{ name: 'root-button', css: 'styles.css', code: BUTTON_APP(PACKAGE), marker: 'base-button' },
	{ name: 'subpath-select', css: 'tokens.css', code: SELECT_APP(`${PACKAGE}/BaseSelect`), marker: 'base-select' },
	{ name: 'root-select', css: 'styles.css', code: SELECT_APP(PACKAGE), marker: 'base-select' },
	{ name: 'subpath-date-picker', css: 'tokens.css', code: DATE_PICKER_APP(`${PACKAGE}/BaseDatePicker`), marker: 'base-date-picker' },
	{
		name: 'config-subpath-ru',
		css: 'tokens.css',
		code: CONFIG_APP(`${PACKAGE}/BaseButton`, `${PACKAGE}/config`, { en: false }),
		marker: 'base-button',
		applied: 'base-button--soft',
	},
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
	{
		name: 'subpath-roadmap-edit',
		css: 'tokens.css',
		code: ROADMAP_EDIT_APP(`${PACKAGE}/BaseRoadmap`),
		marker: 'base-roadmap',
		// выбрать тему: инспектор рисует вкладки (BaseTabs) и поля (BaseTextarea) — их стили должны быть в CSS приложения
		after: async page => {
			await page.locator('[data-roadmap-topic] .base-roadmap__edit-pick').first().click()
			await page.locator('.base-tabs').first().waitFor({ timeout: 5000 })
			await waitStyleRules(page, ['.base-tabs', '.base-textarea'])
		},
	},
	{
		name: 'root-roadmap-edit-override',
		css: 'styles.css',
		code: ROOT_OVERRIDE_APP,
		marker: 'base-roadmap',
		// после открытия правки CSS ленивого чанка загружен (стили BaseTabs в слое `rise`), переопределение приложения по-прежнему действует
		after: async page => {
			await page.locator('[data-roadmap-topic] .base-roadmap__edit-pick').first().click()
			await page.locator('.base-tabs').first().waitFor({ timeout: 5000 })
			await page.waitForFunction(
				() =>
					[...document.styleSheets].some(sheet =>
						[...sheet.cssRules].some(
							rule => rule.cssText.includes('@layer rise') || rule.constructor.name === 'CSSLayerBlockRule',
						),
					),
				null,
				{ timeout: 5000 },
			)
			const display = await page
				.locator('.base-tabs')
				.first()
				.evaluate(element => getComputedStyle(element).display)
			if (display !== 'grid')
				throw new Error(`root-roadmap-edit-override: переопределение .base-tabs перебито CSS ленивого чанка (display: ${display})`)
		},
	},
	{ name: 'subpath-roadmap-view', css: 'tokens.css', code: ROADMAP_VIEW_APP(`${PACKAGE}/BaseRoadmap`), marker: 'base-roadmap' },
	{
		name: 'subpath-flow-map-edit',
		css: 'tokens.css',
		code: FLOW_MAP_EDIT_APP(`${PACKAGE}/BaseFlowMap`),
		marker: 'base-flow-map',
		viewport: { width: 1600, height: 800 },
		// палитра и инспектор (выбранный узел) — чанки по import(): их стили приходят вместе с ними
		after: async page => {
			await page.locator('.base-flow-map__edit-palette').waitFor({ timeout: 5000 })
			await page.locator('.base-flow-map__node').first().click()
			await page.locator('section.base-flow-map__edit-inspector').waitFor({ timeout: 5000 })
			await page.locator('.base-tabs').first().waitFor({ timeout: 5000 })
			await waitStyleRules(page, ['.base-flow-map__edit-palette', '.base-flow-map__edit-inspector', '.base-tabs'])
		},
	},
	{ name: 'subpath-flow-map-view', css: 'tokens.css', code: FLOW_MAP_VIEW_APP(`${PACKAGE}/BaseFlowMap`), marker: 'base-flow-map' },
	{ name: 'bare-app', css: 'tokens.css', code: BARE_APP(false), marker: 'app-ready' },
	{ name: 'bare-app-en', css: 'tokens.css', code: BARE_APP(true), marker: 'app-ready' },
	{ name: 'plugin', css: 'styles.css', code: PLUGIN_APP, marker: 'base-button' },
	{
		name: 'locale-zh',
		css: 'tokens.css',
		code: LOCALE_APP('zh', '保存设置'),
		marker: 'base-button',
		cjk: { family: 'Rise CJK SC', dir: 'sc', text: '保存设置' },
	},
	{
		name: 'locale-ja',
		css: 'tokens.css',
		code: LOCALE_APP('ja', '設定を保存'),
		marker: 'base-button',
		cjk: { family: 'Rise CJK JP', dir: 'jp', text: '設定を保存' },
	},
]

/**
 * Пределы стартового gzip-JS сценариев (вместе с vue, ≈23 КБ) — храповик веса точечной установки. Замер 17.10 после выноса словарей
 * (w16-lazy-locale; до него — в скобках): кнопка 27,8 (27,8); BaseSelect 53,7 (92,4); BaseDatePicker 68,1 (105,8); кнопка +
 * `createUiKitConfig` без языка 34,6 (77,9), с `registerLocale(en)` и `locale: 'en'` 54,2 / 54,4 из корня (77,9); плагин 454,0 (455,5).
 * Запас ≈10 %; поднимать осознанно, строкой в DECISIONS.
 * 20.10 (subpaths-guards): `subpath-roadmap-edit` 90,5 КБ → предел 95 (замер плюс ≈5 %); `plugin` 500,3 → предел 525: полный плагин несёт все
 * компоненты и вырос с фазой 2 карты и роадмапа (до этого предел 500 был красным уже без правки группы).
 */
const JS_MAX = {
	'subpath-button': 31,
	'subpath-select': 59,
	'subpath-date-picker': 75,
	'config-subpath-ru': 38,
	'config-subpath': 60,
	'config-root': 60,
	'subpath-roadmap-edit': 95,
	plugin: 525,
}

/** Сценарии, в которых `JS_MAX` считается без словаря `en`: его вес — отдельно, `EN_MAX` (решение 20.10 02:23) */
const WITHOUT_EN = ['config-subpath', 'config-root']

/**
 * Предел веса словаря `en` (gzip, КБ) — разница `bare-app-en` и `bare-app`. `en` — полный пакет строк всех компонентов и растёт вместе
 * с китом, поэтому у него свой предел: замер плюс ≈10 % (20.10: замер 31,5 КБ → 35; при пределе 45 рост на 13 КБ прошёл бы незамеченным).
 * Поднимать осознанно, строкой в DECISIONS.
 */
const EN_MAX = 35

/** Строки словарей: `text.EMPTY` русского и английского — по ним видно, какие словари и разделы попали в сборку */
const RU_TEXT = 'Нет данных'
const EN_TEXT = 'No data'

const kb = bytes => `${(bytes / 1024).toFixed(1)} КБ`

/** Семейства шрифтов кита и текст, который загружает все их файлы: латиница, кириллица, знак клавиши, ₽ */
const FONT_SAMPLES = [
	['16px "Rise Grotesk"', 'Aa Яя ⌘'],
	['16px "Rise Mono"', 'Aa Яя ₽'],
	['700 16px "Rise Mono"', 'Aa Яя'],
]

/** Куски шрифта иероглифов в пакете (`dist/fonts/cjk/<папка>/*.woff2`) — имена без расширения */
function cjkSlices(dir) {
	const folder = join(ROOT, 'dist/fonts/cjk', dir)
	return existsSync(folder) ? readdirSync(folder).filter(name => name.endsWith('.woff2')) : []
}

/** Предел, до которого Vite приложения вставляет ассет в CSS как data: URI (`build.assetsInlineLimit` по умолчанию) */
const INLINE_LIMIT = 4096

/**
 * Файлы шрифтов пакета (`dist/fonts/*.woff2`): имя без расширения и встроит ли его Vite приложения в CSS (меньше INLINE_LIMIT).
 * Остальные в сборке приложения лежат как `assets/<имя>-<хеш>.woff2`.
 */
function kitFonts() {
	const dir = join(ROOT, 'dist/fonts')
	if (!existsSync(dir)) return []
	return readdirSync(dir)
		.filter(name => name.endsWith('.woff2'))
		.map(name => ({ name: name.slice(0, -'.woff2'.length), inlined: statSync(join(dir, name)).size < INLINE_LIMIT }))
}

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

/** Стартовый CSS: файлы из `<link rel="stylesheet">` страницы; CSS ленивых чанков приложение подтягивает при их загрузке */
function initialCss(dir) {
	const html = readFileSync(join(dir, 'index.html'), 'utf8')
	const files = [...html.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="\/assets\/([^"]+)"/g)].map(match => match[1])
	return files.map(name => readFileSync(join(dir, 'assets', name), 'utf8')).join('\n')
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
		cssInitial: initialCss(out),
		fonts: readdirSync(join(out, 'assets')).filter(name => name.endsWith('.woff2')),
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
	for (const name of ['config-subpath', 'config-subpath-ru', 'config-root', 'bare-app-en']) {
		const config = results[name]
		expect(problems, !/base-table|base-editor/.test(config.js.text), `${name}: в JS есть код BaseTable или BaseEditor`)
		expect(
			problems,
			!/base-table|base-editor/.test(config.allJs),
			`${name}: BaseTable или BaseEditor попали в сборку (в том числе чанком по import())`,
		)
		expect(problems, config.lazy === 0, `${name}: в сборке есть чанки по import() — реестр компонентов плагина не отсечён`)
	}
	checkDictionaries(results, problems)
	const roadmapEdit = results['subpath-roadmap-edit']
	for (const name of ['.base-roadmap', '.base-tabs', '.base-textarea', '.base-select', '.base-input']) {
		expect(problems, roadmapEdit.css.text.includes(name), `subpath-roadmap-edit: в CSS нет ${name} (стили ленивой части правки)`)
	}
	expect(problems, /base-roadmap__inspector/.test(roadmapEdit.allJs), 'subpath-roadmap-edit: нет кода правки (чанк по import())')
	checkLazyCss(results, problems)
	checkFontFiles(results, problems)
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

/** Стили компонентов, которые берёт только ленивая часть, приходят вместе с чанком: в стартовом CSS просмотра их нет, в CSS приложения с правкой — есть */
function checkLazyCss(results, problems) {
	const lazyOnly = {
		'subpath-roadmap': ['.base-tabs', '.base-textarea'],
		// стили самой карты (палитра, инспектор) лежат в её style.css целиком (≈3 КБ gzip, FOLLOW_UPS); ленивым чанкам принадлежат CSS чужих компонентов
		'subpath-flow-map': ['.base-tabs', '.base-switch'],
	}
	for (const [prefix, selectors] of Object.entries(lazyOnly)) {
		const view = results[`${prefix}-view`]
		const edit = results[`${prefix}-edit`]
		for (const selector of selectors) {
			expect(
				problems,
				!view.cssInitial.includes(selector),
				`${view.name}: в стартовом CSS просмотра есть ${selector} (стили ленивой части)`,
			)
			expect(problems, edit.css.text.includes(selector), `${edit.name}: в CSS приложения нет ${selector} (стили ленивой части)`)
			expect(
				problems,
				!edit.cssInitial.includes(selector),
				`${edit.name}: ${selector} в стартовом CSS — стили ленивой части должны приходить с чанком`,
			)
		}
		console.log(
			`CSS ${prefix}: просмотр ${kb(view.css.gzip)}, с правкой ${kb(edit.css.gzip)} (стартовый ${kb(gzipSync(view.cssInitial).length)} и ${kb(gzipSync(edit.cssInitial).length)}).`,
		)
	}
}

/** Шрифты кита в сборке приложения: `@font-face` обоих семейств в CSS и все woff2 пакета среди ассетов */
function checkFontFiles(results, problems) {
	const fonts = kitFonts()
	expect(problems, fonts.length > 0, 'шрифты: в dist/fonts пакета нет woff2 — сначала `npm run build`')
	for (const result of Object.values(results)) {
		for (const family of ['Rise Grotesk', 'Rise Mono']) {
			const declared = new RegExp(`@font-face\\s*\\{[^}]*font-family:\\s*["']?${family}`).test(result.css.text)
			expect(problems, declared, `${result.name}: в CSS приложения нет @font-face «${family}»`)
		}
		const cjkFiles = result.fonts.filter(file => file.startsWith('rise-cjk-'))
		if (result.cjk) {
			const declared = result.css.text.includes(result.cjk.family)
			expect(
				problems,
				declared,
				`${result.name}: в CSS приложения нет @font-face «${result.cjk.family}» — словарь не подключил шрифт`,
			)
			const slices = cjkSlices(result.cjk.dir).length
			expect(
				problems,
				slices > 0 && cjkFiles.length === slices,
				`${result.name}: в сборке ${cjkFiles.length} кусков шрифта из ${slices}`,
			)
		} else {
			expect(
				problems,
				!/@font-face\s*\{[^}]*Rise CJK/.test(result.css.text),
				`${result.name}: в CSS приложения @font-face шрифта иероглифов без словаря zh или ja`,
			)
			expect(
				problems,
				cjkFiles.length === 0,
				`${result.name}: в сборке файлы шрифта иероглифов без словаря: ${cjkFiles.slice(0, 3).join(', ')}`,
			)
		}
		const missing = fonts.filter(({ name }) => !result.fonts.some(file => file.startsWith(`${name}-`)))
		const lost = missing.filter(({ inlined }) => !inlined || !result.css.text.includes('data:font/woff2'))
		expect(
			problems,
			lost.length === 0,
			`${result.name}: в сборке приложения нет шрифтов кита: ${lost.map(({ name }) => name).join(', ')}`,
		)
	}
}

/** Вес по храповику `JS_MAX` и словари: русские разделы — только прочитанные, английский — только после `registerLocale(en)` */
function checkDictionaries(results, problems) {
	const enSize = results['bare-app-en'].js.gzip - results['bare-app'].js.gzip
	console.log(`Словарь en отдельно: ${kb(enSize)} (предел ${EN_MAX} КБ).`)
	expect(problems, enSize <= EN_MAX * 1024, `словарь en: ${kb(enSize)} — больше предела ${EN_MAX} КБ (EN_MAX)`)
	for (const [name, limit] of Object.entries(JS_MAX)) {
		const size = results[name].js.gzip - (WITHOUT_EN.includes(name) ? enSize : 0)
		expect(
			problems,
			size <= limit * 1024,
			`${name}: стартовый JS ${WITHOUT_EN.includes(name) ? 'без en ' : ''}${kb(size)} — больше предела ${limit} КБ (JS_MAX): в сборку попало лишнее`,
		)
	}
	for (const name of ['subpath-button', 'config-subpath-ru']) {
		expect(problems, !results[name].allJs.includes(RU_TEXT), `${name}: в сборке раздел text словаря ru, хотя кнопка его не читает`)
	}
	for (const name of ['subpath-button', 'subpath-select', 'subpath-date-picker', 'config-subpath-ru', 'bare-app']) {
		expect(problems, !results[name].allJs.includes(EN_TEXT), `${name}: в сборке словарь en без registerLocale(en)`)
	}
	for (const name of ['config-subpath', 'config-root', 'plugin', 'bare-app-en']) {
		expect(problems, results[name].js.text.includes(EN_TEXT), `${name}: нет словаря en, хотя он подключён`)
	}
}

/** Ждёт, пока в таблицах стилей страницы появятся правила с этими селекторами: CSS ленивого чанка подтягивается вместе с чанком */
async function waitStyleRules(page, selectors) {
	await page.waitForFunction(
		list => {
			const text = [...document.styleSheets].map(sheet => [...sheet.cssRules].map(rule => rule.cssText).join('\n')).join('\n')
			return list.every(selector => text.includes(selector))
		},
		selectors,
		{ timeout: 5000 },
	)
}

/** Открывает приложение; у выпадающего списка — раскрывает его. Снимок — в `file`, без снимка — `null`, если компонент не отрисован */
async function screenshot(browser, result, file) {
	const server = await preview({ root: result.dir, configFile: false, logLevel: 'error', build: { outDir: '.' }, preview: { port: 0 } })
	const page = await browser.newPage({ viewport: result.viewport ?? { width: 400, height: 400 }, reducedMotion: 'reduce' })
	page.on('pageerror', error => result.errors.push(error.message))
	page.on('console', message => message.type() === 'error' && result.errors.push(message.text()))
	page.on('response', response => response.url().endsWith('.woff2') && result.fontResponses.set(response.url(), response.status()))
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
			await page.getByRole('listbox').waitFor({ state: 'visible' })
			await page.getByRole('option', { name: 'Волгоград' }).waitFor()
			await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
		}
		if (result.after) await result.after(page)
		if (result.applied) await page.locator(`.${result.applied}`).first().waitFor({ timeout: 5000 })
		const samples = result.cjk ? [...FONT_SAMPLES, [`16px "${result.cjk.family}"`, result.cjk.text]] : FONT_SAMPLES
		result.fontFaces = await page.evaluate(loadKitFonts, samples)
		await page.screenshot({ path: file, animations: 'disabled' })
		return readFileSync(file)
	} finally {
		await page.close()
		await server.close()
	}
}

/** В браузере: загружает начертания кита для образцов текста; у каждого — список загруженных FontFace (семейство, насыщенность, статус) */
async function loadKitFonts(samples) {
	const loaded = []
	for (const [font, text] of samples) {
		const faces = await document.fonts.load(font, text).catch(() => [])
		loaded.push({ font, faces: faces.map(face => `${face.family} ${face.weight} ${face.status}`) })
	}
	return loaded
}

/** Шрифты кита в браузере: каждый образец загрузил свои начертания, файлы шрифтов пришли из сборки приложения с ответом 200 */
function checkLoadedFonts(result, problems) {
	for (const { font, faces } of result.fontFaces ?? []) {
		const ok = faces.length > 0 && faces.every(face => face.endsWith(' loaded'))
		expect(problems, ok, `${result.name}: шрифт ${font} не загрузился: ${faces.join('; ') || 'нет начертаний'}`)
	}
	const files = [...result.fontResponses]
	const failed = files.filter(([, status]) => status !== 200)
	expect(
		problems,
		failed.length === 0,
		`${result.name}: файлы шрифтов с ошибкой: ${failed.map(([url, status]) => `${url} ${status}`).join('; ')}`,
	)
	const cjk = files.filter(([url]) => /\/rise-cjk-/.test(url))
	const expected = kitFonts().filter(({ inlined }) => !inlined).length
	expect(
		problems,
		files.length - cjk.length >= expected,
		`${result.name}: загружено ${files.length - cjk.length} файлов шрифтов из ${expected}`,
	)
	if (!result.cjk) return
	const slices = cjkSlices(result.cjk.dir).length
	expect(problems, cjk.length > 0 && cjk.length < slices, `${result.name}: скачано ${cjk.length} кусков шрифта иероглифов из ${slices}`)
	console.log(`${result.name}: для «${result.cjk.text}» скачано ${cjk.length} из ${slices} кусков ${result.cjk.family}`)
}

async function compareScreenshots(app, results, problems) {
	const { chromium } = await import('playwright')
	const browser = await chromium.launch()
	const shots = {}
	try {
		for (const result of Object.values(results)) {
			result.errors = []
			result.fontResponses = new Map()
			shots[result.name] = await screenshot(browser, result, join(app, `${result.name}.png`))
			expect(problems, shots[result.name] !== null, `${result.name}: компонент не отрисовался в браузере (.${result.marker})`)
			expect(problems, result.errors.length === 0, `${result.name}: ошибки в консоли браузера: ${result.errors.join('; ')}`)
			checkLoadedFonts(result, problems)
		}
		const sample = Object.values(results)[0]
		console.log(`Шрифты в браузере (${sample.name}): ${sample.fontFaces?.map(({ faces }) => faces.join(', ')).join('; ')}`)
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

/** Автоимпорт на файлах пакета из tarball: что отдаёт резолвер и модуль Nuxt, есть ли это в `exports` и на диске */
async function checkAutoimport(app, problems) {
	const pkgDir = join(app, 'node_modules', PACKAGE)
	const pkg = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8'))
	const file = target => join(pkgDir, target)
	const exportedFile = key => {
		const target = pkg.exports[key]
		return typeof target === 'string' ? target : (target?.import ?? target?.types)
	}
	const { RiseUiResolver } = await import(pathToFileURL(file(exportedFile('./resolver'))).href)
	const { default: nuxtModule } = await import(pathToFileURL(file(exportedFile('./nuxt'))).href)
	const components = Object.keys(pkg.exports)
		.filter(key => /^\.\/Base\w+$/.test(key))
		.map(key => key.slice(2))
	const resolver = RiseUiResolver()
	const withTokens = RiseUiResolver({ tokens: true })

	for (const name of components) {
		const info = resolver.resolve(name)
		const key = info && `.${info.from.slice(PACKAGE.length)}`
		expect(problems, info?.name === name && key === `./${name}`, `автоимпорт: ${name} — резолвер отдал ${JSON.stringify(info)}`)
		expect(problems, key && existsSync(file(exportedFile(key))), `автоимпорт: подпуть ${name} не найден в файлах пакета`)
		expect(
			problems,
			withTokens.resolve(name)?.sideEffects?.[0] === `${PACKAGE}/tokens.css`,
			`автоимпорт: ${name} без tokens.css в sideEffects`,
		)
	}
	const player = resolver.resolve('BaseMediaPlayer')
	expect(
		problems,
		player?.from === `${PACKAGE}/media` && player.sideEffects?.[0] === `${PACKAGE}/media.css`,
		'автоимпорт: BaseMediaPlayer',
	)
	expect(
		problems,
		existsSync(file(exportedFile('./media'))) && existsSync(file(pkg.exports['./media.css'].import)),
		'автоимпорт: нет /media или media.css',
	)
	expect(
		problems,
		resolver.resolve('RouterLink') === undefined && resolver.resolve('BaseNope') === undefined,
		'автоимпорт: резолвер взял чужое имя',
	)

	const types = readFileSync(file(exportedFile('./global')), 'utf8')
	const typed = [...types.matchAll(/^\t\t(Base\w+): typeof import\('[^']+\/(Base\w+)'\)\['(Base\w+)'\]$/gm)]
	expect(
		problems,
		typed.length === components.length && typed.every(([, a, b, c]) => a === b && b === c),
		'автоимпорт: global.d.ts не по списку компонентов',
	)
	expect(
		problems,
		types.includes("declare module 'vue'") && types.includes('GlobalComponents'),
		'автоимпорт: global.d.ts без GlobalComponents',
	)

	const nuxt = { options: { css: [], build: { transpile: [] }, plugins: [], runtimeConfig: { public: {} } }, hook() {} }
	nuxtModule({ config: { locale: 'en' } }, nuxt)
	const pluginFile = nuxt.options.plugins[0]?.src
	expect(
		problems,
		pluginFile && existsSync(pluginFile) && pluginFile.startsWith(pkgDir),
		'автоимпорт: плагин модуля Nuxt не найден в пакете',
	)
	expect(
		problems,
		nuxt.options.css[0] === `${PACKAGE}/tokens.css` && nuxt.options.build.transpile[0] === PACKAGE,
		'автоимпорт: модуль Nuxt не добавил токены и transpile',
	)
	for (const code of ['zh', 'ja']) {
		const cjk = { options: { css: [], build: { transpile: [] }, plugins: [], runtimeConfig: { public: {} } }, hook() {} }
		nuxtModule({ tokens: false, config: { locale: code } }, cjk)
		const css = cjk.options.css[0] ?? ''
		const target = css.startsWith(`${PACKAGE}/`) && exportedFile(`.${css.slice(PACKAGE.length)}`)
		expect(
			problems,
			cjk.options.css.length === 1 && target && existsSync(file(target)),
			`автоимпорт: модуль Nuxt с языком ${code} не подключил шрифт иероглифов из пакета: ${cjk.options.css.join(', ') || 'ничего'}`,
		)
	}
	console.log(`Автоимпорт: ✓ ${components.length} компонентов резолвера, global.d.ts и модуль Nuxt совпадают с пакетом из tarball.`)
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
		await checkAutoimport(app, problems)
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
