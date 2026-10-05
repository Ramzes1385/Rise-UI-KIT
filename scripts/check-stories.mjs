/**
 * Story падает при ошибке рендера/play, необработанном исключении, console.error, внешних запросах или нарушениях axe;
 * `__story-missing` — намеренное исключение. Stories с тегом `!test` пропускаются: в index.json Storybook снимает тег
 * `test`, поэтому проверяется его отсутствие. Тег должен стоять в `X.stories.ts` (`export const X = { ...cases.X, tags: ['!test'] }`):
 * индексатор читает файл статически и тегов у `cases.X` не видит.
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
const DONE_PHASES = ['played', 'completed', 'finished', 'errored', 'aborted']
const FAILED_EVENTS = ['playFunctionThrewException', 'storyThrewException', 'storyErrored', 'unhandledErrorsWhilePlaying']
const RENDER_TIMEOUT = 30_000
/** Адреса, которые stories запрашивают заведомо без ответа, чтобы показать ошибку загрузки */
const EXPECTED_MISSING_RE = /__story-missing/

function parseArgs(argv) {
	const options = { url: 'http://localhost:6006', themes: 'light,dark', filter: '', concurrency: '4', report: '' }
	for (const arg of argv) {
		const match = /^--([a-z]+)=(.*)$/.exec(arg)
		if (!match || !(match[1] in options)) {
			console.error(`❌ Неизвестный параметр: ${arg}`)
			process.exit(2)
		}
		options[match[1]] = match[2]
	}
	return {
		url: options.url.replace(/\/$/, ''),
		themes: options.themes.split(',').filter(Boolean),
		filter: options.filter ? new RegExp(options.filter) : null,
		concurrency: Math.max(1, Number(options.concurrency) || 1),
		report: options.report,
	}
}

/** Слушатель событий Storybook в iframe: ошибки play-функции приходят через канал аддонов. */
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

async function checkStory(page, options, story, theme) {
	const result = { id: story.id, theme, errors: [], violations: [] }
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
		await page.goto(`${options.url}/iframe.html?id=${story.id}&viewMode=story&globals=theme:${theme}`, {
			waitUntil: 'load',
			timeout: 60_000,
		})
		const phase = await page
			.waitForFunction(
				phases =>
					phases.includes(window.__STORYBOOK_PREVIEW__?.currentRender?.phase) && window.__STORYBOOK_PREVIEW__.currentRender.phase,
				DONE_PHASES,
				{
					timeout: RENDER_TIMEOUT,
					polling: 50,
				},
			)
			.then(handle => handle.jsonValue())
			.catch(() => 'timeout')
		if (phase === 'timeout') result.errors.push(`Рендер или play не завершились за ${RENDER_TIMEOUT / 1000} с`)
		if (phase === 'errored' || phase === 'aborted') result.errors.push(`Фаза рендера: ${phase}`)
		const events = await page.evaluate(() => window.__storyEvents ?? [])
		for (const event of events) result.errors.push(`${event.name}: ${event.details}`)

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
	const jobs = stories.flatMap(story => options.themes.map(theme => ({ story, theme })))
	console.log(`=== Прогон stories: ${stories.length} × темы ${options.themes.join(', ')} = ${jobs.length} ===`)

	const origin = new URL(options.url).origin
	const browser = await chromium.launch()
	const results = []
	const startedAt = Date.now()

	async function worker() {
		const context = await browser.newContext({ viewport: { width: 1100, height: 800 }, reducedMotion: 'reduce' })
		await context.addInitScript(CHANNEL_LISTENER)
		const page = await context.newPage()
		const external = new Set()
		// Stories не должны ходить в сеть: внешние запросы блокируются и считаются ошибкой
		await page.route('**/*', route => {
			const url = route.request().url()
			if (url.startsWith(origin) || url.startsWith('data:') || url.startsWith('blob:')) return route.continue()
			external.add(url)
			return route.abort()
		})
		while (jobs.length) {
			const { story, theme } = jobs.shift()
			external.clear()
			const result = await checkStory(page, options, story, theme)
			for (const url of external) result.errors.push(`Внешний запрос: ${url.slice(0, 200)}`)
			results.push(result)
			if (results.length % 100 === 0) console.log(`  ${results.length} / ${stories.length * options.themes.length}`)
		}
		await context.close()
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
		`\nПроверено: ${results.length} за ${seconds} с. С ошибками: ${results.filter(result => result.errors.length).length}. С нарушениями axe: ${results.filter(result => result.violations.length).length}.`,
	)
	for (const result of failed.slice(0, 50)) {
		console.log(`\n❌ ${result.id} (${result.theme})`)
		for (const error of result.errors.slice(0, 3)) console.log(`   ${error}`)
		for (const violation of result.violations.slice(0, 3))
			console.log(`   axe ${violation.id} (${violation.impact}, узлов: ${violation.nodes}): ${violation.target}`)
	}
	if (failed.length > 50) console.log(`\n…и ещё ${failed.length - 50}. Полный список — в отчёте (--report).`)
	if (failed.length) process.exit(1)
	console.log('\n✅ Все stories отрисовались, play-функции прошли, нарушений доступности нет.')
}

main()
