import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

export const SEARCH_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft', 'filled', 'underline'] as const

export type SearchVariant = (typeof SEARCH_VARIANTS)[number]

export type SearchMode = 'default' | 'modal' | 'sidebar'

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

export interface BaseSearchProps extends BaseComponentProps<
	SearchVariant,
	| 'root'
	| 'trigger'
	| 'icon'
	| 'modalOverlay'
	| 'modal'
	| 'modalHeader'
	| 'modalInput'
	| 'clear'
	| 'clearIcon'
	| 'loading'
	| 'modalClose'
	| 'modalCloseIcon'
	| 'modalResults'
	| 'result'
	| 'resultImage'
	| 'resultIcon'
	| 'resultContent'
	| 'resultTitle'
	| 'resultDesc'
	| 'resultCategory'
	| 'empty'
	| 'emptyText'
	| 'sidebarOverlay'
	| 'sidebar'
	| 'sidebarHeader'
	| 'sidebarInput'
	| 'sidebarClose'
	| 'sidebarCloseIcon'
	| 'sidebarResults'
	| 'dropdown'
	| 'input'
> {
	/** Значение */
	modelValue?: string
	/** Плейсхолдер */
	placeholder?: string
	/** Режим отображения */
	mode?: SearchMode
	/** Результаты поиска */
	results?: SearchResult[]
	/**
	 * Удалённый поиск: results уже отфильтрованы сервером (транслит, опечатки, поиск по другим полям)
	 * и показываются как есть — без клиентской фильтрации по подстроке (maxResults применяется)
	 */
	isRemote?: boolean
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

export interface BaseSearchEmits {
	(event: 'update:modelValue', value: string): void
	(event: 'search', query: string): void
	(event: 'select', result: SearchResult): void
	(event: 'clear'): void
}

export interface BaseSearchSlots {
	/** Кастомный элемент результата */
	result?: (props: { item: SearchResult; index: number }) => unknown
	/** Полная замена списка результатов */
	results?: (props: { results: SearchResult[]; query: string; isLoading: boolean }) => unknown
	/** Контент перед списком результатов */
	'result-before'?: (props: { results: SearchResult[]; query: string }) => unknown
	/** Контент после списка результатов */
	'result-after'?: (props: { results: SearchResult[]; query: string }) => unknown
	/** Пустой результат */
	empty?: () => unknown
	/** Состояние загрузки */
	loading?: () => unknown
}

export type SearchProps = PropsWithDefaults<
	BaseSearchProps,
	'modelValue' | 'mode' | 'results' | 'isRemote' | 'isInstant' | 'debounceMs' | 'maxResults' | 'isAutofocus'
>
