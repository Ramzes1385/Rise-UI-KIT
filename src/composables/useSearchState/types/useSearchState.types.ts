import type { SearchMode, SearchResult } from '@components/BaseSearch/types/BaseSearch.types'

export interface UseSearchStateOptions {
	modelValue: () => string
	mode: () => SearchMode
	results: () => SearchResult[]
	/** Результаты уже отфильтрованы сервером — не фильтровать их по подстроке на клиенте */
	isRemote?: () => boolean
	isInstant: () => boolean
	debounceMs: () => number
	maxResults: () => number
	isAutofocus: () => boolean
	emit: {
		search: (query: string) => void
		select: (item: SearchResult) => void
		updateModelValue: (value: string) => void
		clear: () => void
	}
	focusActiveInput: () => void
	closeOverlay: () => void
}
