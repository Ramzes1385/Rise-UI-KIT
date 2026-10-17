import { parseInline } from './markdownInline'
import type {
	MarkdownAlign,
	MarkdownBlock,
	MarkdownBlockOptions,
	MarkdownBlockRule,
	MarkdownHeadingLevel,
	MarkdownInline,
	MarkdownInlineOptions,
	MarkdownListItem,
	MarkdownListMarker,
} from '../types/BaseMarkdown.types'

const MAX_DEPTH = 32

const FENCE = /^( {0,3})(`{3,}|~{3,})[ \t]*([^\s`]*)/

const HEADING = /^ {0,3}(#{1,6})(?:[ \t]+(.*?))?(?:[ \t]+#+)?[ \t]*$/

const RULE = /^ {0,3}(?:(?:-[ \t]*){3,}|(?:\*[ \t]*){3,}|(?:_[ \t]*){3,})$/

const QUOTE = /^ {0,3}> ?/

const BULLET = /^( {0,3})([-*+])(?:[ \t]+(.*))?$/

const ORDERED = /^( {0,3})(\d{1,9})[.)](?:[ \t]+(.*))?$/

const SETEXT = /^ {0,3}(=+|-+)[ \t]*$/

const TASK = /^\[([ xX])\][ \t]+/

const TABLE_DELIMITER = /^ {0,3}\|?[ \t]*:?-+:?[ \t]*(?:\|[ \t]*:?-+:?[ \t]*)*\|?[ \t]*$/

const isBlank = (line: string | undefined): boolean => !line?.trim()

const indentOf = (line: string): number => line.length - line.trimStart().length

const dedent = (line: string, size: number): string => line.slice(Math.min(size, indentOf(line)))

function listMarker(line: string): MarkdownListMarker | null {
	const bullet = BULLET.exec(line)
	const ordered = bullet ? null : ORDERED.exec(line)
	const match = bullet ?? ordered
	if (!match) return null
	const [, indent, marker, content = ''] = match
	const width = indent.length + marker.length + (ordered ? 1 : 0)
	const spacing = line.length - width - content.length
	return {
		indent: indent.length,
		ordered: Boolean(ordered),
		start: ordered ? Number(marker) : 1,
		offset: width + (spacing >= 1 && spacing <= 4 ? spacing : 1),
		text: content,
	}
}

function startsBlock(line: string): boolean {
	const marker = listMarker(line)
	const isListStart = Boolean(marker && marker.text && (!marker.ordered || marker.start === 1))
	return FENCE.test(line) || HEADING.test(line) || RULE.test(line) || QUOTE.test(line) || isListStart
}

function fenceRule(): MarkdownBlockRule {
	return (lines, index) => {
		const open = FENCE.exec(lines[index])
		if (!open) return null
		const [, indent, fence, lang] = open
		const closer = new RegExp(`^ {0,3}${fence[0] === '`' ? '`' : '~'}{${fence.length},}[ \\t]*$`)
		const close = lines.findIndex((line, lineIndex) => lineIndex > index && closer.test(line))
		const end = close < 0 ? lines.length : close
		const value = lines
			.slice(index + 1, end)
			.map(line => dedent(line, indent.length))
			.join('\n')
		return { block: { type: 'code', lang, value, hasCaret: false }, next: close < 0 ? end : end + 1 }
	}
}

function headingRule(options: MarkdownInlineOptions): MarkdownBlockRule {
	return (lines, index) => {
		const match = HEADING.exec(lines[index])
		if (!match) return null
		const level = match[1].length as MarkdownHeadingLevel
		return { block: { type: 'heading', level, children: parseInline(match[2] ?? '', options) }, next: index + 1 }
	}
}

const ruleRule: MarkdownBlockRule = (lines, index) => (RULE.test(lines[index]) ? { block: { type: 'hr' }, next: index + 1 } : null)

const deeper = (options: MarkdownBlockOptions): MarkdownBlockOptions => ({ ...options, depth: (options.depth ?? 0) + 1 })

function quoteRule(options: MarkdownBlockOptions): MarkdownBlockRule {
	return (lines, index) => {
		if (!QUOTE.test(lines[index])) return null
		let next = index
		while (next < lines.length && QUOTE.test(lines[next])) next += 1
		const inner = lines.slice(index, next).map(line => line.replace(QUOTE, ''))
		return { block: { type: 'blockquote', children: parseBlocks(inner, deeper(options)) }, next }
	}
}

function firstFilled(lines: readonly string[], from: number): number {
	let index = from
	while (index < lines.length && isBlank(lines[index])) index += 1
	return index
}

function isItemBreak(lines: readonly string[], next: number, marker: MarkdownListMarker): boolean {
	const line = lines[next]
	if (!isBlank(line)) return indentOf(line) < marker.offset && Boolean(listMarker(line) || startsBlock(line))
	const following = firstFilled(lines, next)
	return following >= lines.length || indentOf(lines[following]) < marker.offset
}

