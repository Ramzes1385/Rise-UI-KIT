import type {
	ReviewDescriber,
	ReviewChangeInfo,
	ReviewChangeKind,
	ReviewField,
	ReviewMark,
} from '../../../types/internal/review/reviewCore.types'

export function markKey(entity: string, id: string): string {
	return `${entity}:${id}`
}

export function isReviewEqual(left: unknown, right: unknown): boolean {
	if (left === right) return true
	if (typeof left !== 'object' || typeof right !== 'object' || left === null || right === null) return false
	if (Array.isArray(left) !== Array.isArray(right)) return false
	const first = left as Record<string, unknown>
	const second = right as Record<string, unknown>
	const keys = new Set([...Object.keys(first), ...Object.keys(second)])
	for (const key of keys) {
		if (!isReviewEqual(first[key], second[key])) return false
	}
	return true
}

export function diffFields(patch: Record<string, unknown>, previous: Record<string, unknown>): ReviewField[] {
	const fields: ReviewField[] = []
	for (const field of new Set([...Object.keys(patch), ...Object.keys(previous)])) {
		if (!isReviewEqual(patch[field], previous[field])) fields.push({ field, before: previous[field], after: patch[field] })
	}
	return fields
}

function mergeFields(first: ReviewField[], next: ReviewField[]): ReviewField[] {
	const merged = new Map(first.map(item => [item.field, item]))
	for (const item of next) {
		const known = merged.get(item.field)
		merged.set(item.field, known ? { field: item.field, before: known.before, after: item.after } : item)
	}
	return [...merged.values()].filter(item => !isReviewEqual(item.before, item.after))
}

function mergeKind(first: ReviewChangeKind, next: ReviewChangeKind): ReviewChangeKind {
	if (first === next) return first
	if (first === 'add' || next === 'add') return 'add'
	if (first === 'remove' || next === 'remove') return 'remove'
	return 'update'
}

function mergeInfo(first: ReviewMark, info: ReviewChangeInfo): ReviewMark {
	if (first.kind === 'add' && info.kind === 'remove') return { ...first, kind: 'remove', fields: [] }
	if (first.kind === 'add') return { ...first, value: info.value ?? first.value }
	return {
		...first,
		kind: mergeKind(first.kind, info.kind),
		fields: mergeFields(first.fields, info.fields),
		value: first.value ?? info.value,
	}
}

function toMark(info: ReviewChangeInfo): ReviewMark {
	return { key: markKey(info.entity, info.id), entity: info.entity, id: info.id, kind: info.kind, fields: info.fields, value: info.value }
}

export function buildReviewMarks<C>(changes: readonly C[], adapter: ReviewDescriber<C>): ReviewMark[] {
	const marks = new Map<string, ReviewMark>()
	for (const change of changes) {
		const info = adapter.describe(change)
		if (!info) continue
		const key = markKey(info.entity, info.id)
		const known = marks.get(key)
		marks.set(key, known ? mergeInfo(known, info) : toMark(info))
	}
	return [...marks.values()]
}

export function buildSuggestionMarks<C>(
	suggestions: readonly { id: string; author: { name: string }; changes: readonly C[] }[],
	adapter: ReviewDescriber<C>,
): ReviewMark[] {
	return suggestions.flatMap(item =>
		buildReviewMarks(item.changes, adapter).map(mark => ({ ...mark, suggestionId: item.id, author: item.author.name })),
	)
}

export function markGlyph(kind: ReviewChangeKind): string {
	if (kind === 'add') return '+'
	if (kind === 'remove') return '−'
	return kind === 'move' ? '→' : '~'
}
