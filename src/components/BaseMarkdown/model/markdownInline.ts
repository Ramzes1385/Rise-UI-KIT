import { isExternalUrl, isSafeImageUrl, isSafeUrl } from '@utils/data/urlUtils'
import type {
	MarkdownDelimiterPairs,
	MarkdownInline,
	MarkdownInlineOptions,
	MarkdownInlineRule,
	MarkdownPairLookups,
} from '../types/BaseMarkdown.types'

const LINK_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:'] as const

const PUNCTUATION = /[!-/:-@[-`{-~]/

const WORD = /[\p{L}\p{N}]/u

const BARE_URL = /^(?:https?:\/\/|www\.)[^\s<]+/i

const TRAILING = /[.,;:!?'"»)\]]+$/

const MAX_INLINE_DEPTH = 32

const text = (value: string): MarkdownInline => ({ type: 'text', value })

const deeper = (options: MarkdownInlineOptions): MarkdownInlineOptions => ({ ...options, inlineDepth: (options.inlineDepth ?? 0) + 1 })

const isWebLink = (href: string): boolean => /^https?:/i.test(href) && isExternalUrl(href)

function pairDelimiters(source: string, open: string, close: string): MarkdownDelimiterPairs {
	const pairs = new Map<number, number>()
	const stack: number[] = []
	for (let index = 0; index < source.length; index += 1) {
		const char = source[index]
		if (char === '\\') index += 1
		else if (char === open) stack.push(index)
		else if (char === close && stack.length) pairs.set(stack.pop() as number, index)
	}
	return pairs
}

function createPairLookup(open: string, close: string): (source: string) => MarkdownDelimiterPairs {
	let lastSource: string | null = null
	let pairs: MarkdownDelimiterPairs = new Map()
	return source => {
		if (source !== lastSource) {
			lastSource = source
			pairs = pairDelimiters(source, open, close)
		}
		return pairs
	}
}

function readDestination(source: string, start: number, parens: MarkdownDelimiterPairs): { href: string; end: number } | null {
	const close = source[start] === '(' ? parens.get(start) : undefined
	if (close === undefined) return null
	const inner = source.slice(start + 1, close).trim()
	const href = (inner.match(/^<([^>]*)>/)?.[1] ?? inner.split(/\s+/)[0] ?? '').trim()
	return { href, end: close + 1 }
}

function readLinkParts(source: string, start: number, lookups: MarkdownPairLookups): { label: string; href: string; end: number } | null {
	const close = lookups.brackets(source).get(start)
	if (close === undefined) return null
	const destination = readDestination(source, close + 1, lookups.parens(source))
	return destination && { label: source.slice(start + 1, close), href: destination.href, end: destination.end }
}

const escapeRule: MarkdownInlineRule = (source, index) =>
	source[index] === '\\' && PUNCTUATION.test(source[index + 1] ?? '') ? { node: text(source[index + 1]), end: index + 2 } : null

const codeRule: MarkdownInlineRule = (source, index) => {
	if (source[index] !== '`') return null
	const fence = /^`+/.exec(source.slice(index))?.[0] ?? '`'
	const closer = new RegExp(`(?<!\`)${fence}(?!\`)`, 'g')
	closer.lastIndex = index + fence.length
	const match = closer.exec(source)
	if (!match) return { node: text(fence), end: index + fence.length }
	const raw = source.slice(index + fence.length, match.index).replace(/\n/g, ' ')
	const value = /^ .*[^ ].* $/.test(raw) ? raw.slice(1, -1) : raw
	return { node: { type: 'code', value }, end: match.index + fence.length }
}

function imageRule(lookups: MarkdownPairLookups): MarkdownInlineRule {
	return (source, index) => {
		if (source[index] !== '!' || source[index + 1] !== '[') return null
		const parts = readLinkParts(source, index + 1, lookups)
		if (!parts) return null
		const node: MarkdownInline = isSafeImageUrl(parts.href) ? { type: 'image', src: parts.href, alt: parts.label } : text(parts.label)
		return { node, end: parts.end }
	}
}

function linkRule(options: MarkdownInlineOptions, lookups: MarkdownPairLookups): MarkdownInlineRule {
	return (source, index) => {
		if (source[index] !== '[') return null
		const parts = readLinkParts(source, index, lookups)
		if (!parts) return null
		const node: MarkdownInline =
			parts.href && isSafeUrl(parts.href, LINK_PROTOCOLS)
				? { type: 'link', href: parts.href, isExternal: isWebLink(parts.href), children: parseInline(parts.label, deeper(options)) }
				: text(parts.label)
		return { node, end: parts.end }
	}
}

function autolinkMatch(source: string, index: number): { url: string; length: number } | null {
	if (source[index] === '<') {
		const angle = /^<(https?:\/\/[^\s>]+)>/i.exec(source.slice(index))
		return angle && { url: angle[1], length: angle[0].length }
	}
	const bare = BARE_URL.exec(source.slice(index))?.[0].replace(TRAILING, '')
	return bare ? { url: bare, length: bare.length } : null
}

const autolinkRule: MarkdownInlineRule = (source, index) => {
	if (WORD.test(source[index - 1] ?? '')) return null
	const match = autolinkMatch(source, index)
	if (!match) return null
	const href = /^www\./i.test(match.url) ? `https://${match.url}` : match.url
	return { node: { type: 'link', href, isExternal: true, children: [text(match.url)] }, end: index + match.length }
}

function runEnd(source: string, marker: string, index: number): number {
	let end = index
	while (marker.length > 1 && source[end + marker.length] === marker[0]) end += 1
	return end
}

function findCloser(source: string, marker: string, from: number): number {
	const isSingle = marker.length === 1
	for (let index = source.indexOf(marker, from); index >= 0; index = source.indexOf(marker, index + 1)) {
		const isRun = isSingle && (source[index + 1] === marker || source[index - 1] === marker)
		const isIntraword = marker[0] === '_' && WORD.test(source[index + marker.length] ?? '')
		if (!isRun && !isIntraword && !/\s/.test(source[index - 1] ?? ' ')) return runEnd(source, marker, index)
	}
	return -1
}

function delimitedRule(marker: string, type: 'strong' | 'em' | 'del', options: MarkdownInlineOptions): MarkdownInlineRule {
	let noCloserFrom = Infinity
	return (source, index) => {
		if (!source.startsWith(marker, index)) return null
		const open = index + marker.length
		const isIntraword = marker[0] === '_' && WORD.test(source[index - 1] ?? '')
		if (isIntraword || /\s/.test(source[open] ?? ' ') || open + 1 >= noCloserFrom) return null
		const close = findCloser(source, marker, open + 1)
		if (close < 0) {
			noCloserFrom = Math.min(noCloserFrom, open + 1)
			return null
		}
		return { node: { type, children: parseInline(source.slice(open, close), deeper(options)) }, end: close + marker.length }
	}
}

function lineBreakRule(options: MarkdownInlineOptions): MarkdownInlineRule {
	return (source, index) => {
		if (source[index] !== '\n') return null
		const isHard = options.hasLineBreaks || source.slice(Math.max(0, index - 2), index) === '  '
		return { node: isHard ? { type: 'br' } : text(' '), end: index + 1 }
	}
}

function inlineRules(options: MarkdownInlineOptions): MarkdownInlineRule[] {
	const lookups: MarkdownPairLookups = { brackets: createPairLookup('[', ']'), parens: createPairLookup('(', ')') }
	return [
		escapeRule,
		codeRule,
		imageRule(lookups),
		linkRule(options, lookups),
		autolinkRule,
		delimitedRule('**', 'strong', options),
		delimitedRule('__', 'strong', options),
		delimitedRule('~~', 'del', options),
		delimitedRule('*', 'em', options),
		delimitedRule('_', 'em', options),
		lineBreakRule(options),
	]
}

function firstMatch(rules: readonly MarkdownInlineRule[], source: string, index: number) {
	for (const rule of rules) {
		const match = rule(source, index)
		if (match) return match
	}
	return null
}

export function parseInline(source: string, options: MarkdownInlineOptions): MarkdownInline[] {
	if ((options.inlineDepth ?? 0) > MAX_INLINE_DEPTH) return source ? [text(source)] : []
	const rules = inlineRules(options)
	const nodes: MarkdownInline[] = []
	let buffer = ''
	let index = 0
	const flush = (next?: MarkdownInline): void => {
		const value = next?.type === 'br' ? buffer.replace(/ +$/, '') : buffer
		if (value) nodes.push(text(value))
		buffer = ''
	}
	while (index < source.length) {
		const match = firstMatch(rules, source, index)
		if (!match) buffer += source[index]
		else if (match.node.type === 'text') buffer += match.node.value
		else {
			flush(match.node)
			nodes.push(match.node)
		}
		index = match ? match.end : index + 1
	}
	flush()
	return nodes
}
