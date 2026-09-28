import type { SearchResult } from './BaseSearch.types'

export interface BaseSearchResultsProps {
	visibleResults: SearchResult[]
	query: string
	isLoading: boolean
	sizeScale: number
	highlightedIndex: number
	classes: Record<string, string | undefined>
	/** id списка результатов: на него ссылаются aria-controls поля и id опций (aria-activedescendant) */
	listboxId?: string
	/** Имя списка результатов для скринридера */
	listboxLabel?: string
}

export interface BaseSearchResultsEmits {
	(event: 'select', item: SearchResult): void
	(event: 'highlight', index: number): void
}

/** Слоты компонента BaseSearchResults */
export interface BaseSearchResultsSlots {
	/** Кастомный рендер всего списка результатов */
	results?: (props: { results: SearchResult[]; query: string; isLoading: boolean }) => unknown
	/** Индикатор загрузки */
	loading?: () => unknown
	/** Контент перед списком результатов */
	'result-before'?: (props: { results: SearchResult[]; query: string }) => unknown
	/** Кастомный рендер одного результата */
	result?: (props: { item: SearchResult; index: number }) => unknown
	/** Контент при отсутствии результатов */
	empty?: () => unknown
	/** Контент после списка результатов */
	'result-after'?: (props: { results: SearchResult[]; query: string }) => unknown
}

/** Часть текста результата: совпадение с запросом (выделяется <mark>) или обычный текст */
export interface TextPart {
	text: string
	isMatch: boolean
}
