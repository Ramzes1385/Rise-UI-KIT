import { parseBlocks } from './markdownBlocks'
import type { MarkdownBlock, MarkdownInline, MarkdownListItem } from '../types/BaseMarkdown.types'

const CARET: MarkdownInline = { type: 'caret' }

export function parseMarkdown(source: string, hasLineBreaks = true): MarkdownBlock[] {
	const lines = source.replace(/\r\n?/g, '\n').replace(/\t/g, '    ').split('\n')
	return parseBlocks(lines, { hasLineBreaks })
}

function withCaretItem(item: MarkdownListItem): MarkdownListItem {
	return item.inline ? { ...item, inline: [...item.inline, CARET] } : { ...item, children: withCaret(item.children) }
}

function withCaretBlock(block: MarkdownBlock): MarkdownBlock[] {
	switch (block.type) {
		case 'heading':
		case 'paragraph':
			return [{ ...block, children: [...block.children, CARET] }]
		case 'code':
			return [{ ...block, hasCaret: true }]
		case 'blockquote':
			return [{ ...block, children: withCaret(block.children) }]
		case 'list':
			return [{ ...block, items: [...block.items.slice(0, -1), ...block.items.slice(-1).map(withCaretItem)] }]
		default:
			return [block, { type: 'paragraph', children: [CARET] }]
	}
}

export function withCaret(blocks: readonly MarkdownBlock[]): MarkdownBlock[] {
	const last = blocks[blocks.length - 1]
	return last ? [...blocks.slice(0, -1), ...withCaretBlock(last)] : [{ type: 'paragraph', children: [CARET] }]
}
