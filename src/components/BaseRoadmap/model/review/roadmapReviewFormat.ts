import { UI_ROADMAP_REVIEW } from '@/locales/messages'
import { currentLocale, formatMessage } from '@/locales/state'
import type { RoadmapKindStatus as KindStatus } from '../../types/internal/roadmapReview.types'
import type { ReviewCount, ReviewSuggestionKind } from '@components/BaseFlowMap/types/internal/review/reviewCore.types'

const PLURAL_ORDER: Record<string, number> = { one: 0, few: 1, many: 2, other: 3 }

export function formatCount(template: string, count: number): string {
	const forms = template.split('|')
	const category = new Intl.PluralRules(currentLocale.value.intl).select(count)
	return formatMessage(forms[PLURAL_ORDER[category] ?? 3] ?? forms[forms.length - 1], { n: count })
}

const NOUNS: Record<string, string> = { stage: UI_ROADMAP_REVIEW.NOUN_STAGE, topic: UI_ROADMAP_REVIEW.NOUN_TOPIC }
const SIGNS = { add: '+', remove: '−', update: '~' } as const

export function summaryText(counts: readonly ReviewCount[]): string {
	return counts.map(item => `${SIGNS[item.kind]}${formatCount(NOUNS[item.entity] ?? NOUNS.topic, item.count)}`).join(', ')
}

const KINDS: Record<ReviewSuggestionKind, { label: string; status: KindStatus }> = {
	add: { label: UI_ROADMAP_REVIEW.KIND_ADD, status: 'success' },
	remove: { label: UI_ROADMAP_REVIEW.KIND_REMOVE, status: 'error' },
	rename: { label: UI_ROADMAP_REVIEW.KIND_RENAME, status: 'warning' },
	move: { label: UI_ROADMAP_REVIEW.KIND_MOVE, status: 'info' },
	update: { label: UI_ROADMAP_REVIEW.KIND_UPDATE, status: 'warning' },
	mixed: { label: UI_ROADMAP_REVIEW.KIND_MIXED, status: 'neutral' },
}

export function kindLabel(kind: ReviewSuggestionKind): string {
	return KINDS[kind].label
}

export function kindStatus(kind: ReviewSuggestionKind): KindStatus {
	return KINDS[kind].status
}

const FIELDS: Record<string, string> = {
	title: UI_ROADMAP_REVIEW.FIELD_TITLE,
	description: UI_ROADMAP_REVIEW.FIELD_DESCRIPTION,
	hours: UI_ROADMAP_REVIEW.FIELD_HOURS,
	kind: UI_ROADMAP_REVIEW.FIELD_KIND,
	position: UI_ROADMAP_REVIEW.FIELD_POSITION,
}

export function fieldLabel(field: string): string {
	return FIELDS[field] ?? field
}

function formatPosition(value: unknown): string {
	if (typeof value === 'number') return String(value + 1)
	const place = value as { stage?: string; index?: number }
	return typeof place.index === 'number' ? `${place.stage ?? ''} · ${place.index + 1}` : JSON.stringify(value)
}

export function formatValue(field: string, value: unknown): string {
	if (value === undefined || value === null) return '—'
	if (field === 'position') return formatPosition(value)
	return typeof value === 'object' ? JSON.stringify(value) : String(value)
}
