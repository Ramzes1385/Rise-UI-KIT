import { afterAll, describe, expect, it } from 'vitest'
import { parseMarkdown } from '@components/BaseMarkdown/model/markdownDocument'
import { resolveLinkUrl } from '@composables/editor/useEditorToolbar/commands/linkCommands'
import { cleanSvg, sanitizeSvg } from '@components/BaseImageMap/model/svg/sanitizeSvg'
import { resolveLink } from '@composables/interaction/useLink/useLink'
import { escapeHtml, sanitizeHtml } from '@utils/dom/htmlUtils'
import { isSafeUrl, normalizeLinkUrl } from '@utils/data/urlUtils'
import { serializeJsonLd } from '@utils/seo/structuredDataUtils'
import { formatFindings, readFuzzConfig, reportSummary, runTarget } from './fuzzRunner'
import type { TargetResult } from './fuzzRunner'
import { generateHtml, generateJson, generateMarkdown, generateSvg, generateText, generateUrl } from './xssGenerators'
import { isDataImageUrl, NAVIGATION_SCHEMES, reparsedHtml, sanitizedHtmlViolations, schemeOf } from './xssInvariants'
import type { MarkdownBlock, MarkdownInline } from '@components/BaseMarkdown/types/BaseMarkdown.types'

const config = readFuzzConfig(120)
const results: TargetResult[] = []

function record(result: TargetResult): TargetResult {
	results.push(result)
	return result
}

function expectNoFindings(result: TargetResult): void {
	expect(result.findings, formatFindings([result])).toEqual([])
}

/** Различия, которые вносит сам HTML-разбор и которые не меняют структуру: CR → LF, первый перевод строки после `<pre>`, пробелы в начале */
function withoutParserWhitespaceNoise(html: string): string {
	return html
		.replace(/\r\n?/g, '\n')
		.replace(/^[\t\n\f ]+/, '')
		.replace(/(<pre[^>]*>)\n/g, '$1')
}

function htmlViolations(html: string): string[] {
	const first = sanitizeHtml(html)
	const found = sanitizedHtmlViolations(first)
	if (!first.trim()) return found
	const stable = withoutParserWhitespaceNoise(first)
	if (withoutParserWhitespaceNoise(reparsedHtml(first)) !== stable)
		found.push('повторный разбор меняет результат (не неподвижная точка разбора)')
	if (withoutParserWhitespaceNoise(sanitizeHtml(first)) !== stable) found.push('повторная очистка меняет результат (не идемпотентна)')
	return found
}

function inlineViolations(nodes: readonly MarkdownInline[]): string[] {
	return nodes.flatMap(node => {
		if (node.type === 'link') {
			const scheme = schemeOf(node.href)
			const bad =
				scheme !== null && !NAVIGATION_SCHEMES.has(scheme)
					? [`ссылка со схемой ${scheme}: ${JSON.stringify(node.href.slice(0, 60))}`]
					: []
			return [...bad, ...inlineViolations(node.children)]
		}
		if (node.type === 'image') {
			const scheme = schemeOf(node.src)
			const isAllowed =
				scheme === null || ['http:', 'https:', 'blob:'].includes(scheme) || (scheme === 'data:' && isDataImageUrl(node.src))
			return isAllowed ? [] : [`картинка со схемой ${scheme}: ${JSON.stringify(node.src.slice(0, 60))}`]
		}
		return 'children' in node ? inlineViolations(node.children) : []
	})
}

function blockViolations(blocks: readonly MarkdownBlock[]): string[] {
	return blocks.flatMap(block => {
		switch (block.type) {
			case 'heading':
			case 'paragraph':
				return inlineViolations(block.children)
			case 'blockquote':
				return blockViolations(block.children)
			case 'list':
				return block.items.flatMap(item => (item.inline ? inlineViolations(item.inline) : blockViolations(item.children)))
			case 'table':
				return [...block.head, ...block.rows.flat()].flatMap(cell => inlineViolations(cell))
			default:
				return []
		}
	})
}

function urlViolations(url: string): string[] {
	const found: string[] = []
	const describeUrl = JSON.stringify(url.slice(0, 80))
	if (isSafeUrl(url)) {
		const scheme = schemeOf(url)
		if (scheme !== null && !NAVIGATION_SCHEMES.has(scheme)) found.push(`isSafeUrl пропустил схему ${scheme}: ${describeUrl}`)
	}
	const resolved = resolveLinkUrl(url)
	if (resolved !== null) {
		const scheme = schemeOf(resolved)
		if (scheme !== null && !NAVIGATION_SCHEMES.has(scheme)) found.push(`resolveLinkUrl вернул схему ${scheme}: ${describeUrl}`)
	}
	const normalized = normalizeLinkUrl(url)
	if (normalized && schemeOf(normalized) !== null && !NAVIGATION_SCHEMES.has(schemeOf(normalized) as string) && isSafeUrl(normalized)) {
		found.push(`normalizeLinkUrl + isSafeUrl: ${describeUrl}`)
	}
	const link = resolveLink({ href: url })
	const href = link.attrs.href
	if (typeof href === 'string') {
		const scheme = schemeOf(href)
		if (scheme !== null && !NAVIGATION_SCHEMES.has(scheme)) found.push(`resolveLink отдал href со схемой ${scheme}: ${describeUrl}`)
	}
	return found
}

