import type { BaseComponentProps } from '../../../types/base.types'
import type { SearchResult, SearchVariant } from './BaseSearch.types'

export interface BaseSearchOverlayProps extends BaseComponentProps<SearchVariant> {
	panel: 'modal' | 'sidebar'
	modelValue: string
	searchPlaceholder: string
	triggerPlaceholder: string
	variant: SearchVariant
	sizeScale: number
	isDisabled: boolean
	error: string
	hasIcon: boolean
	hasClear: boolean
	isLoading: boolean
	visibleResults: SearchResult[]
	highlightedIndex: number
	shouldShowResults: boolean
	classes: Record<string, string | undefined>
}

export interface BaseSearchOverlayEmits {
	'update:modelValue': [value: string]
	keydown: [event: KeyboardEvent]
	clear: []
	select: [item: SearchResult]
	highlight: [index: number]
	close: []
}

/**
 * Публичный контракт BaseSearchOverlay (defineExpose)
 */
export interface BaseSearchOverlayExpose {
	/** Устанавливает фокус на поле ввода оверлея */
	focus: () => void
	/** Открывает оверлей */
	open: () => void
	/** Закрывает оверлей */
	close: () => void
}

/** Слоты компонента BaseSearchOverlay (пробрасываются в BaseSearchResults) */
export interface BaseSearchOverlaySlots {
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
