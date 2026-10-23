/**
 * Story падает при ошибке рендера/play, необработанном исключении, console.error, внешних запросах или нарушениях axe;
 * `__story-missing` — намеренное исключение. Stories с тегом `!test` пропускаются: в index.json Storybook снимает тег
 * `test`, поэтому проверяется его отсутствие. Тег должен стоять в `X.stories.ts` (`export const X = { ...cases.X, tags: ['!test'] }`):
 * индексатор читает файл статически и тегов у `cases.X` не видит.
 *
 * `--themes=<список>` — в каких темах прогонять (по умолчанию `light,dark`). Тема — режим или бренд с режимом:
 * - `light`, `dark` — режим (глобал Storybook `theme`), бренд `rise` — кит как есть;
 * - `<бренд>-<режим>` — бренд (глобал `brand`: `rise`, `corporate`, `playful`, `minimal`, `custom`) поверх режима,
 *   например `corporate-light,corporate-dark`; `<бренд>` без режима — оба режима: `corporate` = `corporate-light,corporate-dark`.
 * Пример: `node scripts/check-stories.mjs --filter='^foundations-' --themes=light,dark,corporate,playful,minimal`.
 *
 * `--widths=<список>` — ширины окна в px (по умолчанию одна — `DEFAULT_WIDTH`), каждая история на каждой ширине; CI гоняет `375,1280`.
 * После play страница не должна прокручиваться по горизонтали: `scrollWidth` не больше `clientWidth` и ни один видимый элемент
 * не выступает за конечный край окна (правый в LTR, левый в RTL) (с учётом обрезки предками с `overflow`; `position: fixed` и скрытое не считаются).
 * Рамки историй с намеренной внутренней прокруткой обрезаются своим `overflow` и выступом не считаются; настоящие исключения —
 * в `OVERFLOW_ALLOWED` с причиной. Результат — в отчёте тем же форматом: ошибка «Переполнение по ширине…», у записи поле `width`.
 * `--dir=<ltr|rtl>` — направление письма (глобал Storybook `dir`: `dir` на html и корне истории); без параметра — как в preview.ts (`ltr`).
 * Пример: `node scripts/check-stories.mjs --dir=rtl --themes=light` — все stories справа налево. Зеркалирование и переполнение страницы
 * по ширинам 1280 и 375 проверяет `node scripts/check-rtl.mjs` (docs/design/DESIGN_SYSTEM.md, «Письмо справа налево»).
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname } from 'node:path'
import { chromium } from '@playwright/test'

const require = createRequire(import.meta.url)
// axe-core той же версии, что проверяет stories в панели Accessibility
const AXE_PATH = createRequire(require.resolve('@storybook/addon-a11y/package.json')).resolve('axe-core/axe.min.js')
const AXE_SOURCE = readFileSync(AXE_PATH, 'utf-8')

/** Правила уровня страницы: компонент рендерится изолированно, без <main>, заголовка h1 и lang (как в preview.ts). */
const PAGE_LEVEL_RULES = ['html-has-lang', 'landmark-one-main', 'page-has-heading-one', 'region', 'bypass']
/**
 * Конец play и конец рендера. Во время play Storybook перерисовывает историю (реактивные правки) и каждая перерисовка проходит
 * `completing → completed → afterEach → finished`, поэтому первый `finished` приходит ещё посреди play. Настоящий конец play —
 * фаза `played` (при исключении — `errored`, при отмене — `aborted`); после неё ждём `finished` и тишину в смене фаз.
 */
const PLAY_END_PHASES = ['played', 'errored', 'aborted']
const FINAL_PHASES = ['finished', 'errored', 'aborted']
/** Тишина (мс) без смены фаз рендера после конца play: перерисовка от последнего шага ещё может идти */
const QUIET_MS = 300
const FAILED_EVENTS = ['playFunctionThrewException', 'storyThrewException', 'storyErrored', 'unhandledErrorsWhilePlaying']
const RENDER_TIMEOUT = 30_000
const DEFAULT_WIDTH = 1100
const VIEWPORT_HEIGHT = 800
/** Допуск округления: подпиксельные границы и 1 px рамки не считаются переполнением */
const OVERFLOW_TOLERANCE = 1
/**
 * Истории, которым переполнение страницы разрешено: `{ id: RegExp id истории, widths?: [px], reason }`.
 * Пока пусто: все истории укладываются в 375 и 1280 px. Добавлять только с причиной, которую нельзя убрать правкой истории.
 */