function svgViolations(markup: string): string[] {
	const found: string[] = []
	for (const output of [cleanSvg(markup), sanitizeSvg(markup, 'p-')]) {
		if (!output) continue
		const root = new DOMParser().parseFromString(output, 'image/svg+xml').documentElement
		if (root.localName !== 'svg') {
			found.push(`результат не svg: ${output.slice(0, 60)}`)
			continue
		}
		for (const element of [root, ...root.querySelectorAll('*')]) {
			const tag = element.localName.toLowerCase()
			if (
				['script', 'style', 'foreignobject', 'iframe', 'a', 'animate', 'set', 'filter', 'feimage', 'switch', 'handler'].includes(
					tag,
				)
			)
				found.push(`элемент <${tag}>`)
			for (const attribute of [...element.attributes]) {
				const name = attribute.name.toLowerCase()
				if (name.startsWith('on')) found.push(`обработчик ${name}`)
				if (name === 'href' || name === 'xlink:href') {
					const isLocal = /^#[\w.:-]+$/.test(attribute.value)
					const isImage = tag === 'image' && /^data:image\/(png|jpe?g|gif|webp);base64,/i.test(attribute.value)
					if (!isLocal && !isImage) found.push(`${tag}[${name}]: ${JSON.stringify(attribute.value.slice(0, 60))}`)
				}
				if (/url\s*\((?!\s*['"]?#)/i.test(attribute.value) || /javascript:|expression/i.test(attribute.value))
					found.push(`${tag}[${name}]: ${JSON.stringify(attribute.value.slice(0, 60))}`)
			}
		}
	}
	return found
}

function jsonLdViolations(value: unknown): string[] {
	const json = serializeJsonLd({ '@type': 'Thing', name: value as string, nested: { items: [value] } } as never)
	const found: string[] = []
	if (/[<>&\u2028\u2029]/.test(json)) found.push('в JSON-LD остались <, >, & или U+2028/9: можно закрыть <script>')
	const parsed = JSON.parse(json) as { name: unknown }
	if (JSON.stringify(parsed.name) !== JSON.stringify(value)) found.push('JSON-LD после разбора не равен исходному значению')
	return found
}

function escapeViolations(source: string): string[] {
	const text = source.replace(/\u0000/g, '').replace(/\r\n?/g, '\n')
	const escaped = escapeHtml(text)
	const found: string[] = []
	if (/[<>"']/.test(escaped)) found.push('в экранированном тексте остались <, >, " или \'')
	const holder = document.createElement('div')
	holder.innerHTML = `<p title="${escaped}">${escaped}</p>`
	const paragraph = holder.firstElementChild
	if (holder.children.length !== 1 || paragraph?.getAttributeNames().join() !== 'title')
		found.push('экранированный текст изменил разметку')
	else if (paragraph.textContent !== text || paragraph.getAttribute('title') !== text)
		found.push('текст после экранирования и разбора не совпал с исходным')
	return found
}

describe('фаззинг XSS: утилиты и разбор', () => {
	afterAll(() => {
		reportSummary(results, config.seed)
	})

	it('sanitizeHtml: нет запрещённых элементов, on*, опасных адресов и стилей; результат устойчив', async () => {
		expectNoFindings(
			record(await runTarget(config, { name: 'sanitizeHtml', weight: 2, generate: generateHtml, check: htmlViolations })),
		)
	})

	it('sanitizeHtml: тот же инвариант для текста с сырыми тегами, адресами и словарём', async () => {
		expectNoFindings(
			record(await runTarget(config, { name: 'sanitizeHtml(text)', weight: 0.6, generate: generateText, check: htmlViolations })),
		)
	})

	it('escapeHtml: текст остаётся текстом в содержимом и в значении атрибута', async () => {
		expectNoFindings(
			record(await runTarget(config, { name: 'escapeHtml', weight: 1, generate: generateText, check: escapeViolations })),
		)
	})

	it('isSafeUrl, resolveLinkUrl, normalizeLinkUrl, resolveLink: не пропускают схемы вне http, https, mailto, tel', async () => {
		expectNoFindings(record(await runTarget(config, { name: 'urls', weight: 3, generate: generateUrl, check: urlViolations })))
	})

	it('parseMarkdown: ссылки и картинки в дереве — только безопасные схемы', async () => {
		expectNoFindings(
			record(
				await runTarget(config, {
					name: 'parseMarkdown',
					weight: 3,
					generate: generateMarkdown,
					check: source => blockViolations(parseMarkdown(source)),
				}),
			),
		)
	})

	it('sanitizeSvg, cleanSvg: только разрешённые элементы, ссылки #id и data:image, нет on* и внешних url()', async () => {
		expectNoFindings(
			record(await runTarget(config, { name: 'sanitizeSvg', weight: 0.15, generate: generateSvg, check: svgViolations })),
		)
	})

	it('serializeJsonLd: в JSON-LD нет символов, которыми закрывают <script>', async () => {
		expectNoFindings(
			record(
				await runTarget(config, {
					name: 'serializeJsonLd',
					weight: 1,
					generate: rng => generateJson(rng),
					check: jsonLdViolations,
				}),
			),
		)
	})
})
