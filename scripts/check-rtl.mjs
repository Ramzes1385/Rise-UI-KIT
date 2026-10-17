/**
 * Аудит письма справа налево (RTL) всех stories: каждая история открывается в `dir=ltr` и `dir=rtl` (глобал Storybook `dir`),
 * на ширинах 1280 и 375 (меняется размер окна без перезагрузки). Что проверяется:
 * - ошибки play, консоли, исключения и нарушения axe, которых нет в LTR («RTL-only»);
 * - переполнение страницы и элементы, вылезающие за левый или правый край окна («bleed»), которых нет в LTR;
 * - зеркалирование: положение каждого элемента и его текста относительно родителя в RTL должно быть зеркальным LTR
 *   (отступ от начального края в LTR = отступ от начального края в RTL, допуск 2 px). Расхождение — физическое свойство
 *   (`left`, `margin-left`, `text-align: left`, `float`), `translateX` без учёта направления, поповер у не того края и т. п.
 *   Строчные теги без класса в тексте (`strong`, `em`, `a`, `code`, `span` …) не сравниваются: рамка строчного элемента на нескольких строках не зеркальна.
 *   Дерево с `dir="ltr"` внутри RTL (код, телефоны, шкалы графиков) и дерево с собственным `dir="rtl"` в самой истории не сравниваются;
 * - `text-align: left|right` и `float: left|right` в вычисленных стилях RTL.
 *
 * `--filter=<regex id>`, `--concurrency=<n>` (по умолчанию 2), `--theme=<light|dark>` (по умолчанию light), `--widths=1280,375`,
 * `--report=<файл.json>` — результат, `--snapshots=<папка>` — писать в неё снимки раскладки (json.gz на историю и направление),
 * `--ltr-from=<папка>` — не открывать LTR заново, а взять снимок LTR из папки (его пишет прогон с `--snapshots`),
 * `--rtl-from=<папка>` — то же для RTL (досчёт упавшего прогона: историй без снимка открываются заново),
 * `--url=<адрес Storybook>` (по умолчанию http://localhost:6006).
 * Пример: `node scripts/check-rtl.mjs --filter='^element-' --report=/tmp/rtl.json`.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { gunzipSync, gzipSync } from 'node:zlib'
import { chromium } from '@playwright/test'

const require = createRequire(import.meta.url)
const AXE_PATH = createRequire(require.resolve('@storybook/addon-a11y/package.json')).resolve('axe-core/axe.min.js')
const AXE_SOURCE = readFileSync(AXE_PATH, 'utf-8')

const PAGE_LEVEL_RULES = ['html-has-lang', 'landmark-one-main', 'page-has-heading-one', 'region', 'bypass']
const DONE_PHASES = ['played', 'completed', 'finished', 'errored', 'aborted']
const FAILED_EVENTS = ['playFunctionThrewException', 'storyThrewException', 'storyErrored', 'unhandledErrorsWhilePlaying']
const RENDER_TIMEOUT = 30_000
const STORY_TIMEOUT = 150_000
const SETTLE_MS = 250
const EXPECTED_MISSING_RE = /__story-missing/
const TOLERANCE_PX = 2
const MAX_MIRROR_PER_STORY = 40
const INLINE_TEXT_TAGS = new Set([
	'a',
	'abbr',
	'b',
	'cite',
	'code',
	'del',
	'em',
	'i',
	'ins',
	'kbd',
	'mark',
	'q',
	's',
	'small',
	'span',
	'strong',
	'sub',
	'sup',
	'u',
])

function parseArgs(argv) {
	const options = {
		url: 'http://localhost:6006',
		filter: '',
		concurrency: '2',
		theme: 'light',
		widths: '1280,375',
		report: '',
		snapshots: '',
		'ltr-from': '',
		'rtl-from': '',
	}
	for (const arg of argv) {
		const match = /^--([a-z-]+)=(.*)$/.exec(arg)
		if (!match || !(match[1] in options)) {
			console.error(`❌ Неизвестный параметр: ${arg}`)
			process.exit(2)
		}
		options[match[1]] = match[2]
	}
	return {
		url: options.url.replace(/\/$/, ''),
		filter: options.filter ? new RegExp(options.filter) : null,
		concurrency: Math.max(1, Number(options.concurrency) || 1),
		theme: options.theme,
		widths: options.widths.split(',').map(Number).filter(Boolean),
		report: options.report,
		snapshots: options.snapshots,
		ltrFrom: options['ltr-from'],
		rtlFrom: options['rtl-from'],
	}
}

const CHANNEL_LISTENER = `
	window.__storyEvents = [];
	(function attach() {
		const channel = window.__STORYBOOK_ADDONS_CHANNEL__;
		if (!channel) return setTimeout(attach, 5);
		for (const name of ${JSON.stringify(FAILED_EVENTS)}) {
			channel.on(name, (...args) => {
				let details;
				try { details = JSON.stringify(args).slice(0, 600); } catch (error) { details = String(error); }
				window.__storyEvents.push({ name, details });
			});
		}
	})();
`

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
		nodes: violation.nodes.length,
		target: violation.nodes[0]?.target?.join(' '),
	}))
}

/**
 * Снимок раскладки в браузере: плоский список элементов с горизонтальными координатами и вычисленными свойствами,
 * затем переполнение страницы. Элемент — [путь, тег, класс, x, ширина, text-align, float, direction, x текста, ширина текста].
 */
