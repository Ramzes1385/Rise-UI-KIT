import { UI_FLOW_REVIEW } from '@/locales/messages'
import { formatMessage, currentLocale } from '@/locales/state'
import type { ReviewCount, ReviewSuggestionKind } from '../../../types/internal/review/reviewCore.types'

const PLURAL_ORDER: Record<string, number> = { one: 0, few: 1, many: 2, other: 3 }

export function formatCount(template: string, count: number): string {
	const forms = template.split('|')
	const category = new Intl.PluralRules(currentLocale.value.intl).select(count)
	const form = forms[PLURAL_ORDER[category] ?? 3] ?? forms[forms.length - 1]
	return formatMessage(form, { n: count })
}

const ENTITY_NOUNS: Record<string, string> = {
	node: UI_FLOW_REVIEW.NOUN_NODE,
	edge: UI_FLOW_REVIEW.NOUN_EDGE,
	group: UI_FLOW_REVIEW.NOUN_GROUP,
	scenario: UI_FLOW_REVIEW.NOUN_SCENARIO,
}

const SIGNS = { add: '+', remove: '−', update: '~' } as const

export function summaryText(counts: readonly ReviewCount[]): string {
	return counts.map(item => `${SIGNS[item.kind]}${formatCount(ENTITY_NOUNS[item.entity] ?? ENTITY_NOUNS.node, item.count)}`).join(', ')
}

const KIND_LABELS: Record<ReviewSuggestionKind, string> = {
	add: UI_FLOW_REVIEW.KIND_ADD,
	remove: UI_FLOW_REVIEW.KIND_REMOVE,
	rename: UI_FLOW_REVIEW.KIND_RENAME,
	move: UI_FLOW_REVIEW.KIND_MOVE,
	update: UI_FLOW_REVIEW.KIND_UPDATE,
	mixed: UI_FLOW_REVIEW.KIND_MIXED,
}

export function kindLabel(kind: ReviewSuggestionKind): string {
	return KIND_LABELS[kind]
}

const KIND_STATUS: Record<ReviewSuggestionKind, 'success' | 'error' | 'warning' | 'info' | 'neutral'> = {
	add: 'success',
	remove: 'error',
	rename: 'warning',
	move: 'info',
	update: 'warning',
	mixed: 'neutral',
}

export function kindStatus(kind: ReviewSuggestionKind): 'success' | 'error' | 'warning' | 'info' | 'neutral' {
	return KIND_STATUS[kind]
}

export function formatValue(value: unknown): string {
	if (value === undefined || value === null) return '—'
	if (typeof value === 'object') return JSON.stringify(value)
	return String(value)
}
