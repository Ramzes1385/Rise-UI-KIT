import type { SearchResult } from './BaseSearch.types'

export interface BaseSearchResultsProps {
	visibleResults: SearchResult[]
	query: string
	isLoading: boolean
	sizeScale: number
	highlightedIndex: number
	classes: Record<string, string | undefined>
}

export interface BaseSearchResultsEmits {
	(event: 'select', item: SearchResult): void
	(event: 'highlight', index: number): void
}
