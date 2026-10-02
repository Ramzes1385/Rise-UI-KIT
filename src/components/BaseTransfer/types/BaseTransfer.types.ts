import type { ComputedRef, Ref } from 'vue'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { ListItem, ListItemSlotProps } from '@components/BaseList'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты оформления BaseTransfer: `default` — панели в рамке на фоне страницы, `soft` — на приподнятой подложке без рамки,
 * `outline` — в акцентной рамке, `ghost` — без рамки и подложки (внутри карточки или формы)
 */
export const TRANSFER_VARIANTS = ['default', 'soft', 'outline', 'ghost'] as const

/** Стороны: `source` — «Доступно» (строки не из v-model), `target` — «Выбрано» (строки из v-model) */
export const TRANSFER_SIDES = ['source', 'target'] as const

export type TransferVariant = (typeof TRANSFER_VARIANTS)[number]

export type TransferSide = (typeof TRANSFER_SIDES)[number]

/** Перенос строк: куда и какие */
export interface TransferChange {
	/** Куда перенесены строки: `target` — в «Выбрано», `source` — обратно в «Доступно» */
	to: TransferSide
	/** id перенесённых строк в порядке панели, из которой их перенесли */
	ids: string[]
}

export interface BaseTransferProps<T extends ListItem = ListItem> extends BaseComponentProps<
	TransferVariant,
	'root' | 'label' | 'panel' | 'header' | 'list' | 'actions' | 'error'
> {
	/** Все строки обеих панелей (`ListItem` BaseList: `id`, `title`, `description`, `icon`, `avatar`, `meta`, `isDisabled`) */
	items: T[]
	/** id строк в «Выбрано» (v-model) в их порядке; перенесённые строки встают в конец. id, которых нет в `items`, сохраняются */
	modelValue?: string[]
	/** Заголовки панелей «Доступно» и «Выбрано» (по умолчанию из словаря) */
	titles?: [string, string]
	/** Поле поиска над каждым списком */
	isSearchable?: boolean
	/** Подходит ли строка под запрос (запрос уже без пробелов по краям); по умолчанию — `title` или `description` содержат его без учёта регистра */
	filterMethod?: (item: T, query: string) => boolean
	/** Переставлять строки в «Выбрано» мышью и Alt + ↑/↓ — меняет порядок v-model */
	isSortable?: boolean
	/** Видимая подпись всего поля; без неё нужен `ariaLabel` */
	label?: string
	/** Имя поля для скринридера, если нет `label` */
	ariaLabel?: string
	/** Текст ошибки под панелями, связан с обеими через `aria-describedby` */
	error?: string
	/** Отключает отметку, перенос, поиск и перестановку */
	isDisabled?: boolean
	/** Высота списка в панели: число — px, строка — CSS-длина */
	height?: number | string
	/** Отрисовывать только видимые строки (тысячи строк) */
	isVirtual?: boolean
	/** Текст пустой панели (по умолчанию из словаря; если строки скрыл поиск — «Ничего не найдено») */
	emptyText?: string
}

/** Пропсы после `withDefaults` */
export type TransferProps<T extends ListItem = ListItem> = PropsWithDefaults<BaseTransferProps<T>, 'modelValue' | 'height'>

export interface BaseTransferEmits {
	/** Новые id в «Выбрано» после переноса или перестановки */
	(event: 'update:modelValue', value: string[]): void
	/** Строки перенесены кнопкой, клавишами или методом `transfer` */
	(event: 'change', change: TransferChange): void
}

/** Данные слота строки: как у BaseList, и сторона панели */
export interface TransferItemSlotProps<T extends ListItem = ListItem> extends ListItemSlotProps<T> {
	side: TransferSide
}

export interface BaseTransferSlots<T extends ListItem = ListItem> {
	/** Содержимое строки в обеих панелях (как слот `item` BaseList) */
	item?: (props: TransferItemSlotProps<T>) => unknown
	/** Пустая панель */
	empty?: (props: { side: TransferSide }) => unknown
}

/** Методы через `ref` */
export interface BaseTransferExpose {
	/** Перенести в панель `to` строки по id (по умолчанию — отмеченные и показанные в другой панели) */
	transfer: (to: TransferSide, ids?: string[]) => void
}

/** Состояние одной панели для шаблона (внутреннее устройство BaseTransfer) */
export interface TransferPanel<T extends ListItem = ListItem> {
	side: TransferSide
	title: string
	items: T[]
	checked: string[]
	query: string
	shownCount: number
	checkedShownCount: number
	isAllChecked: boolean
	isSomeChecked: boolean
	emptyText: string
	hint: string
}

/** Строки, поиск и отметки обеих панелей (внутреннее устройство BaseTransfer) */
export interface TransferPanelsState<T extends ListItem = ListItem> {
	sideItems: ComputedRef<Record<TransferSide, T[]>>
	search: {
		queries: Ref<Record<TransferSide, string>>
		activeQuery: (side: TransferSide) => string
		filterOf: (side: TransferSide) => ((item: T) => boolean) | undefined
		setQuery: (side: TransferSide, value: string) => void
	}
	checked: Ref<Record<TransferSide, string[]>>
	shown: (side: TransferSide) => T[]
	checkable: (side: TransferSide) => T[]
	checkedOn: (side: TransferSide) => string[]
	checkedShown: (side: TransferSide) => T[]
}