const OVERFLOW_ALLOWED = []
/** Окно уже этого (px) — телефонная раскладка (`respond-below('mobile')`, src/styles/_variables.scss) */
const NARROW_WIDTH = 640
/**
 * Истории, play которых написан для настольной раскладки: на узком окне компонент перестраивается (меню — в кнопку, разделы панели
 * свёрнуты, кнопки плеера уходят в меню, полосы миниатюр под слайд), и play не находит элементов. Падение play у таких историй
 * на ширине < `NARROW_WIDTH` не считается ошибкой, помечается в отчёте полем `playSkipped`; переполнение страницы и axe проверяются.
 * Список сокращается по мере того, как play учат узкую раскладку (docs/design/FOLLOW_UPS.md, «Задача w16-ci-checks»).
 */
const NARROW_PLAY_EXCEPTIONS = [
	{ id: /^navigation-basemegamenu--/, reason: 'на телефоне меню — кнопка «Меню» с выдвижным списком, play ищет пункты верхнего уровня' },
	{
		id: /^media-baseimagemapeditor--(floors|groups|long-content|fields-3-d|editor-filters|editor-styles|editor-parts-3-d)$/,
		reason: 'на узком окне разделы панели свёрнуты, play ищет элементы свёрнутых разделов',
	},
	{
		id: /^media-basemediaplayer--(default|episodes|theater|share)$/,
		reason: 'на узком окне часть кнопок плеера уходит в меню, play ищет их на панели',
	},
	{ id: /^data-basedescriptions--responsive$/, reason: 'рамки 300 и 500 px сжимаются до окна, обе дают одну колонку' },
	{ id: /^data-baseslider--thumbnails-(left|right)$/, reason: 'на узком окне полоса миниатюр уходит под слайд' },
	{ id: /^data-basetable--(resizable-columns|column-resize-touch)$/, reason: 'play меняет ширину колонок в пределах таблицы шире окна' },
	{
		id: /^navigation-basestepper--narrow$/,
		reason: 'история сама сравнивает узкий и широкий степпер по ширине рамки, в окне 375 px рамки совпадают',
	},
]
/** Адреса, которые stories запрашивают заведомо без ответа, чтобы показать ошибку загрузки */
const EXPECTED_MISSING_RE = /__story-missing/
/** Режимы и бренды тем: глобалы `theme` и `brand` из build/storybook/preview.ts */
const MODES = ['light', 'dark']
const DIRECTIONS = ['ltr', 'rtl']
const BRANDS = ['rise', 'corporate', 'playful', 'minimal', 'custom']

/** Имя темы из `--themes` → имена с режимом: `light` → `light`, `corporate` → `corporate-light`, `corporate-dark` */
function expandTheme(name) {
	if (MODES.includes(name)) return [name]
	if (BRANDS.includes(name)) return MODES.map(mode => `${name}-${mode}`)
	const [brand, mode] = [name.slice(0, name.lastIndexOf('-')), name.slice(name.lastIndexOf('-') + 1)]
	if (BRANDS.includes(brand) && MODES.includes(mode)) return [name]
	console.error(`❌ Неизвестная тема «${name}»: ${MODES.join(', ')}, <бренд>-<режим> или <бренд>; бренды — ${BRANDS.join(', ')}`)
	process.exit(2)
}

/** Глобалы Storybook темы для URL: `corporate-dark` → `theme:dark;brand:corporate` */
function themeGlobals(theme) {
	if (MODES.includes(theme)) return `theme:${theme}`
	const at = theme.lastIndexOf('-')
	return `theme:${theme.slice(at + 1)};brand:${theme.slice(0, at)}`
}

function parseArgs(argv) {
	const options = { url: 'http://localhost:6006', themes: 'light,dark', filter: '', concurrency: '4', report: '', widths: '', dir: '' }
	for (const arg of argv) {
		const match = /^--([a-z]+)=(.*)$/.exec(arg)
		if (!match || !(match[1] in options)) {
			console.error(`❌ Неизвестный параметр: ${arg}`)
			process.exit(2)
		}
		options[match[1]] = match[2]
	}
	if (options.dir && !DIRECTIONS.includes(options.dir)) {
		console.error(`❌ Неизвестное направление «${options.dir}»: ${DIRECTIONS.join(', ')}`)
		process.exit(2)
	}
	return {
		dir: options.dir,
		url: options.url.replace(/\/$/, ''),
		themes: [...new Set(options.themes.split(',').filter(Boolean).flatMap(expandTheme))],
		filter: options.filter ? new RegExp(options.filter) : null,
		concurrency: Math.max(1, Number(options.concurrency) || 1),
		report: options.report,
		widths: parseWidths(options.widths),
	}
}

