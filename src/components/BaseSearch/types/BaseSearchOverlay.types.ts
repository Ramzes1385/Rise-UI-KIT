import type { UiClassFn } from '@composables/base/useUi'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'
import type { BaseSearchPart, SearchResult, SearchVariant } from './BaseSearch.types'

export interface BaseSearchOverlayProps extends BaseComponentProps<SearchVariant, 'root'> {
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
	/** Текст пустого состояния (ошибка источника или «Ничего не найдено») */
	emptyText?: string
	visibleResults: SearchResult[]
	highlightedIndex: number
	shouldShowResults: boolean
	classes: Record<string, string | undefined>
	/** id списка результатов (listbox) */
	listboxId?: string
	/** ARIA-атрибуты поля как combobox */
	comboboxAttributes?: Record<string, string | undefined>
	/** Статус для скринридера: сколько найдено */
	resultsStatus?: string
	/** Классы частей поиска (`ui` компонента BaseSearch) */
	ui: UiClassFn<BaseSearchPart>
}

export interface BaseSearchOverlayEmits {
	'update:modelValue': [value: string]
	keydown: [event: KeyboardEvent]
	clear: []
	select: [item: SearchResult]
	highlight: [index: number]
	close: []
}

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