function takeSnapshot() {
	const SKIP = new Set(['SCRIPT', 'STYLE', 'LINK', 'META', 'TEMPLATE', 'NOSCRIPT', 'TITLE', 'HEAD'])
	const vw = document.documentElement.clientWidth
	const round = value => Math.round(value * 10) / 10
	const elements = []
	let bleedLeft = 0
	let bleedRight = 0
	let bleedLeftClass = ''
	let bleedRightClass = ''

	function textBox(element) {
		let left = Infinity
		let right = -Infinity
		for (const node of element.childNodes) {
			if (node.nodeType !== Node.TEXT_NODE || !node.textContent.trim()) continue
			const range = document.createRange()
			range.selectNodeContents(node)
			for (const rect of range.getClientRects()) {
				if (!rect.width) continue
				left = Math.min(left, rect.left)
				right = Math.max(right, rect.right)
			}
		}
		return right > left ? [round(left), round(right - left)] : [0, 0]
	}

	function className(element) {
		const value = typeof element.className === 'string' ? element.className : (element.getAttribute('class') ?? '')
		return value.split(/\s+/).filter(Boolean).slice(0, 2).join('.')
	}

	function walk(element, parentPath, index, clip) {
		if (SKIP.has(element.tagName)) return
		const style = getComputedStyle(element)
		if (style.display === 'none') return
		const path = `${parentPath}/${element.tagName.toLowerCase()}${index}`
		let childClip = clip
		if (style.display === 'contents') {
			Array.from(element.children).forEach((child, childIndex) => walk(child, path, childIndex, clip))
			return
		}
		const rect = element.getBoundingClientRect()
		const isFixed = style.position === 'fixed'
		const base = isFixed ? [0, vw] : clip
		const visible = [Math.max(rect.left, base[0]), Math.min(rect.right, base[1])]
		const isVisible = style.visibility !== 'hidden' && (rect.width > 0 || rect.height > 0)
		if (isVisible) {
			const isInline = element.tagName === 'SVG' || element instanceof SVGElement
			if (!isInline || element.tagName.toLowerCase() === 'svg') {
				const own = textBox(element)
				elements.push([
					path,
					element.tagName.toLowerCase(),
					className(element),
					round(rect.left),
					round(rect.width),
					style.textAlign,
					style.cssFloat,
					style.direction,
					own[0],
					own[1],
				])
			}
			if (visible[1] > visible[0] && style.opacity !== '0') {
				if (-visible[0] > bleedLeft) {
					bleedLeft = -visible[0]
					bleedLeftClass = className(element) || element.tagName.toLowerCase()
				}
				if (visible[1] - vw > bleedRight) {
					bleedRight = visible[1] - vw
					bleedRightClass = className(element) || element.tagName.toLowerCase()
				}
			}
		}
		if (element instanceof SVGElement && element.tagName.toLowerCase() === 'svg') return
		if (style.overflowX !== 'visible' && rect.width > 0) childClip = [Math.max(base[0], rect.left), Math.min(base[1], rect.right)]
		else if (isFixed) childClip = base
		Array.from(element.children).forEach((child, childIndex) => walk(child, path, childIndex, childClip))
	}

	const roots = Array.from(document.body.children).filter(
		element => !element.id?.startsWith('storybook-docs') && !element.className?.toString().includes('sb-'),
	)
	roots.forEach((element, index) => walk(element, '', index, [-Infinity, Infinity]))
	const scrollOverflow = document.documentElement.scrollWidth - vw
	return {
		vw,
		dir: document.documentElement.dir,
		scrollOverflow,
		bleedLeft: round(bleedLeft),
		bleedRight: round(bleedRight),
		bleedLeftClass,
		bleedRightClass,
		elements,
	}
}

