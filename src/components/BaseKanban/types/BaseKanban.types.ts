import type { ComputedRef, Ref, ShallowRef } from 'vue'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'
import type { DropdownMenuItem } from '@components/BaseDropdownMenu/types/BaseDropdownMenu.types'

/**
 * Варианты оформления BaseKanban: `default` — колонки на приглушённой подложке, `soft` — на приподнятой,
 * `outline` — колонки в рамке без фона, `ghost` — без подложки колонок
 */
export const KANBAN_VARIANTS = ['default', 'soft', 'outline', 'ghost'] as const

/** Приоритеты задачи, как в Jira: от самого низкого к самому высокому */
export const KANBAN_PRIORITIES = ['lowest', 'low', 'medium', 'high', 'highest'] as const

/** Приоритет карточки */
export type KanbanPriority = (typeof KANBAN_PRIORITIES)[number]

/** Цвета меток: роли палитры кита */
export const KANBAN_LABEL_COLORS = ['neutral', 'primary', 'success', 'warning', 'error', 'info'] as const

/** Цвет метки */
export type KanbanLabelColor = (typeof KANBAN_LABEL_COLORS)[number]

/** Цветная метка карточки */
export interface KanbanLabel {
	text: string
	color?: KanbanLabelColor
}

/** Исполнитель: имя (инициалы и имя для скринридера) и фото */
export interface KanbanAssignee {
	name: string
	avatar?: string
}

/**
 * Колонка доски; `limit` — сколько карточек в работе допустимо (WIP-лимит), сверх него счётчик подсвечивается;
 * `isDone` — колонка завершённых задач: сроки её карточек не подсвечиваются как просроченные
 */
export interface KanbanColumn {
	id: string
	title: string
	limit?: number
	isDone?: boolean
}

/**
 * Карточка: `columnId` — колонка, порядок в колонке — порядок в массиве `cards`. Остальное необязательно:
 * `key` — номер задачи (`RISE-12`), `labels` и `tags` — метки, `assignees` — исполнители, `dueDate` — срок
 * (`ГГГГ-ММ-ДД` или Date), `priority`, `subtasks` — прогресс подзадач, `comments` и `attachments` — счётчики,
 * `estimate` — оценка (story points или «2 ч»), `coverColor` и `coverImage` — обложка
 */
export interface KanbanCard {
	id: string
	columnId: string
	title: string
	description?: string
	key?: string
	tags?: string[]
	labels?: KanbanLabel[]
	assignees?: KanbanAssignee[]
	dueDate?: string | Date
	priority?: KanbanPriority
	subtasks?: { done: number; total: number }
	comments?: number
	attachments?: number
	estimate?: string | number
	coverColor?: string
	coverImage?: string
}

/** Срок карточки: завершена, просрочен, сегодня, завтра или позже */
export type KanbanDueStatus = 'done' | 'overdue' | 'today' | 'tomorrow' | 'later'

/** Данные карточки для разметки: метки, срок и приоритет в готовом виде */
export interface KanbanCardMeta {
	labels: Required<KanbanLabel>[]
	due: { text: string; status: KanbanDueStatus } | null
	priority: { level: KanbanPriority; label: string; icon: string; count: number } | null
	hasFooter: boolean
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
	/**
	 * Пункты приложения в меню карточки (правый клик, Shift+F10 или клавиша меню) после встроенных «Открыть»,
	 * «Переместить в» и «В начало / в конец колонки»: например, «Удалить» с `isDanger`
	 */
	cardActions?: (card: KanbanCard) => DropdownMenuItem[]
	/** Сегодняшняя дата для сроков карточек: сегодня, завтра, просрочено. По умолчанию — текущая */
	today?: string | Date
	/** Только просмотр: карточки не перетаскиваются, не открываются, меню карточки не показывается */
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
	moveTo: (cardId: string, place: KanbanPlace) => void
}
