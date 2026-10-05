import type { ComputedRef } from 'vue'
import type { UiProp } from '@composables/base/useUi'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { SortableMove } from '@composables/interaction/useSortable'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты оформления BaseList: `default` — строки в рамке на фоне страницы, `soft` — на приподнятой подложке без рамки,
 * `outline` — в акцентной рамке, `ghost` — без рамки и подложки (список внутри карточки или панели)
 */
export const LIST_VARIANTS = ['default', 'soft', 'outline', 'ghost'] as const

/**
 * Режим выбора: `none` — обычный список (`role="list"`), строки можно открывать и в них можно класть кнопки;
 * `single` и `multiple` — список выбора по APG Listbox (`role="listbox"`, у строк `role="option"`)
 */
export const LIST_SELECTION_MODES = ['none', 'single', 'multiple'] as const

/**
 * Части списка для пропа `ui` (БЭМ-элементы `.base-list__<часть>`, `root` — корень): label — видимая подпись;
 * viewport — область прокрутки в рамке; list — сам `<ul>`; item — строка; grip — значок «перетащить»; prefix — значок
 * или аватар слева; text — колонка текста; title — текст строки; description — описание; meta — подпись справа;
 * check — галочка выбранной строки; actions — кнопки действий; empty — пустой список; error — текст ошибки;
 * ghost — перетаскиваемая копия строки (телепортируется в `body`).
 */
export const LIST_PARTS = [
	'label',
	'viewport',
	'list',
	'item',
	'grip',
	'prefix',
	'text',
	'title',
	'description',
	'meta',
	'check',
	'actions',
	'empty',
	'error',
	'ghost',
] as const

export type BaseListPart = (typeof LIST_PARTS)[number]

export type ListVariant = (typeof LIST_VARIANTS)[number]

export type ListSelectionMode = (typeof LIST_SELECTION_MODES)[number]

/** Строка списка. Свои поля приложения сохраняются: компонент обобщённый (`generic`) */
export interface ListItem {
	/** Уникальный id строки */
	id: string
	/** Текст строки; по нему же — переход по первым буквам с клавиатуры */
	title: string
	/** Описание под текстом */
	description?: string
	/** Имя значка BaseIcon слева */
	icon?: string
	/** Адрес аватара слева (BaseAvatar; без картинки — инициалы из `title`) */
	avatar?: string
	/** Короткий текст справа: время, счётчик */
	meta?: string
	/** Строку нельзя выбрать и открыть (в перестановке участвует) */
	isDisabled?: boolean
}

/** Перестановка строки: какая и с какого места на какое (индексы — в полном списке `items`) */
export interface ListMove<T extends ListItem = ListItem> {
	item: T
	from: number
	to: number
}

/** Значение v-model: id выбранной строки (`single`) или массив id (`multiple`) */
export type ListModelValue = string | string[] | null

export interface BaseListProps<T extends ListItem = ListItem> extends BaseComponentProps<
	ListVariant,
	'root' | 'label' | 'list' | 'item' | 'error'
> {
	/** Строки списка */
	items: T[]
	/** Выбранное: id (`single`), массив id (`multiple`); в режиме `none` не используется */
	modelValue?: ListModelValue
	/** Режим выбора (по умолчанию `none`) */
	selectionMode?: ListSelectionMode
	/**
	 * Перестановка строк мышью (за строку) и с клавиатуры: в режиме `none` пробел берёт строку, стрелки двигают,
	 * пробел или Enter кладут, Escape отменяет; в любом режиме Alt + ↑/↓ сдвигают строку сразу. Новое место объявляется.
	 * Новый порядок — в `update:items` и событии `move`
	 */
	isSortable?: boolean
	/** Можно ли положить строку на новое место; `false` — строка вернётся, скринридер услышит отказ */
	canMove?: (move: ListMove<T>) => boolean
	/** Какие строки показывать (поиск в BaseTransfer и приложении); скрытые строки сохраняют своё место при перестановке */
	filter?: (item: T) => boolean
	/** Видимая подпись списка; без неё нужен `ariaLabel` */
	label?: string
	/** Имя списка для скринридера, если нет `label` */
	ariaLabel?: string
	/** Текст ошибки под списком, связан через `aria-describedby` */
	error?: string
	/** Отключает выбор, открытие и перестановку */
	isDisabled?: boolean
	/** Отрисовывать только видимые строки (тысячи строк); высота области — `height` */
	isVirtual?: boolean
	/** Высота строки до замера, px (для `isVirtual`; разная высота допустима — строки замеряются) */
	itemSize?: number
	/** Высота области прокрутки: число — px, строка — CSS-длина. По умолчанию — по содержимому, при `isVirtual` — 360 px */
	height?: number | string
	/** Строк сверх видимых сверху и снизу при `isVirtual` */
	overscan?: number
	/** Текст пустого списка (по умолчанию из словаря) */
	emptyText?: string
	/**
	 * Классы частей списка (`root`, `viewport`, `item`, `title`, `ghost`…) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseList: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseList :items="items" aria-label="Разделы" :ui="{ viewport: 'shadow-sm', title: 'font-semibold' }" />
	 */
	ui?: UiProp<BaseListPart>
}