async function openStory(page, options, story, dir, width) {
	const result = { errors: [], violations: [], snapshots: {} }
	const onPageError = error => result.errors.push(`Исключение: ${String(error.message).slice(0, 200)}`)
	const onConsole = message => {
		if (message.type() !== 'error' || message.text().startsWith('Failed to load resource')) return
		result.errors.push(`console.error: ${message.text().slice(0, 200)}`)
	}
	const onResponse = response => {
		if (response.status() >= 400 && !EXPECTED_MISSING_RE.test(response.url())) result.errors.push(`HTTP ${response.status()}`)
	}
	page.on('pageerror', onPageError)
	page.on('console', onConsole)
	page.on('response', onResponse)
	try {
		await page.setViewportSize({ width, height: 900 })
		const globals = `theme:${options.theme};dir:${dir}`
		await page.goto(`${options.url}/iframe.html?id=${story.id}&viewMode=story&globals=${globals}`, {
			waitUntil: 'load',
			timeout: 60_000,
		})
		const phase = await page
			.waitForFunction(
				phases =>
					phases.includes(window.__STORYBOOK_PREVIEW__?.currentRender?.phase) && window.__STORYBOOK_PREVIEW__.currentRender.phase,
				DONE_PHASES,
				{ timeout: RENDER_TIMEOUT, polling: 50 },
			)
			.then(handle => handle.jsonValue())
			.catch(() => 'timeout')
		if (phase === 'timeout') result.errors.push('Рендер или play не завершились за 30 с')
		if (phase === 'errored' || phase === 'aborted') result.errors.push(`Фаза рендера: ${phase}`)
		for (const event of await page.evaluate(() => window.__storyEvents ?? []))
			result.errors.push(`${event.name}: ${event.details.slice(0, 200)}`)
		await page.waitForTimeout(SETTLE_MS)
		const rules = await page.evaluate(readA11yConfig, PAGE_LEVEL_RULES)
		if (rules) {
			await page.addScriptTag({ content: AXE_SOURCE })
			result.violations = await page.evaluate(runAxe, rules)
		}
		for (const [index, size] of options.widths.entries()) {
			if (index > 0) {
				await page.setViewportSize({ width: size, height: 900 })
				await page.waitForTimeout(SETTLE_MS)
			}
			result.snapshots[size] = await page.evaluate(takeSnapshot)
		}
	} catch (error) {
		result.errors.push(`Сбой проверки: ${String(error.message).slice(0, 200)}`)
	} finally {
		page.off('pageerror', onPageError)
		page.off('console', onConsole)
		page.off('response', onResponse)
	}
	return result
}

function snapshotFile(folder, dir, id) {
	return join(folder, dir, `${id}.json.gz`)
}

function saveSnapshot(folder, dir, id, data) {
	const file = snapshotFile(folder, dir, id)
	mkdirSync(dirname(file), { recursive: true })
	writeFileSync(file, gzipSync(JSON.stringify(data)))
}

function loadSnapshot(folder, dir, id) {
	const file = snapshotFile(folder, dir, id)
	return existsSync(file) ? JSON.parse(gunzipSync(readFileSync(file)).toString()) : null
}

const E = { path: 0, tag: 1, cls: 2, x: 3, w: 4, align: 5, float: 6, dir: 7, tx: 8, tw: 9 }

function parentOf(path) {
	return path.slice(0, path.lastIndexOf('/'))
}

