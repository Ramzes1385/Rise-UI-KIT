import { diffSequence } from './sequenceDiff'
import type { TextDiffRow, TextDiffLine, TextDiffPart, TextDiffChange } from '../../types/BaseTextDiff.types'

const SIMILARITY = 0.4

export const splitLines = (text: string): string[] => (text === '' ? [] : text.split(/\r?\n/))

const splitWords = (line: string): string[] => line.split(/(\s+)/).filter(Boolean)

const textOf = (line: TextDiffLine): string => line.parts.map(part => part.text).join('')

function mergeParts(parts: readonly TextDiffPart[]): TextDiffPart[] {
	return parts.reduce<TextDiffPart[]>((merged, part) => {
		const last = merged[merged.length - 1]
		if (last?.type === part.type) last.text += part.text
		else merged.push({ ...part })
		return merged
	}, [])
}

export function diffWords(before: string, after: string): { removed: TextDiffPart[]; added: TextDiffPart[] } {
	const left = splitWords(before)
	const right = splitWords(after)
	const removed: TextDiffPart[] = []
	const added: TextDiffPart[] = []
	const cursor = { row: 0, column: 0 }
	for (const change of diffSequence(left, right)) {
		if (change !== 'added') removed.push({ text: left[cursor.row++], type: change })
		if (change !== 'removed') added.push({ text: right[cursor.column++], type: change })
	}
	return { removed: mergeParts(removed), added: mergeParts(added) }
}

const equalShare = (parts: readonly TextDiffPart[], length: number): number =>
	parts.filter(part => part.type === 'equal').reduce((sum, part) => sum + part.text.length, 0) / Math.max(length, 1)

function highlightPair(removedLine: TextDiffLine, addedLine: TextDiffLine): void {
	const before = textOf(removedLine)
	const after = textOf(addedLine)
	const words = diffWords(before, after)
	if (equalShare(words.removed, Math.max(before.length, after.length)) < SIMILARITY) return
	removedLine.parts = words.removed
	addedLine.parts = words.added
}

function segmentsOf(changes: readonly TextDiffChange[]) {
	const segments: ({ row: number; column: number } | { removed: number[]; added: number[] })[] = []
	const cursor = { row: 0, column: 0 }
	for (const change of changes) {
		if (change === 'equal') {
			segments.push({ row: cursor.row++, column: cursor.column++ })
			continue
		}
		const last = segments[segments.length - 1]
		const block = last && 'removed' in last ? last : { removed: [], added: [] }
		if (block !== last) segments.push(block)
		if (change === 'removed') block.removed.push(cursor.row++)
		else block.added.push(cursor.column++)
	}
	return segments
}

function changedLines(
	texts: { left: readonly string[]; right: readonly string[] },
	block: { removed: number[]; added: number[] },
	isWordDiff: boolean,
): TextDiffLine[] {
	const removed = block.removed.map((row): TextDiffLine => ({
		type: 'removed',
		before: row + 1,
		parts: [{ text: texts.left[row], type: 'equal' }],
	}))
	const added = block.added.map((column): TextDiffLine => ({
		type: 'added',
		after: column + 1,
		parts: [{ text: texts.right[column], type: 'equal' }],
	}))
	const pairs = isWordDiff ? Math.min(removed.length, added.length) : 0
	for (let index = 0; index < pairs; index++) highlightPair(removed[index], added[index])
	return [...removed, ...added]
}

export function diffLines(before: string, after: string, isWordDiff = true): TextDiffLine[] {
	const texts = { left: splitLines(before), right: splitLines(after) }
	return segmentsOf(diffSequence(texts.left, texts.right)).flatMap(segment =>
		'removed' in segment
			? changedLines(texts, segment, isWordDiff)
			: [
					{
						type: 'equal' as const,
						before: segment.row + 1,
						after: segment.column + 1,
						parts: [{ text: texts.left[segment.row], type: 'equal' as const }],
					},
				],
	)
}

export function splitRows(lines: readonly TextDiffLine[]): TextDiffRow[] {
	const rows: TextDiffRow[] = []
	const block: { removed: TextDiffLine[]; added: TextDiffLine[] } = { removed: [], added: [] }
	const flush = (): void => {
		const size = Math.max(block.removed.length, block.added.length)
		for (let index = 0; index < size; index++) rows.push({ left: block.removed[index], right: block.added[index] })
		block.removed = []
		block.added = []
	}
	for (const line of lines) {
		if (line.type === 'equal') {
			flush()
			rows.push({ left: line, right: line })
		} else block[line.type].push(line)
	}
	flush()
	return rows
}
