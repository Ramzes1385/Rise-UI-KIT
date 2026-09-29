import type { ComputedRef, Ref, ShallowRef } from 'vue'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты оформления BaseKanban: `default` — колонки на приглушённой подложке, `soft` — на приподнятой,
 * `outline` — колонки в рамке без фона, `ghost` — без подложки колонок
 */
export const KANBAN_VARIANTS = ['default', 'soft', 'outline', 'ghost'] as const

/** Колонка доски; `limit` — сколько карточек в работе допустимо (WIP-лимит), сверх него счётчик подсвечивается */
export interface KanbanColumn {
	id: string
	title: string
	limit?: number
}

/** Карточка: `columnId` — колонка, порядок в колонке — порядок в массиве `cards` */
export interface KanbanCard {
	id: string
	columnId: string
	title: string
	description?: string
	tags?: string[]
}

/** Место карточки: колонка и позиция в ней с нуля */
export interface KanbanPlace {
	columnId: string
	index: number
}

/** Перемещение карточки: откуда и куда */
export interface KanbanMove {
	card: KanbanCard
	from: KanbanPlace
	to: KanbanPlace
}

/** Перетаскивание мышью: карточка, точка захвата внутри неё и размер для «призрака» под курсором */
export interface KanbanPointerDrag {
	card: KanbanCard
	x: number
	y: number
	offsetX: number
	offsetY: number
	width: number
}

/** Объявление для скринридера при перемещении с клавиатуры: ключ строки из словаря `kanban` */
export type KanbanAnnouncement = 'PICKED' | 'MOVED' | 'DROPPED' | 'CANCELLED' | 'BLOCKED'

/** Колонка для разметки: карточки колонки, счётчик и доступное имя списка */
export interface KanbanColumnView {
	column: KanbanColumn
	cards: KanbanCard[]
	count: string
	label: string
	isOverLimit: boolean
}

/**
 * Пропсы компонента BaseKanban
 */
export interface BaseKanbanProps extends BaseComponentProps<(typeof KANBAN_VARIANTS)[number], 'root' | 'column' | 'card'> {
	/** Колонки слева направо */
	columns: readonly KanbanColumn[]
	/** Карточки (`v-model:cards`): после перемещения приходит новый массив */
	cards?: readonly KanbanCard[]
	/** Запрет перемещения: вернуть false, чтобы карточку нельзя было положить в это место */
	canMove?: (move: KanbanMove) => boolean
	/** Только просмотр: карточки не перетаскиваются и не открываются */
	isDisabled?: boolean
}

/**
 * События компонента BaseKanban
 */
export interface BaseKanbanEmits {
	/** Новый порядок карточек после перемещения мышью или с клавиатуры */
	(event: 'update:cards', cards: KanbanCard[]): void
	/** Карточка перемещена: откуда и куда */
	(event: 'move', move: KanbanMove): void
	/** Карточку открыли: клик без перетаскивания или Enter */
	(event: 'open', card: KanbanCard): void
}

/**
 * Слоты компонента BaseKanban
 */
export interface BaseKanbanSlots {
	/** Содержимое карточки вместо названия, описания и меток; без кнопок и ссылок внутри — карточка сама кнопка */
	card?: (props: { card: KanbanCard; isDragging: boolean }) => unknown
	/** Низ колонки: например, «Добавить карточку» */
	'column-footer'?: (props: { column: KanbanColumn; cards: KanbanCard[] }) => unknown
}

/** Общее состояние доски для перетаскивания мышью и с клавиатуры */
export interface KanbanBoardContext {
	props: BaseKanbanProps
	emit: BaseKanbanEmits
	rootRef: Ref<HTMLElement | null>
	draft: ShallowRef<KanbanCard[] | null>
	cards: ComputedRef<readonly KanbanCard[]>
	announce: (message: KanbanAnnouncement, cardId: string, cards?: readonly KanbanCard[]) => void
	finish: (move: { cardId: string; origin: KanbanPlace }, done: () => void) => void
	cancel: (cardId: string, done: () => void) => void
}