/** `--widths=375,1280` → `[375, 1280]`; без параметра — одна ширина по умолчанию */
function parseWidths(value) {
	if (!value) return [DEFAULT_WIDTH]
	const widths = value.split(',').map(Number)
	if (widths.some(width => !Number.isInteger(width) || width < 200 || width > 4000)) {
		console.error(`❌ --widths: целые числа от 200 до 4000 через запятую, получено «${value}»`)
		process.exit(2)
	}
	return [...new Set(widths)]
}

/** Слушатель событий Storybook в iframe: ошибки play-функции приходят через канал аддонов. */
const CHANNEL_LISTENER = `
	window.__storyEvents = [];
	window.__storyPlayEnded = false;
	window.__storyPhaseAt = performance.now();
	(function attach() {
		const channel = window.__STORYBOOK_ADDONS_CHANNEL__;
		if (!channel) return setTimeout(attach, 5);
		channel.on('storyRenderPhaseChanged', ({ newPhase }) => {
			window.__storyPhaseAt = performance.now();
			if (${JSON.stringify(PLAY_END_PHASES)}.includes(newPhase)) window.__storyPlayEnded = true;
		});
		for (const name of ${JSON.stringify(FAILED_EVENTS)}) {
			channel.on(name, (...args) => {
				let details;
				try { details = JSON.stringify(args).slice(0, 600); } catch (error) { details = String(error); }
				window.__storyEvents.push({ name, details });
			});
		}
	})();
`

/** Настройки axe для текущей story: правила уровня страницы и её собственные parameters.a11y. */
function readA11yConfig(pageLevelRules) {
	const a11y = window.__STORYBOOK_PREVIEW__?.currentRender?.story?.parameters?.a11y ?? {}
	if (a11y.disable === true || a11y.test === 'off') return null
	const rules = Object.fromEntries(pageLevelRules.map(id => [id, { enabled: false }]))
	for (const rule of a11y.config?.rules ?? []) rules[rule.id] = { enabled: rule.enabled !== false }
	return rules
}

async function runAxe(rules) {
	const result = await window.axe.run(document, { rules, resultTypes: ['violations'] })
	return result.violations.map(violation => ({
		id: violation.id,
		impact: violation.impact,
		nodes: violation.nodes.length,
		target: violation.nodes[0]?.target?.join(' '),
		summary: violation.nodes[0]?.failureSummary?.slice(0, 300),
	}))
}

/**
 * Горизонтальное переполнение страницы (выполняется в браузере): запас прокрутки документа и самый выступающий
 * за конечный край окна видимый элемент (правый в LTR, левый в RTL). Обход сверху вниз несёт конечную границу, до которой предки
 * с `overflow` обрезают потомков; координаты вдоль строки: `right` в LTR, `-left` в RTL.
 */
function measureOverflow() {
	const root = document.documentElement
	const viewport = root.clientWidth
	const rtl = getComputedStyle(root).direction === 'rtl'
	const limit = rtl ? 0 : viewport
	const endOf = rect => (rtl ? -rect.left : rect.right)
	let worst = 0
	let culprit = ''
	function describe(node) {
		const classes = typeof node.className === 'string' ? node.className.trim().split(/\s+/).filter(Boolean).slice(0, 2) : []
		return node.tagName.toLowerCase() + (node.id ? `#${node.id}` : '') + classes.map(name => `.${name}`).join('')
	}
	function walk(node, clipEnd) {
		const style = getComputedStyle(node)
		if (style.display === 'none' || style.position === 'fixed') return
		const rect = node.getBoundingClientRect()
		if (rect.width > 0 && style.visibility === 'visible') {
			const excess = Math.min(endOf(rect), clipEnd) - limit
			if (excess > worst) {
				worst = excess
				culprit = describe(node)
			}
		}
		const childClip = style.overflowX === 'visible' ? clipEnd : Math.min(clipEnd, endOf(rect))
		for (const child of node.children) walk(child, childClip)
	}
	return document.fonts.ready.then(
		() =>
			new Promise(resolve =>
				requestAnimationFrame(() =>
					requestAnimationFrame(() => {
						for (const child of document.body.children) walk(child, Infinity)
						resolve({ page: root.scrollWidth - viewport, viewport, worst: Math.round(worst), culprit })
					}),
				),
			),
	)
}