function itemEnd(lines: readonly string[], index: number, marker: MarkdownListMarker): number {
	let next = index + 1
	while (next < lines.length && !isItemBreak(lines, next, marker)) next += 1
	return next
}

function listItem(lines: readonly string[], marker: MarkdownListMarker, options: MarkdownBlockOptions): MarkdownListItem {
	const task = TASK.exec(marker.text)
	const content = [task ? marker.text.slice(task[0].length) : marker.text, ...lines.map(line => dedent(line, marker.offset))]
	const children = parseBlocks(content, deeper(options))
	const [first] = children
	const inline = children.length === 1 && first?.type === 'paragraph' ? first.children : null
	return { checked: task ? task[1] !== ' ' : null, inline, children: inline ? [] : children }
}

function nextItem(lines: readonly string[], index: number, first: MarkdownListMarker): number | null {
	const next = firstFilled(lines, index)
	if (next >= lines.length) return null
	const marker = listMarker(lines[next])
	return marker && marker.ordered === first.ordered && marker.indent === first.indent ? next : null
}

function listRule(options: MarkdownBlockOptions): MarkdownBlockRule {
	return (lines, index) => {
		const first = listMarker(lines[index])
		if (!first) return null
		const items: MarkdownListItem[] = []
		let cursor: number | null = index
		let next = index
		while (cursor !== null) {
			const marker = listMarker(lines[cursor]) as MarkdownListMarker
			next = itemEnd(lines, cursor, marker)
			items.push(listItem(lines.slice(cursor + 1, next), marker, options))
			cursor = nextItem(lines, next, first)
		}
		return { block: { type: 'list', ordered: first.ordered, start: first.start, items }, next }
	}
}

function splitRow(line: string): string[] {
	const trimmed = line
		.trim()
		.replace(/^\|/, '')
		.replace(/(?<!\\)\|$/, '')
	return trimmed.split(/(?<!\\)\|/).map(cell => cell.trim().replace(/\\\|/g, '|'))
}

function alignOf(cell: string): MarkdownAlign {
	if (cell.startsWith(':') && cell.endsWith(':')) return 'center'
	if (cell.endsWith(':')) return 'right'
	return cell.startsWith(':') ? 'left' : null
}

function tableRule(options: MarkdownInlineOptions): MarkdownBlockRule {
	return (lines, index) => {
		const header = lines[index]
		const delimiter = lines[index + 1]
		if (!header.includes('|') || delimiter === undefined || !TABLE_DELIMITER.test(delimiter)) return null
		const head = splitRow(header)
		const align = splitRow(delimiter).map(alignOf)
		if (head.length !== align.length) return null
		let next = index + 2
		while (next < lines.length && !isBlank(lines[next]) && lines[next].includes('|')) next += 1
		const cells = (row: string[]): MarkdownInline[][] => head.map((_, column) => parseInline(row[column] ?? '', options))
		const rows = lines.slice(index + 2, next).map(line => cells(splitRow(line)))
		return { block: { type: 'table', align, head: cells(head), rows }, next }
	}
}

function paragraphBlock(lines: readonly string[], index: number, options: MarkdownInlineOptions) {
	let next = index + 1
	while (next < lines.length && !isBlank(lines[next]) && !SETEXT.test(lines[next]) && !startsBlock(lines[next])) next += 1
	const content = lines
		.slice(index, next)
		.map(line => line.trimStart())
		.join('\n')
		.trimEnd()
	const setext = next < lines.length ? SETEXT.exec(lines[next]) : null
	const block: MarkdownBlock = setext
		? { type: 'heading', level: setext[1][0] === '=' ? 1 : 2, children: parseInline(content, options) }
		: { type: 'paragraph', children: parseInline(content, options) }
	return { block, next: setext ? next + 1 : next }
}

function blockRules(options: MarkdownBlockOptions): MarkdownBlockRule[] {
	const nested = (options.depth ?? 0) < MAX_DEPTH ? [quoteRule(options), listRule(options)] : []
	return [fenceRule(), headingRule(options), ruleRule, ...nested, tableRule(options)]
}

function firstBlock(rules: readonly MarkdownBlockRule[], lines: readonly string[], index: number) {
	for (const rule of rules) {
		const match = rule(lines, index)
		if (match) return match
	}
	return null
}

export function parseBlocks(lines: readonly string[], options: MarkdownBlockOptions): MarkdownBlock[] {
	const rules = blockRules(options)
	const blocks: MarkdownBlock[] = []
	let index = 0
	while (index < lines.length) {
		if (isBlank(lines[index])) {
			index += 1
			continue
		}
		const match = firstBlock(rules, lines, index) ?? paragraphBlock(lines, index, options)
		blocks.push(match.block)
		index = match.next
	}
	return blocks
}