/** Зеркальность: отступ от начального края родителя в LTR должен равняться отступу от начального края в RTL */
function compareMirror(ltr, rtl) {
	const byPathLtr = new Map(ltr.elements.map(element => [element[E.path], element]))
	const byPathRtl = new Map(rtl.elements.map(element => [element[E.path], element]))
	const viewport = (snapshot, element) => ({ x: 0, w: snapshot.vw, dir: 'rtl', path: '', cls: 'viewport', tag: 'viewport', element })
	const findParent = (map, snapshot, path) => {
		for (let current = parentOf(path); current; current = parentOf(current)) {
			const found = map.get(current)
			if (found) return { x: found[E.x], w: found[E.w], dir: found[E.dir], cls: found[E.cls], tag: found[E.tag] }
		}
		return viewport(snapshot)
	}
	const issues = []
	let compared = 0
	for (const [path, right] of byPathRtl) {
		const left = byPathLtr.get(path)
		if (!left || left[E.tag] !== right[E.tag] || left[E.dir] === 'rtl') continue
		if (INLINE_TEXT_TAGS.has(right[E.tag]) && !right[E.cls]) continue
		const parentLtr = findParent(byPathLtr, ltr, path)
		const parentRtl = findParent(byPathRtl, rtl, path)
		if (parentRtl.dir !== 'rtl' || parentLtr.dir === 'rtl') continue
		compared++
		const offsetLtr = left[E.x] - parentLtr.x
		const offsetRtl = parentRtl.x + parentRtl.w - (right[E.x] + right[E.w])
		const delta = Math.round((offsetRtl - offsetLtr) * 10) / 10
		if (Math.abs(delta) > TOLERANCE_PX && Math.abs(left[E.w] - right[E.w]) <= TOLERANCE_PX * 4) {
			issues.push({ kind: 'offset', tag: right[E.tag], cls: right[E.cls], parent: parentRtl.cls || parentRtl.tag, delta })
		}
		if (right[E.dir] === 'rtl' && left[E.tw] && right[E.tw]) {
			const textLtr = left[E.tx] - left[E.x]
			const textRtl = right[E.x] + right[E.w] - (right[E.tx] + right[E.tw])
			const textDelta = Math.round((textRtl - textLtr) * 10) / 10
			if (Math.abs(textDelta) > TOLERANCE_PX && Math.abs(left[E.tw] - right[E.tw]) <= TOLERANCE_PX * 4) {
				issues.push({
					kind: 'text',
					tag: right[E.tag],
					cls: right[E.cls],
					parent: parentRtl.cls || parentRtl.tag,
					delta: textDelta,
				})
			}
		}
		if (right[E.dir] === 'rtl' && (right[E.align] === 'left' || right[E.align] === 'right') && right[E.tw]) {
			issues.push({ kind: 'text-align', tag: right[E.tag], cls: right[E.cls], parent: parentRtl.cls || parentRtl.tag, delta: 0 })
		}
		if (right[E.float] === 'left' || right[E.float] === 'right') {
			issues.push({ kind: 'float', tag: right[E.tag], cls: right[E.cls], parent: parentRtl.cls || parentRtl.tag, delta: 0 })
		}
	}
	return { compared, issues }
}

function bleedOf(snapshot) {
	return {
		page: snapshot.scrollOverflow,
		left: snapshot.bleedLeft,
		right: snapshot.bleedRight,
		leftClass: snapshot.bleedLeftClass,
		rightClass: snapshot.bleedRightClass,
	}
}