function overflowError(measured, width) {
	const parts = []
	if (measured.page > OVERFLOW_TOLERANCE)
		parts.push(`страница шире окна на ${measured.page} px (scrollWidth ${measured.viewport + measured.page} > ${measured.viewport})`)
	if (measured.worst > OVERFLOW_TOLERANCE) parts.push(`${measured.culprit} выступает за конечный край окна на ${measured.worst} px`)
	return parts.length ? `Переполнение по ширине ${width} px: ${parts.join('; ')}` : null
}

function isOverflowMessage(error) {
	return error.startsWith('Переполнение по ширине')
}

function isOverflowAllowed(id, width) {
	return OVERFLOW_ALLOWED.some(entry => entry.id.test(id) && (!entry.widths || entry.widths.includes(width)))
}

async function checkStory(page, options, story, theme, width) {
	const result = { id: story.id, theme, width, errors: [], violations: [] }
	const onPageError = error => result.errors.push(`Исключение: ${String(error.message).slice(0, 300)}`)
	const onConsole = message => {
		// Ошибки загрузки ресурсов браузер дублирует в консоль — их проверяет onResponse
		if (message.type() !== 'error' || message.text().startsWith('Failed to load resource')) return
		result.errors.push(`console.error: ${message.text().slice(0, 300)}`)
	}
	const onResponse = response => {
		if (response.status() >= 400 && !EXPECTED_MISSING_RE.test(response.url())) {
			result.errors.push(`HTTP ${response.status()}: ${response.url().slice(0, 200)}`)
		}
	}
	page.on('pageerror', onPageError)
	page.on('console', onConsole)
	page.on('response', onResponse)
	try {
		await page.goto(
			`${options.url}/iframe.html?id=${story.id}&viewMode=story&globals=${themeGlobals(theme)}${options.dir ? `;dir:${options.dir}` : ''}`,
			{
				waitUntil: 'load',
				timeout: 60_000,
			},
		)
		const phase = await page
			.waitForFunction(
				({ finalPhases, quietMs }) => {
					const render = window.__STORYBOOK_PREVIEW__?.currentRender
					// У истории с play ждём именно конец play: `finished` перерисовок во время play не считается
					if (!render || (render.story?.playFunction && !window.__storyPlayEnded)) return false
					return finalPhases.includes(render.phase) && performance.now() - window.__storyPhaseAt >= quietMs && render.phase
				},
				{ finalPhases: FINAL_PHASES, quietMs: QUIET_MS },
				{ timeout: RENDER_TIMEOUT, polling: 50 },
			)
			.then(handle => handle.jsonValue())
			.catch(() => 'timeout')
		if (phase === 'timeout') result.errors.push(`Рендер или play не завершились за ${RENDER_TIMEOUT / 1000} с`)
		if (phase === 'errored' || phase === 'aborted') result.errors.push(`Фаза рендера: ${phase}`)
		const events = await page.evaluate(() => window.__storyEvents ?? [])
		for (const event of events) result.errors.push(`${event.name}: ${event.details}`)
		const narrowException = width < NARROW_WIDTH && NARROW_PLAY_EXCEPTIONS.find(entry => entry.id.test(story.id))
		if (narrowException && events.some(event => event.name === 'playFunctionThrewException')) {
			result.errors = result.errors.filter(
				error => !error.startsWith('console.error:') && !error.startsWith('playFunctionThrewException'),
			)
			result.playSkipped = narrowException.reason
		}

		if (phase !== 'timeout' && !isOverflowAllowed(story.id, width)) {
			const message = overflowError(await page.evaluate(measureOverflow), width)
			if (message) result.errors.push(message)
		}

		const rules = await page.evaluate(readA11yConfig, PAGE_LEVEL_RULES)
		if (rules) {
			await page.addScriptTag({ content: AXE_SOURCE })
			result.violations = await page.evaluate(runAxe, rules)
		}
	} catch (error) {
		result.errors.push(`Сбой проверки: ${String(error.message).slice(0, 300)}`)
	} finally {
		page.off('pageerror', onPageError)
		page.off('console', onConsole)
		page.off('response', onResponse)
	}
	return result
}

/** Контекст и вкладка одного воркера; внешние запросы блокируются и копятся в `external`, падение вкладки — в `isCrashed` */
async function openSession(browser, origin, width) {
	const context = await browser.newContext({ viewport: { width, height: VIEWPORT_HEIGHT }, reducedMotion: 'reduce' })
	await context.addInitScript(CHANNEL_LISTENER)
	const page = await context.newPage()
	const session = { context, page, external: new Set(), isCrashed: false }
	page.on('crash', () => {
		session.isCrashed = true
	})
	// Stories не должны ходить в сеть: внешние запросы блокируются и считаются ошибкой
	await page.route('**/*', route => {
		const url = route.request().url()
		if (url.startsWith(origin) || url.startsWith('data:') || url.startsWith('blob:')) return route.continue()
		session.external.add(url)
		return route.abort()
	})
	return session
}

