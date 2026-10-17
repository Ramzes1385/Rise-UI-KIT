import { describe, expect, it } from 'vitest'
import { escapeHtml, sanitizeHtml } from '@utils/dom/htmlUtils'
import { runTarget } from './fuzzRunner'
import { createRng, seedFor } from './rng'
import { generateHtml, generateMarkdown, generateText, generateUrl } from './xssGenerators'
import { componentViolations, isDataImageUrl, reparsedHtml, sanitizedHtmlViolations, schemeOf } from './xssInvariants'
import type { FuzzConfig } from './fuzzRunner'

const config: FuzzConfig = { seed: 1, iterations: 300, only: null, targetFilter: null }

function toBody(html: string): HTMLElement {
	const holder = document.createElement('div')
	holder.innerHTML = html
	return holder
}

describe('фаззинг XSS: проверка самих проверок', () => {
	it('генератор детерминирован: то же зерно — тот же вход, другой номер — другой', () => {
		const first = Array.from({ length: 20 }, (_, index) => generateHtml(createRng(seedFor(7, 'x', index))))
		const again = Array.from({ length: 20 }, (_, index) => generateHtml(createRng(seedFor(7, 'x', index))))
		expect(again).toEqual(first)
		expect(new Set(first).size).toBeGreaterThan(15)
		expect(seedFor(7, 'x', 1)).not.toBe(seedFor(7, 'y', 1))
		expect(seedFor(7, 'x', 1)).not.toBe(seedFor(8, 'x', 1))
	})

	it('инварианты узнают опасную разметку', () => {
		const dangerous = [
			'<script>alert(1)</script>',
			'<img src=x onerror=alert(1)>',
			'<a href="javascript:alert(1)">x</a>',
			'<a href="&#x6A;avascript:alert(1)">x</a>',
			'<iframe src="https://a.ru"></iframe>',
			'<img src="data:text/html,<script>alert(1)</script>">',
			'<p style="background:url(javascript:alert(1))">x</p>',
			'<svg><use href="x"></use></svg>',
			'<form action="javascript:alert(1)"></form>',
			'<a href="https://a.ru" target="_blank">x</a>',
		]
		for (const html of dangerous) {
			expect(sanitizedHtmlViolations(html), html).not.toEqual([])
			expect(sanitizeHtml(html).length, html).toBeLessThan(html.length + 40)
			expect(sanitizedHtmlViolations(sanitizeHtml(html)), html).toEqual([])
		}
		for (const html of [
			'<script></script>',
			'<img src="x" onerror="a">',
			'<object data="x"></object>',
			'<math></math>',
			'<a href="vbscript:x">x</a>',
		]) {
			expect(componentViolations(toBody(html)), html).not.toEqual([])
		}
	})

	it('инварианты пропускают безопасную разметку', () => {
		const safe = [
			'<p>Текст <b>жирный</b> и <a href="https://a.ru" target="_blank" rel="noopener noreferrer">ссылка</a></p>',
			'<img src="data:image/png;base64,AAAA" alt="x">',
			'<ul><li>раз</li><li>два</li></ul>',
			'<p style="color: #fff">x</p>',
		]
		for (const html of safe) expect(sanitizedHtmlViolations(html), html).toEqual([])
		expect(reparsedHtml('<p>a</p>')).toBe('<p>a</p>')
	})

	it('адреса читаются как в браузере: схема после кодирования и управляющих символов', () => {
		expect(schemeOf('  JaVa\tScRiPt:alert(1)')).toBe('javascript:')
		expect(schemeOf('\u0001javascript:alert(1)')).toBe('javascript:')
		expect(schemeOf('/относительный/путь')).toBe('https:')
		expect(schemeOf('https://[')).toBeNull()
		expect(isDataImageUrl('\u001fda\tta:image/png;base64,AA')).toBe(true)
		expect(isDataImageUrl('data:text/html,x')).toBe(false)
	})

	it('генераторы выдают опасное: без очистки нарушения находятся в большинстве входов', () => {
		const inputs = Array.from({ length: 200 }, (_, index) => generateHtml(createRng(seedFor(3, 'oracle', index))))
		const flagged = inputs.filter(html => sanitizedHtmlViolations(html).length > 0).length
		expect(flagged).toBeGreaterThan(140)
		const texts = Array.from({ length: 200 }, (_, index) => generateText(createRng(seedFor(3, 'text', index))))
		expect(texts.filter(text => sanitizedHtmlViolations(text).length > 0).length).toBeGreaterThan(40)
		const urls = Array.from({ length: 200 }, (_, index) => generateUrl(createRng(seedFor(3, 'url', index))))
		expect(
			urls.filter(url => schemeOf(url) !== null && !['http:', 'https:', 'mailto:', 'tel:'].includes(schemeOf(url) as string)).length,
		).toBeGreaterThan(60)
		const markdown = Array.from({ length: 200 }, (_, index) => generateMarkdown(createRng(seedFor(3, 'md', index))))
		expect(
			markdown.filter(source => /\]\((?:javascript|data|vbscript):/i.test(source.replace(/[\u0000- ]/g, ''))).length,
		).toBeGreaterThan(20)
	})

	it('прогон ловит дырявую очистку и сокращает вход до короткого', async () => {
		const result = await runTarget(config, {
			name: 'дырявая очистка',
			generate: generateHtml,
			check: html => sanitizedHtmlViolations(html),
		})
		expect(result.findings.length).toBeGreaterThan(0)
		expect(result.violationCount).toBeGreaterThan(100)
		for (const finding of result.findings) expect(finding.input.length).toBeLessThan(60)
	})

	it('прогон воспроизводит одну итерацию по зерну, цели и номеру', async () => {
		const target = { name: 'повтор', generate: generateHtml, check: (html: string) => sanitizedHtmlViolations(html) }
		const full = await runTarget(config, target)
		const index = full.findings[0].index
		const single = await runTarget({ ...config, only: { target: 'повтор', index } }, target)
		expect(single.iterations).toBe(1)
		expect(single.violationCount).toBe(1)
		expect(generateHtml(createRng(seedFor(config.seed, 'повтор', index)))).toBe(
			generateHtml(createRng(seedFor(config.seed, 'повтор', index))),
		)
	})

	it('исключение в очистке — нарушение, а ошибка среды jsdom — пропуск', async () => {
		const thrown = await runTarget(config, {
			name: 'исключение',
			generate: generateText,
			check: () => {
				throw new TypeError('boom')
			},
		})
		expect(thrown.violationCount).toBe(300)
		expect(thrown.findings[0].violations[0]).toContain('TypeError: boom')
		const environment = await runTarget(config, {
			name: 'среда',
			generate: generateText,
			check: () => {
				document.createElement('div').innerHTML = `<p>\ude00\ude00</p>`
			},
		})
		expect(environment.skipped).toBe(300)
		expect(environment.violationCount).toBe(0)
	})

	it('экранирование и очистка не теряют безобидный текст', () => {
		expect(escapeHtml('a < b & "c"')).toBe('a &lt; b &amp; &quot;c&quot;')
		expect(sanitizeHtml('<p>привет</p>')).toBe('<p>привет</p>')
	})
})
