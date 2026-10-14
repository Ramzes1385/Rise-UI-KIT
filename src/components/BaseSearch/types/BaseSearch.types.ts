import type { UiProp } from '@composables/base/useUi'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

export const SEARCH_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft', 'filled', 'underline'] as const

export type SearchVariant = (typeof SEARCH_VARIANTS)[number]

export type SearchMode = 'default' | 'modal' | 'sidebar'

/**
 * Части поиска для пропа `ui` (БЭМ-элементы `.base-search__<часть>`, `root` — обёртка компонента): trigger — поле на
 * странице, field — поле ввода (BaseInput), icon — значок поиска, actions — правая группа поля, loading — индикатор
 * загрузки, clear — кнопка очистки, live — скрытый статус для экранного диктора, panel — выпадающая панель результатов
 * (режим `default`), modal-overlay, modal, modal-header, modal-close, modal-results — подложка, окно, шапка, кнопка
 * закрытия и область результатов режима `modal`; sidebar-overlay, sidebar, sidebar-header, sidebar-close,
 * sidebar-results — то же для режима `sidebar`; status — строка «Загрузка…», listbox — список результатов,
 * result — пункт, result-image, result-icon, result-content, result-title, result-desc, result-category — части
 * пункта, match — совпадение с запросом, empty — «Ничего не найдено».
 */
export const SEARCH_PARTS = [
	'trigger',
	'field',
	'icon',
	'actions',
	'loading',
	'clear',
	'live',
	'panel',
	'modal-overlay',
	'modal',
	'modal-header',
	'modal-close',
	'modal-results',
	'sidebar-overlay',
	'sidebar',
	'sidebar-header',
	'sidebar-close',
	'sidebar-results',
	'status',
	'listbox',
	'result',
	'result-image',
	'result-icon',
	'result-content',
	'result-title',
	'result-desc',
	'result-category',
	'match',
	'empty',
] as const

export type BaseSearchPart = (typeof SEARCH_PARTS)[number]

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
 * Асинхронный источник результатов (`source`): получает запрос и сигнал отмены, возвращает найденное.
 * Ответ на устаревший запрос отбрасывается, `signal` отменяется, когда запрос заменён новым или поле очищено
 */
export type SearchSource = (query: string, context: { signal: AbortSignal }) => Promise<SearchResult[]>

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
	/**
	 * Асинхронный источник результатов вместо `results` (`(query, { signal }) => Promise<SearchResult[]>`). Вызывается
	 * там же, где приходит событие `search` (после паузы `debounceMs` при `isInstant`, по Enter без него). Защита от гонок:
	 * новый запрос отменяет прежний (`signal`), а ответ, пришедший позже ответа на более новый запрос, не показывается.
	 * Пока запрос идёт, поиск в состоянии загрузки; ошибка источника очищает список. Результаты показываются как при `isRemote`
	 * (без фильтрации по подстроке). Событие `search` по-прежнему приходит
	 */
	source?: SearchSource
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
	/**
	 * Классы частей поиска (`root`, `field`, `panel`, `modal`, `result`, `empty`… — см. `SEARCH_PARTS`) — добавляются
	 * к классам кита. Глобально — `defaults.BaseSearch.ui` плагина, классы склеиваются. Рамку и фон поля задают токены
	 * `--rise-input-*` и `ui` у BaseInput.
	 *
	 * @example
	 * <BaseSearch :ui="{ panel: 'shadow-xl', result: 'rounded-lg' }" />
	 */
	ui?: UiProp<BaseSearchPart>
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
