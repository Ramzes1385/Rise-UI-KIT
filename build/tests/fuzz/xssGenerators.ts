/** Генераторы входов для фаззинга XSS: HTML, Markdown, текст сообщений, SVG, JSON, адреса. Всё детерминировано от Rng */

import type { Rng } from './rng'
import {
	BENIGN_ATTRIBUTES,
	BENIGN_TAGS,
	CSS_PAYLOADS,
	DANGEROUS_TAGS,
	dangerousUrl,
	EVENT_HANDLERS,
	flipCase,
	MXSS_TEMPLATES,
	PROTOTYPE_TAGS,
	SCRIPT_PAYLOADS,
	TEXT_FRAGMENTS,
	URL_ATTRIBUTES,
} from './xssVocabulary'

const MAX_DEPTH = 3

const ATTRIBUTE_SEPARATORS = [' ', ' ', ' ', '\n', '\t', '/', '\u0000', '\f', '\r', '  '] as const
const SPECIAL_CHARS = [
	'<',
	'>',
	'"',
	"'",
	'=',
	'/',
	'&',
	'`',
	';',
	'\u0000',
	'\\',
	'!',
	'-',
	'[',
	']',
	'(',
	')',
	'#',
	':',
	' ',
	'\n',
] as const

function tagName(rng: Rng): string {
	const roll = rng.next()
	if (roll < 0.55) return rng.pick(DANGEROUS_TAGS)
	if (roll < 0.8) return rng.pick(BENIGN_TAGS)
	if (roll < 0.9) return rng.pick(PROTOTYPE_TAGS)
	return `${rng.pick(BENIGN_TAGS)}${rng.pick(['-x', '\u0000', ':x', '1', '_'] as const)}`
}

function attributeName(rng: Rng): string {
	const roll = rng.next()
	if (roll < 0.35) return rng.pick(EVENT_HANDLERS)
	if (roll < 0.7) return rng.pick(URL_ATTRIBUTES)
	return rng.pick(BENIGN_ATTRIBUTES)
}

function attributeValue(rng: Rng, name: string): string {
	if (name.toLowerCase().startsWith('on')) return rng.pick(SCRIPT_PAYLOADS)
	if (name === 'style' || name === 'color') return rng.pick(CSS_PAYLOADS)
	if (name === 'srcset') return `${dangerousUrl(rng, 'html')} 1x, ${dangerousUrl(rng, 'html')} 2x`
	if (name === 'target') return rng.pick(['_blank', '_self', '_top', '_parent', 'x', ' _blank', '_BLANK'] as const)
	if (name === 'rel') return rng.pick(['', 'opener', 'noopener', 'nofollow', 'noopener noreferrer'] as const)
	if (name === 'align') return rng.pick(['left', 'CENTER', ' right ', 'justify', 'x" onclick="alert(1)'] as const)
	if (URL_ATTRIBUTES.includes(name as (typeof URL_ATTRIBUTES)[number])) return dangerousUrl(rng, 'html')
	return rng.chance(0.5) ? rng.pick(TEXT_FRAGMENTS) : String(rng.int(100))
}