/** Пропсы после `withDefaults` */
export type ListProps<T extends ListItem = ListItem> = PropsWithDefaults<BaseListProps<T>, 'selectionMode' | 'itemSize' | 'overscan'>

export interface BaseListEmits<T extends ListItem = ListItem> {
	/** Новое выбранное: id, массив id или `null` */
	(event: 'update:modelValue', value: ListModelValue): void
	/** Новый порядок строк после перестановки */
	(event: 'update:items', items: T[]): void
	/** Строка переставлена: откуда и куда */
	(event: 'move', move: ListMove<T>): void
	/** Строка открыта: клик или Enter в режиме `none` */
	(event: 'activate', item: T): void
}

/** Данные слотов строки */
export interface ListItemSlotProps<T extends ListItem = ListItem> {
	item: T
	/** Индекс среди показанных строк */
	index: number
	/** Строка выбрана */
	isSelected: boolean
	/** Строку сейчас переносят */
	isDragging: boolean
}

export interface BaseListSlots<T extends ListItem = ListItem> {
	/** Всё содержимое строки вместо значка, текста, описания и `meta` */
	item?: (props: ListItemSlotProps<T>) => unknown
	/** Левая часть строки вместо значка или аватара */
	prefix?: (props: ListItemSlotProps<T>) => unknown
	/** Кнопки действий справа. Только в режиме `none`: у `option` не может быть интерактивного содержимого (APG Listbox) */
	actions?: (props: ListItemSlotProps<T>) => unknown
	/** Пустой список */
	empty?: () => unknown
}

/** Методы через `ref` — точки расширения для BaseTransfer и приложений */
export interface BaseListExpose {
	/** Перевести фокус на строку (и прокрутить к ней) */
	focusItem: (id: string) => void
	/** Выбрать все доступные показанные строки (`multiple`) */
	selectAll: () => void
	/** Снять выбор */
	clearSelection: () => void
	/** Переставить строку на место `index` в полном списке — для своих кнопок «Выше» и «Ниже» */
	moveItem: (id: string, index: number) => void
}

/** Строка для отрисовки: элемент, его индекс среди показанных, ключ и положение при `isVirtual` */
export interface ListRow<T extends ListItem = ListItem> {
	item: T
	index: number
	start?: number
}

/** Объявление для скринридера при перестановке: ключ строки из словаря `list` */
export type ListAnnouncement = 'PICKED' | 'MOVED' | 'DROPPED' | 'CANCELLED' | 'BLOCKED'

/** Зависимости клавиатуры списка (внутреннее устройство BaseList) */
export interface ListKeyboardDeps<T extends ListItem = ListItem> {
	shown: ComputedRef<readonly T[]>
	emit: BaseListEmits<T>
	focus: { focusItem: (id: string) => void; typeahead: (key: string) => void }
	selection: { toggle: (item: T) => void; selectRange: (item: T) => void; selectBetween: (from: T, to: T) => void; toggleAll: () => void }
	sortable: { grab: (item: T) => void; handleGrabbedKeydown: (event: KeyboardEvent) => boolean }
	order: { preview: (id: string, index: number) => void; finish: (move: SortableMove<number>, done: () => void) => void }
}
