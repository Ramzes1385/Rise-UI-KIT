import type { Ref, ShallowRef } from 'vue'
import type { UiProp } from '@composables/base/useUi'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты оформления карточек виджетов:
 * default — карточка с рамкой и фоном, soft — мягкий фон без рамки, outline — прозрачная карточка с выраженной рамкой.
 */
export const DASHBOARD_GRID_VARIANTS = ['default', 'soft', 'outline'] as const

export type DashboardGridVariant = (typeof DASHBOARD_GRID_VARIANTS)[number]

/** Брейкпоинты по ширине самой сетки (не окна): sm — узкая, md — средняя, lg — широкая */
export const DASHBOARD_BREAKPOINTS = ['sm', 'md', 'lg'] as const

export type DashboardBreakpoint = (typeof DASHBOARD_BREAKPOINTS)[number]

/** Уплотнение: vertical — виджеты поднимаются вверх до упора, none — остаются там, где положены (столкновения всё равно разрешаются) */
export const DASHBOARD_COMPACT_TYPES = ['vertical', 'none'] as const

export type DashboardCompactType = (typeof DASHBOARD_COMPACT_TYPES)[number]

/** Что изменил пользователь: move — положение, resize — размер */
export type DashboardChangeAction = 'move' | 'resize'

/**
 * Части сетки для пропа `ui` (БЭМ-элементы `.base-dashboard-grid__<часть>`, `root` — сама сетка):
 * item — карточка виджета, body — содержимое карточки, handle — ручка перетаскивания, resize — уголок изменения размера,
 * placeholder — «призрак» места, empty — пустое состояние, status — скрытое объявление для скринридера, hint — скрытая подсказка.
 */
export const DASHBOARD_GRID_PARTS = ['item', 'body', 'handle', 'resize', 'placeholder', 'empty', 'status', 'hint'] as const

export type BaseDashboardGridPart = (typeof DASHBOARD_GRID_PARTS)[number]

/** Виджет в раскладке: клетка (x, y), размер в клетках (w, h) и ограничения */
export interface DashboardLayoutItem {
	/** Уникальный идентификатор виджета (приходит в слот `item`) */
	id: string
	/** Колонка левого края, с нуля */
	x: number
	/** Строка верхнего края, с нуля */
	y: number
	/** Ширина в колонках (минимум 1) */
	w: number
	/** Высота в строках (минимум 1) */
	h: number
	/** Минимальная ширина в колонках (по умолчанию 1) */
	minW?: number
	/** Минимальная высота в строках (по умолчанию 1) */
	minH?: number
	/** Максимальная ширина в колонках */
	maxW?: number
	/** Максимальная высота в строках */
	maxH?: number
	/** Закреплённый виджет: его нельзя ни двигать, ни менять в размере, остальные его обходят */
	isStatic?: boolean
	/** Название виджета: доступное имя карточки и текст объявлений; по умолчанию «Виджет N» из словаря */
	label?: string
}

/** Список виджетов раскладки */
export type DashboardLayout = DashboardLayoutItem[]

/** Правила раскладки: число колонок и уплотнение */
export interface DashboardLayoutRules {
	cols: number
	compactType: DashboardCompactType
}

/** Раскладки по брейкпоинтам: у каждого брейкпоинта свой список виджетов */
export type DashboardLayouts = Partial<Record<DashboardBreakpoint, DashboardLayoutItem[]>>

/** Ширина сетки в px, начиная с которой действует брейкпоинт */
export type DashboardBreakpoints = Record<DashboardBreakpoint, number>

/** Число колонок по брейкпоинтам; у не указанных — значение `lg`, а без него 12 */
export type DashboardColumns = Partial<Record<DashboardBreakpoint, number>>

/** Описание изменения для события `change` */
export interface DashboardGridChange {
	/** Новая раскладка текущего брейкпоинта */
	layout: DashboardLayoutItem[]
	/** Все раскладки с обновлённой текущей (только если задан проп `layouts`) */
	layouts?: DashboardLayouts
	/** Брейкпоинт, в котором сделано изменение */
	breakpoint: DashboardBreakpoint
	/** Идентификатор изменённого виджета */
	id: string
	/** Что изменилось: положение или размер */
	action: DashboardChangeAction
}

export interface BaseDashboardGridProps extends BaseComponentProps<
	DashboardGridVariant,
	'root' | 'item' | 'body' | 'handle' | 'resize' | 'placeholder' | 'empty' | 'status' | 'hint'