async function runJob(session, options, job) {
	session.external.clear()
	await session.page.setViewportSize({ width: job.width, height: VIEWPORT_HEIGHT })
	const result = await checkStory(session.page, options, job.story, job.theme, job.width)
	for (const url of session.external) result.errors.push(`Внешний запрос: ${url.slice(0, 200)}`)
	return result
}

async function main() {
	const options = parseArgs(process.argv.slice(2))
	const index = await fetch(`${options.url}/index.json`)
		.then(response => response.json())
		.catch(error => {
			console.error(
				`❌ Storybook недоступен по адресу ${options.url}: ${error.message}. Соберите и запустите его (см. шапку скрипта).`,
			)
			process.exit(2)
		})
	const isTested = entry => !entry.tags || (entry.tags.includes('test') && !entry.tags.includes('!test'))
	const stories = Object.values(index.entries).filter(
		entry => entry.type === 'story' && isTested(entry) && (!options.filter || options.filter.test(entry.id)),
	)
	const jobs = stories.flatMap(story => options.themes.flatMap(theme => options.widths.map(width => ({ story, theme, width }))))
	const total = jobs.length
	const dirNote = options.dir ? `, направление ${options.dir}` : ''
	console.log(
		`=== Прогон stories: ${stories.length} × темы ${options.themes.join(', ')} × ширины ${options.widths.join(', ')} px${dirNote} = ${total} ===`,
	)

	const origin = new URL(options.url).origin
	const browser = await chromium.launch()
	const results = []
	const startedAt = Date.now()

	async function worker() {
		let session = await openSession(browser, origin, options.widths[0])
		const attempt = async job => {
			if (session.isCrashed || session.page.isClosed()) {
				await session.context.close().catch(() => undefined)
				session = await openSession(browser, origin, job.width)
			}
			return runJob(session, options, job).catch(error => ({
				id: job.story.id,
				theme: job.theme,
				width: job.width,
				errors: [`Сбой браузера: ${String(error.message).slice(0, 300)}`],
				violations: [],
			}))
		}
		while (jobs.length) {
			const job = jobs.shift()
			let result = await attempt(job)
			// Вкладка может упасть от нехватки памяти на тяжёлой истории: один повтор на новой вкладке
			if (session.isCrashed) result = await attempt(job)
			results.push(result)
			if (result.errors.length || result.violations.length) {
				console.log(
					`  ❌ ${result.id} (${result.theme}, ${result.width} px): ${result.errors[0] ?? `axe ${result.violations[0].id}`}`.slice(
						0,
						300,
					),
				)
			}
			if (results.length % 100 === 0) console.log(`  ${results.length} / ${total}`)
		}
		await session.context.close().catch(() => undefined)
	}

	await Promise.all(Array.from({ length: options.concurrency }, worker))
	await browser.close()

	const failed = results.filter(result => result.errors.length || result.violations.length)
	if (options.report) {
		mkdirSync(dirname(options.report), { recursive: true })
		writeFileSync(options.report, JSON.stringify(results, null, 1))
	}
	const seconds = Math.round((Date.now() - startedAt) / 1000)
	console.log(
		`\nПроверено: ${results.length} за ${seconds} с. С ошибками: ${results.filter(result => result.errors.length).length}. С нарушениями axe: ${results.filter(result => result.violations.length).length}. С переполнением по ширине: ${results.filter(result => result.errors.some(isOverflowMessage)).length}. Play пропущен на узкой ширине: ${results.filter(result => result.playSkipped).length}.`,
	)
	for (const result of failed.slice(0, 50)) {
		console.log(`\n❌ ${result.id} (${result.theme}, ${result.width} px)`)
		for (const error of result.errors.slice(0, 3)) console.log(`   ${error}`)
		for (const violation of result.violations.slice(0, 3))
			console.log(`   axe ${violation.id} (${violation.impact}, узлов: ${violation.nodes}): ${violation.target}`)
	}
	if (failed.length > 50) console.log(`\n…и ещё ${failed.length - 50}. Полный список — в отчёте (--report).`)
	if (failed.length) process.exit(1)
	console.log('\n✅ Все stories отрисовались, play-функции прошли, нарушений доступности нет.')
}

main()