function quote(rng: Rng, value: string): string {
	const roll = rng.next()
	if (roll < 0.5) return `"${value.replace(/"/g, '&quot;')}"`
	if (roll < 0.7) return `'${value.replace(/'/g, '&#39;')}'`
	if (roll < 0.85) return value.replace(/[\s"'`=<>]/g, '')
	if (roll < 0.92) return `\`${value}\``
	return `"${value}`
}

function attribute(rng: Rng): string {
	const base = attributeName(rng)
	const name = rng.chance(0.25) ? flipCase(rng, base) : base
	const spaced = rng.chance(0.15) ? `${name}${rng.pick(ATTRIBUTE_SEPARATORS)}` : name
	if (rng.chance(0.1)) return spaced
	const equals = rng.chance(0.15) ? ` ${rng.pick(['=', '=\n', '=\t'] as const)} ` : '='
	return `${spaced}${equals}${quote(rng, attributeValue(rng, base))}`
}

function openTag(rng: Rng, name: string): string {
	const attributes = rng.times(rng.range(0, 4), () => attribute(rng))
	const joined = attributes.map(item => `${rng.pick(ATTRIBUTE_SEPARATORS)}${item}`).join('')
	const display = rng.chance(0.3) ? flipCase(rng, name) : name
	const lead = rng.chance(0.05) ? rng.pick(['\u0000', ' ', '/', '\n'] as const) : ''
	const close = rng.pick(['>', '>', '>', '/>', ' >', '//>', '\n>', ''] as const)
	return `<${lead}${display}${joined}${close}`
}

function closeTag(rng: Rng, name: string): string {
	const roll = rng.next()
	if (roll < 0.15) return ''
	if (roll < 0.25) return `</${tagName(rng)}>`
	if (roll < 0.3) return `</ ${name}>`
	if (roll < 0.35) return `</${name} onclick=alert(1)>`
	return `</${rng.chance(0.3) ? flipCase(rng, name) : name}>`
}

function comment(rng: Rng): string {
	return rng.pick([
		'<!-- c -->',
		'<!---->',
		'<!-->',
		'<!--->',
		`<!--${rng.pick(MXSS_TEMPLATES)}-->`,
		'<!--[if IE]><script>alert(1)</script><![endif]-->',
		'<!-- --!>',
		'<!--',
		'-->',
		'<![CDATA[x]]>',
		`<![CDATA[${rng.pick(MXSS_TEMPLATES)}]]>`,
		'<?xml version="1.0"?>',
		'<!DOCTYPE html>',
		'<!doctype svg>',
		'<?php echo 1 ?>',
		'</>',
		'<>',
		'< >',
		'<%',
		'<!',
	] as const)
}

function text(rng: Rng): string {
	return rng.times(rng.range(1, 3), () => rng.pick(TEXT_FRAGMENTS)).join(rng.pick(['', ' '] as const))
}

function node(rng: Rng, depth: number): string {
	const roll = rng.next()
	if (roll < 0.15) return text(rng)
	if (roll < 0.22) return comment(rng)
	if (roll < 0.34) return rng.pick(MXSS_TEMPLATES)
	const name = tagName(rng)
	const children = depth < MAX_DEPTH && rng.chance(0.6) ? rng.times(rng.range(1, 3), () => node(rng, depth + 1)).join('') : text(rng)
	return `${openTag(rng, name)}${children}${closeTag(rng, name)}`
}

function soup(rng: Rng): string {
	const pieces = [
		...SPECIAL_CHARS,
		...DANGEROUS_TAGS,
		...EVENT_HANDLERS,
		...URL_ATTRIBUTES,
		'javascript:',
		'alert(1)',
		'data:',
		'/',
		'=',
	] as const
	return rng
		.times(rng.range(3, 25), () => (rng.chance(0.5) ? rng.pick(pieces) : String(rng.pick(SPECIAL_CHARS))))
		.join(rng.chance(0.3) ? ' ' : '')
}

/** Случайная порча строки: вставка и удаление служебных символов, дублирование и обрезка */
export function mutate(rng: Rng, source: string): string {
	let result = source
	for (let step = rng.range(0, 3); step > 0; step -= 1) {
		const at = rng.int(result.length + 1)
		const roll = rng.next()
		if (roll < 0.3) result = `${result.slice(0, at)}${rng.pick(SPECIAL_CHARS)}${result.slice(at)}`
		else if (roll < 0.5) result = `${result.slice(0, at)}${result.slice(at + rng.range(1, 3))}`
		else if (roll < 0.65) result = result.slice(0, at)
		else if (roll < 0.8) result = `${result.slice(0, at)}${result.slice(at, at + rng.range(1, 8))}${result.slice(at)}`
		else result = `${result.slice(0, at)}${rng.pick(MXSS_TEMPLATES)}${result.slice(at)}`
	}
	return result
}

export function generateHtml(rng: Rng): string {
	const roll = rng.next()
	if (roll < 0.55) return rng.times(rng.range(1, 5), () => node(rng, 0)).join(rng.pick(['', '', '\n', ' '] as const))
	if (roll < 0.75) return mutate(rng, rng.pick(MXSS_TEMPLATES))
	if (roll < 0.9) return mutate(rng, soup(rng))
	return mutate(rng, rng.times(rng.range(2, 4), () => rng.pick(MXSS_TEMPLATES)).join(''))
}

/** Строка для вставки как текст: словарь фрагментов, сырые теги и адреса вперемешку */
export function generateText(rng: Rng): string {
	const parts = rng.times(rng.range(1, 6), () => {
		const roll = rng.next()
		if (roll < 0.4) return rng.pick(TEXT_FRAGMENTS)
		if (roll < 0.6) return rng.pick(MXSS_TEMPLATES)
		if (roll < 0.8) return dangerousUrl(rng, 'plain')
		return node(rng, 2)
	})
	return mutate(rng, parts.join(rng.pick([' ', '', '\n', '\n\n'] as const)))
}

function markdownLabel(rng: Rng): string {
	return rng.pick([
		'x',
		'ссылка',
		'`code`',
		'**bold**',
		'<script>alert(1)</script>',
		'<img src=x onerror=alert(1)>',
		'![i](javascript:alert(1))',
		'a]b',
		'a[b',
		'\\]',
		'_em_',
		'',
	] as const)
}

function markdownLink(rng: Rng): string {
	const url = dangerousUrl(rng, 'plain')
	const form = rng.int(9)
	if (form === 0) return `[${markdownLabel(rng)}](${url})`
	if (form === 1) return `![${markdownLabel(rng)}](${url})`
	if (form === 2) return `[${markdownLabel(rng)}](<${url}>)`
	if (form === 3) return `[${markdownLabel(rng)}](${url} "title\\" onmouseover=\\"alert(1)")`
	if (form === 4) return `[${markdownLabel(rng)}][r]\n\n[r]: ${url}`
	if (form === 5) return `<${url}>`
	if (form === 6) return `[![${markdownLabel(rng)}](${dangerousUrl(rng, 'plain')})](${url})`
	if (form === 7) return `[${markdownLabel(rng)}](  ${url}  )`
	return `${rng.pick(['http://', 'https://', 'www.', 'HTTPS://', 'ftp://'] as const)}${rng.pick(['example.com/', 'x.y/"onmouseover="alert(1)', 'a.b/<script>', 'a.b/)'] as const)}`
}

function markdownInline(rng: Rng): string {
	const roll = rng.next()
	if (roll < 0.35) return markdownLink(rng)
	if (roll < 0.5) return rng.pick(MXSS_TEMPLATES)
	if (roll < 0.62)
		return `${rng.pick(['**', '__', '*', '_', '~~', '`', '``'] as const)}${text(rng)}${rng.pick(['**', '__', '*', '_', '~~', '`', '``', ''] as const)}`
	if (roll < 0.7) return rng.pick(['\\', '\\<', '\\[', '\\`', '\\\\', '\\&'] as const)
	return text(rng)
}

function markdownBlock(rng: Rng): string {
	const roll = rng.next()
	const inline = (): string => rng.times(rng.range(1, 4), () => markdownInline(rng)).join(rng.pick([' ', '', '  \n'] as const))
	if (roll < 0.3) return inline()
	if (roll < 0.4) return `${'#'.repeat(rng.range(1, 7))} ${inline()}`
	if (roll < 0.5)
		return `${rng.pick(['- ', '* ', '1. ', '+ ', '- [ ] ', '- [x] ', '10) '] as const)}${inline()}\n${rng.pick(['  - ', '    ', '- ', ''] as const)}${inline()}`
	if (roll < 0.58) return `> ${inline()}\n> ${inline()}`
	if (roll < 0.68)
		return `${rng.pick(['```', '~~~', '````'] as const)}${rng.pick(['js', 'html', '"><img src=x onerror=alert(1)>', 'ts title="x"', ''] as const)}\n${text(rng)}\n${rng.pick(['```', '~~~', ''] as const)}`
	if (roll < 0.76) return `| ${inline()} | ${inline()} |\n| :-- | --: |\n| ${inline()} | ${inline()} |`
	if (roll < 0.8) return rng.pick(['---', '***', '___', '- - -'] as const)
	if (roll < 0.9) return rng.pick(MXSS_TEMPLATES)
	return `    ${inline()}`
}

export function generateMarkdown(rng: Rng): string {
	return mutate(rng, rng.times(rng.range(1, 5), () => markdownBlock(rng)).join(rng.pick(['\n\n', '\n', '\n\n\n'] as const)))
}

/** Адрес из недоверенных данных — для проверок `isSafeUrl`, `resolveLinkUrl`, ссылок */
export function generateUrl(rng: Rng): string {
	const url = dangerousUrl(rng, rng.pick(['plain', 'html'] as const))
	return rng.chance(0.2) ? mutate(rng, url) : url
}

const SVG_TAGS = [
	'svg',
	'g',
	'path',
	'rect',
	'circle',
	'text',
	'tspan',
	'title',
	'desc',
	'defs',
	'use',
	'image',
	'symbol',
	'script',
	'style',
	'foreignObject',
	'a',
	'animate',
	'set',
	'iframe',
	'mask',
	'pattern',
	'linearGradient',
	'stop',
	'filter',
	'feImage',
	'switch',
	'handler',
] as const
const SVG_ATTRIBUTES = [
	'fill',
	'stroke',
	'style',
	'href',
	'xlink:href',
	'd',
	'x',
	'y',
	'width',
	'height',
	'transform',
	'clip-path',
	'mask',
	'id',
	'class',
	'viewBox',
	'onload',
	'onclick',
	'onbegin',
	'filter',
	'font-family',
	'points',
	'offset',
	'values',
	'attributeName',
] as const

function svgAttribute(rng: Rng): string {
	const name = rng.pick(SVG_ATTRIBUTES)
	const roll = rng.next()
	let value: string = String(rng.int(50))
	if (name === 'href' || name === 'xlink:href')
		value = rng.chance(0.5) ? `#${rng.pick(['a', 'b', 'x y', 'a"b'] as const)}` : dangerousUrl(rng, 'plain')
	else if (name.startsWith('on')) value = rng.pick(SCRIPT_PAYLOADS)
	else if (name === 'style' || roll < 0.2) value = rng.pick(CSS_PAYLOADS).replace(/&/g, '&amp;').replace(/</g, '&lt;')
	else if (name === 'fill' || name === 'stroke' || name === 'clip-path' || name === 'mask' || name === 'filter')
		value = rng.pick([
			'red',
			'url(#a)',
			'url(javascript:alert(1))',
			'url(&quot;#a&quot;)',
			'rgb(1,2,3)',
			'url(//evil.test/x#a)',
			'expression(alert(1))',
		] as const)
	return `${name}="${value.replace(/"/g, '&quot;')}"`
}

function svgNode(rng: Rng, depth: number): string {
	const name = rng.pick(SVG_TAGS)
	const attributes = rng.times(rng.range(0, 4), () => svgAttribute(rng)).join(' ')
	const inner =
		depth < MAX_DEPTH && rng.chance(0.5)
			? rng.times(rng.range(1, 3), () => svgNode(rng, depth + 1)).join('')
			: rng.pick(['', 'text', '<![CDATA[alert(1)]]>', '&lt;script&gt;', '<!-- c -->', 'alert(1)'] as const)
	return rng.chance(0.15) ? `<${name} ${attributes}/>` : `<${name} ${attributes}>${inner}</${name}>`
}

/** SVG-разметка (XML) для `sanitizeSvg`: корень `svg` с пространствами имён, внутри — разрешённые и запрещённые элементы */
export function generateSvg(rng: Rng): string {
	const attributes = rng.times(rng.range(0, 3), () => svgAttribute(rng)).join(' ')
	const body = rng.times(rng.range(1, 4), () => svgNode(rng, 0)).join('')
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ${attributes}>${body}</svg>`
	return rng.chance(0.2) ? mutate(rng, svg) : svg
}

/** Произвольное JSON-значение с недоверенными ключами и строками */
export function generateJson(rng: Rng, depth = 0): unknown {
	const roll = rng.next()
	if (depth >= MAX_DEPTH || roll < 0.4) {
		const leaf = rng.int(6)
		if (leaf === 0) return rng.int(1000) / 7
		if (leaf === 1) return rng.chance(0.5)
		if (leaf === 2) return null
		return generateText(rng)
	}
	if (roll < 0.65) return rng.times(rng.range(0, 4), () => generateJson(rng, depth + 1))
	const entries = rng.times(
		rng.range(0, 4),
		() =>
			[
				rng.chance(0.4) ? generateText(rng) : rng.pick(['__proto__', 'constructor', 'toString', 'a', 'onerror'] as const),
				generateJson(rng, depth + 1),
			] as const,
	)
	return JSON.parse(
		`{${entries.map(([key, value]) => `${JSON.stringify(key)}:${JSON.stringify(value) ?? 'null'}`).join(',')}}`,
	) as unknown
}