> {
	/** Раскладка (`v-model:layout`): виджеты с клетками. Некорректную раскладку (выход за сетку, пересечения) сетка исправляет на экране, но сама не отправляет */
	layout?: DashboardLayoutItem[]
	/**
	 * Раскладки по брейкпоинтам (`v-model:layouts`). С ним сетка выбирает раскладку по своей ширине (`breakpoints`),
	 * а для брейкпоинта без раскладки берёт ближайшую шире и подгоняет под число колонок. Тогда `layout` не используется.
	 */
	layouts?: DashboardLayouts
	/** Число колонок: число или по брейкпоинтам (по брейкпоинтам работает только вместе с `layouts`, иначе берётся значение `lg`) */
	cols?: number | DashboardColumns
	/** Высота одной строки в px при sizeScale = 100 */
	rowHeight?: number
	/** Промежуток между виджетами в px при sizeScale = 100 */
	gap?: number
	/** Ширина сетки, с которой начинается брейкпоинт: по умолчанию `sm` 0, `md` 640, `lg` 1024 */
	breakpoints?: Partial<DashboardBreakpoints>
	/** Уплотнение: `vertical` поднимает виджеты вверх, `none` оставляет на месте */
	compactType?: DashboardCompactType
	/** Режим редактирования: виджеты можно переносить, менять в размере и двигать с клавиатуры */
	isEditable?: boolean
	/** Отключает сетку целиком: перетаскивание и клавиатурный режим выключены, виджеты не получают фокус */
	isDisabled?: boolean
	/** Доступное имя сетки (`aria-label`); по умолчанию — «Сетка виджетов» из словаря */
	label?: string
	/**
	 * Классы частей сетки (`root`, `item`, `body`, `handle`, `resize`, `placeholder`, `empty`, `status`, `hint`) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseDashboardGrid: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseDashboardGrid :layout="layout" :ui="{ item: 'my-widget' }" />
	 */
	ui?: UiProp<BaseDashboardGridPart>
}

export interface BaseDashboardGridEmits {
	/** Новая раскладка после переноса или изменения размера (`v-model:layout`) */
	(event: 'update:layout', value: DashboardLayoutItem[]): void
	/** Раскладки по брейкпоинтам с обновлённой текущей (`v-model:layouts`) */
	(event: 'update:layouts', value: DashboardLayouts): void
	/** Пользователь завершил перенос или изменение размера: что изменилось и итоговая раскладка */
	(event: 'change', value: DashboardGridChange): void
}

export interface BaseDashboardGridSlots {
	/** Содержимое виджета; по умолчанию — его название (`label` или `id`) */
	item?: (props: { item: DashboardLayoutItem; isDragging: boolean; isGrabbed: boolean }) => unknown
	/** Содержимое ручки перетаскивания вместо значка «grip» */
	handle?: (props: { item: DashboardLayoutItem }) => unknown
	/** Пустое состояние вместо стандартного, когда виджетов нет */
	empty?: () => unknown
}

export type DashboardGridProps = PropsWithDefaults<
	BaseDashboardGridProps,
	'cols' | 'rowHeight' | 'gap' | 'compactType' | 'isEditable' | 'isDisabled' | 'sizeScale'
>

/** Размеры сетки в px: число колонок, ширина колонки, высота строки и промежуток */
export interface DashboardMetrics {
	cols: number
	colWidth: number
	rowHeight: number
	gap: number
}

/** Прямоугольник виджета в px внутри сетки */
export interface DashboardRect {
	left: number
	top: number
	width: number
	height: number
}

/** Идущее перетаскивание указателем: что тащат, за что, откуда и исходная раскладка */
export interface DashboardPointerDrag {
	id: string
	mode: DashboardChangeAction
	pointerId: number
	startX: number
	startY: number
	origin: DashboardLayoutItem
	base: DashboardLayoutItem[]
}

/** Положение перетаскиваемого виджета под указателем, в px */
export interface DashboardDragRect {
	id: string
	rect: DashboardRect
}

/** Объявления клавиатурного режима: ключи раздела словаря `dashboardGrid` */
export type DashboardAnnouncement = 'PICKED' | 'MOVED' | 'DROPPED' | 'CANCELLED'

/** Общее состояние сетки для перетаскивания и клавиатуры */
export interface DashboardGridState {
	rootRef: Ref<HTMLElement | null>
	layout: ShallowRef<DashboardLayoutItem[]>
	draft: ShallowRef<DashboardLayoutItem[] | null>
	metrics: Readonly<Ref<DashboardMetrics>>
	isInteractive: Readonly<Ref<boolean>>
	rules: () => DashboardLayoutRules
	announce: (message: DashboardAnnouncement, item: DashboardLayoutItem) => void
	commit: (layout: DashboardLayoutItem[], id: string, action: DashboardChangeAction) => void
}