/** Ошибка без адреса сборки и номеров строк: LTR из снимков и RTL текущего прогона идут с разных серверов и сборок */
function normalizeError(error) {
	return error.replace(/https?:\/\/localhost:\d+\/assets\/[^\s)"]+/g, '<url>')
}

function analyze(story, ltr, rtl, widths) {
	const entry = { id: story.id, errors: [], violations: [], overflow: [], mirror: [], mirrorCount: 0, compared: 0 }
	const ltrErrors = new Set(ltr.errors.map(normalizeError))
	entry.errors = rtl.errors.filter(error => !ltrErrors.has(normalizeError(error)))
	const ltrAxe = new Set(ltr.violations.map(violation => `${violation.id}|${violation.target}`))
	entry.violations = rtl.violations.filter(violation => !ltrAxe.has(`${violation.id}|${violation.target}`))
	for (const width of widths) {
		const left = ltr.snapshots[width]
		const right = rtl.snapshots[width]
		if (!left || !right) continue
		const ltrBleed = bleedOf(left)
		const rtlBleed = bleedOf(right)
		const isPageNew = rtlBleed.page > TOLERANCE_PX && rtlBleed.page > ltrBleed.page + TOLERANCE_PX
		const isLeftNew = rtlBleed.left > TOLERANCE_PX && rtlBleed.left > Math.max(ltrBleed.left, ltrBleed.right) + TOLERANCE_PX
		const isRightNew = rtlBleed.right > TOLERANCE_PX && rtlBleed.right > Math.max(ltrBleed.left, ltrBleed.right) + TOLERANCE_PX
		if (isPageNew || isLeftNew || isRightNew) entry.overflow.push({ width, ltr: ltrBleed, rtl: rtlBleed })
		const { compared, issues } = compareMirror(left, right)
		entry.compared += compared
		for (const issue of issues) entry.mirror.push({ width, ...issue })
	}
	entry.mirrorCount = entry.mirror.length
	entry.mirror = entry.mirror.slice(0, MAX_MIRROR_PER_STORY)
	return entry
}

function summarize(results, widths) {
	const withMirror = results.filter(entry => entry.mirrorCount)
	const kinds = {}
	const classes = new Map()
	for (const entry of results) {
		for (const issue of entry.mirror) {
			kinds[issue.kind] = (kinds[issue.kind] ?? 0) + 1
			const key = `${issue.kind} ${issue.tag}.${issue.cls || '-'}`
			const item = classes.get(key) ?? { stories: new Set(), count: 0 }
			item.stories.add(entry.id)
			item.count++
			classes.set(key, item)
		}
	}
	const top = [...classes.entries()].sort((a, b) => b[1].stories.size - a[1].stories.size).slice(0, 40)
	console.log(`\nИсторий: ${results.length}, ширины: ${widths.join(', ')}`)
	console.log(`RTL-only ошибки (play, консоль): ${results.filter(entry => entry.errors.length).length}`)
	console.log(`RTL-only нарушения axe: ${results.filter(entry => entry.violations.length).length}`)
	console.log(`Переполнение страницы или выход за край только в RTL: ${results.filter(entry => entry.overflow.length).length}`)
	console.log(`Истории с расхождением зеркала: ${withMirror.length} (по видам: ${JSON.stringify(kinds)})`)
	console.log('\nНаиболее частые расхождения (вид тег.класс — историй):')
	for (const [key, item] of top) console.log(`  ${key} — ${item.stories.size}`)
}

async function main() {
	const options = parseArgs(process.argv.slice(2))
	const index = await fetch(`${options.url}/index.json`)
		.then(response => response.json())
		.catch(error => {
			console.error(`❌ Storybook недоступен по адресу ${options.url}: ${error.message}`)
			process.exit(2)
		})
	const isTested = entry => !entry.tags || (entry.tags.includes('test') && !entry.tags.includes('!test'))
	const stories = Object.values(index.entries).filter(
		entry => entry.type === 'story' && isTested(entry) && (!options.filter || options.filter.test(entry.id)),
	)
	const queue = [...stories]
	console.log(`=== Аудит RTL: ${stories.length} историй, тема ${options.theme}, ширины ${options.widths.join(', ')} ===`)

	const origin = new URL(options.url).origin
	const browser = await chromium.launch()
	const results = []
	const startedAt = Date.now()

	async function createPage(context) {
		const page = await context.newPage()
		await page.route('**/*', route => {
			const url = route.request().url()
			if (url.startsWith(origin) || url.startsWith('data:') || url.startsWith('blob:')) return route.continue()
			return route.abort()
		})
		return page
	}

	async function openGuarded(state, story, dir) {
		let timer
		const hang = new Promise(resolve => {
			timer = setTimeout(() => resolve(null), STORY_TIMEOUT)
		})
		const result = await Promise.race([openStory(state.page, options, story, dir, options.widths[0]), hang])
		clearTimeout(timer)
		if (result) return result
		await state.page.close().catch(() => {})
		state.page = await createPage(state.context)
		return { errors: [`Сбой проверки: страница не ответила за ${STORY_TIMEOUT / 1000} с`], violations: [], snapshots: {} }
	}

	async function openOrLoad(state, story, dir, folder) {
		const saved = folder ? loadSnapshot(folder, dir, story.id) : null
		const snapshot = saved ?? (await openGuarded(state, story, dir))
		if (options.snapshots && !saved) saveSnapshot(options.snapshots, dir, story.id, snapshot)
		return snapshot
	}

	async function worker() {
		const context = await browser.newContext({ viewport: { width: options.widths[0], height: 900 }, reducedMotion: 'reduce' })
		await context.addInitScript(CHANNEL_LISTENER)
		const state = { context, page: await createPage(context) }
		while (queue.length) {
			const story = queue.shift()
			const ltr = await openOrLoad(state, story, 'ltr', options.ltrFrom)
			const rtl = await openOrLoad(state, story, 'rtl', options.rtlFrom)
			results.push(analyze(story, ltr, rtl, options.widths))
			if (results.length % 50 === 0)
				console.log(`  ${results.length} / ${stories.length}, ${Math.round((Date.now() - startedAt) / 1000)} с`)
		}
		await context.close()
	}

	await Promise.all(Array.from({ length: options.concurrency }, worker))
	await browser.close()
	results.sort((a, b) => a.id.localeCompare(b.id))
	if (options.report) {
		mkdirSync(dirname(options.report), { recursive: true })
		writeFileSync(options.report, JSON.stringify(results, null, 1))
	}
	summarize(results, options.widths)
	console.log(`\nВремя: ${Math.round((Date.now() - startedAt) / 1000)} с`)
	const isFailed = results.some(entry => entry.errors.length || entry.violations.length || entry.overflow.length || entry.mirrorCount)
	if (isFailed) process.exit(1)
	console.log('\n✅ В RTL нет расхождений с LTR.')
}

main()
