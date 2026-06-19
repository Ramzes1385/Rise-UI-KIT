import type { BaseComponentProps } from '@/types/base.types'

/** Варианты отображения поиска */
export const SEARCH_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft', 'filled', 'underline'] as const

/**
 * Вариант отображения
 */
export type SearchVariant = (typeof SEARCH_VARIANTS)[number]

/**
 * Режим отображения поиска
 */
export type SearchMode = 'default' | 'modal' | 'sidebar'

/**
 * Элемент результата поиска
 */
export interface SearchResult {
	/** Идентификатор */
	id: string | number
	/** Заголовок */
	title: string
	/** Описание */
	description?: string
	/** Иконка */
	icon?: string
	/** URL изображения */
	image?: string
	/** Категория */
	category?: string
}

/**
 * Пропсы компонента BaseSearch
 */
export interface BaseSearchProps extends BaseComponentProps<SearchVariant> {
	/** Значение */
	modelValue?: string
	/** Плейсхолдер */
	placeholder?: string
	/** Режим отображения */
	mode?: SearchMode
	/** Результаты поиска */
	results?: SearchResult[]
	/** Автопоиск при вводе */
	isInstant?: boolean
	/** Задержка автопоиска (мс) */
	debounceMs?: number
	/** Загрузка */
	isLoading?: boolean
	/** Показывать кнопку очистки */
	hasClear?: boolean
	/** Показывать иконку поиска */
	hasIcon?: boolean
	/** Максимальное количество результатов */
	maxResults?: number
	/** Автофокус */
	isAutofocus?: boolean
	/** Отключено */
	isDisabled?: boolean
	/** Текст ошибки */
	error?: string
}

/**
 * События компонента BaseSearch
 */
export interface BaseSearchEmits {
	(event: 'update:modelValue', value: string): void
	(event: 'search', query: string): void
	(event: 'select', result: SearchResult): void
	(event: 'clear'): void
}

/**
 * Слоты компонента BaseSearch
 */
export interface BaseSearchSlots {
	/** Кастомный элемент результата */
	result?: (props: { item: SearchResult; index: number }) => unknown
	/** Полная замена списка результатов */
	results?: (props: { results: SearchResult[]; query: string; isLoading: boolean }) => unknown
	/** Контент перед списком результатов */
	resultBefore?: (props: { results: SearchResult[]; query: string }) => unknown
	/** Контент после списка результатов */
	resultAfter?: (props: { results: SearchResult[]; query: string }) => unknown
	/** Пустой результат */
	empty?: () => unknown
	/** Состояние загрузки */
	loading?: () => unknown
}
