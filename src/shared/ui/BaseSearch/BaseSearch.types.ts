/**
 * Вариант поля поиска
 */
export type SearchVariant = 'outline' | 'filled' | 'underline'

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
	/** Категория */
	category?: string
}

/**
 * Пропсы компонента BaseSearch
 */
export interface BaseSearchProps {
	/** Значение */
	modelValue?: string
	/** Плейсхолдер */
	placeholder?: string
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
	/** Вариант */
	variant?: SearchVariant
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
	default?: () => unknown
	result?: (props: { item: SearchResult; index: number }) => unknown
	empty?: () => unknown
	loading?: () => unknown
}
