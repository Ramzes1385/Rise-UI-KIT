import type { FlowSuggestionStatus, ReviewSuggestion } from '../../../types/data/flowReview.types'
import type {
	ReviewAdapter,
	ReviewChangeInfo,
	ReviewCount,
	ReviewDescriber,
	ReviewFilter,
	ReviewStaleContext,
	ReviewStatusCounts,
	ReviewSuggestionKind,
	ReviewSuggestionView,
} from '../../../types/internal/review/reviewCore.types'

export function toTimestamp(date: Date | string | number): number {
	if (date instanceof Date) return date.getTime()
	return typeof date === 'number' ? date : Date.parse(date)
}

export function describeChanges<C>(changes: readonly C[], adapter: ReviewDescriber<C>): ReviewChangeInfo[] {
	return changes.map(change => adapter.describe(change)).filter((info): info is ReviewChangeInfo => info !== null)
}

function classifySuggestion(infos: readonly ReviewChangeInfo[]): ReviewSuggestionKind {
	const kinds = new Set(infos.map(info => info.kind))
	if (kinds.size === 1) return infos[0].kind
	return 'mixed'
}

export function summarizeChanges(infos: readonly ReviewChangeInfo[]): ReviewCount[] {
	const counts = new Map<string, ReviewCount>()
	const touched = new Set<string>()
	for (const info of infos) {
		const kind = info.kind === 'add' || info.kind === 'remove' ? info.kind : 'update'
		const key = `${kind}:${info.entity}`
		if (kind === 'update' && touched.has(`${info.entity}:${info.id}`)) continue
		if (kind === 'update') touched.add(`${info.entity}:${info.id}`)
		const known = counts.get(key)
		counts.set(key, { kind, entity: info.entity, count: (known?.count ?? 0) + 1 })
	}
	return [...counts.values()]
}

function isConflicting<C, D>(changes: readonly C[], data: D, adapter: ReviewAdapter<C, D>): boolean {
	const check = adapter.isApplicable
	return check ? changes.some(change => !check(data, change)) : false
}

function isSuggestionStale<C, D>(suggestion: ReviewSuggestion<C>, context: ReviewStaleContext<D>, adapter: ReviewAdapter<C, D>): boolean {
	if (suggestion.status !== 'open') return false
	const { baseVersion } = suggestion
	if (baseVersion !== undefined && context.versionId !== undefined && baseVersion !== context.versionId) return true
	return isConflicting(suggestion.changes, context.data, adapter)
}

export function createSuggestionView<C, D>(
	suggestion: ReviewSuggestion<C>,
	context: ReviewStaleContext<D>,
	adapter: ReviewAdapter<C, D>,
): ReviewSuggestionView<C> {
	const infos = describeChanges(suggestion.changes, adapter)
	return {
		suggestion,
		kind: classifySuggestion(infos),
		counts: summarizeChanges(infos),
		isStale: isSuggestionStale(suggestion, context, adapter),
		time: toTimestamp(suggestion.date),
	}
}

export function sortSuggestions<C>(list: readonly ReviewSuggestion<C>[]): ReviewSuggestion<C>[] {
	return [...list].sort((first, second) => toTimestamp(second.date) - toTimestamp(first.date))
}

function isShown<C>(item: ReviewSuggestion<C>, filter: ReviewFilter): boolean {
	if (filter.hiddenAuthors?.has(item.author.name)) return false
	if (filter.show === 'mine' && item.author.name !== filter.currentUser) return false
	if (item.status === 'open') return true
	return filter.show !== 'open' && filter.isDoneShown !== false
}

export function filterSuggestions<C>(list: readonly ReviewSuggestion<C>[], filter: ReviewFilter): ReviewSuggestion<C>[] {
	return list.filter(item => isShown(item, filter))
}

export function countSuggestions<C>(list: readonly ReviewSuggestion<C>[]): ReviewStatusCounts {
	const counts: ReviewStatusCounts = { open: 0, accepted: 0, declined: 0 }
	for (const item of list) counts[item.status as FlowSuggestionStatus] += 1
	return counts
}

export function suggestionAuthors<C>(list: readonly ReviewSuggestion<C>[]): ReviewSuggestion<C>['author'][] {
	const authors = new Map<string, ReviewSuggestion<C>['author']>()
	for (const item of list) if (!authors.has(item.author.name)) authors.set(item.author.name, item.author)
	return [...authors.values()]
}

export function initialsOf(name: string): string {
	const parts = name.trim().split(/\s+/).filter(Boolean)
	if (parts.length === 0) return ''
	return parts
		.slice(0, 2)
		.map(part => part.charAt(0).toUpperCase())
		.join('')
}

function findRoot(parents: Map<string, string>, id: string): string {
	let root = id
	while (parents.get(root) !== root) root = parents.get(root) as string
	return root
}

export function groupChanges<C>(changes: readonly C[], adapter: ReviewDescriber<C>): C[][] {
	const infos = changes.map(change => adapter.describe(change))
	const parents = new Map<string, string>()
	for (const info of infos) if (info) parents.set(info.id, info.id)
	for (const info of infos) {
		for (const ref of info?.refs ?? []) {
			if (info && parents.has(ref)) parents.set(findRoot(parents, ref), findRoot(parents, info.id))
		}
	}
	const groups = new Map<string, C[]>()
	changes.forEach((change, index) => {
		const info = infos[index]
		const key = info ? findRoot(parents, info.id) : '\u0000root'
		groups.set(key, [...(groups.get(key) ?? []), change])
	})
	return [...groups.values()]
}
