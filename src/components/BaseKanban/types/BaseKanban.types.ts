import type { UiProp } from '@composables/base/useUi'
import type { ComputedRef, Ref, ShallowRef } from 'vue'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'
import type { DropdownMenuItem } from '@components/BaseDropdownMenu/types/BaseDropdownMenu.types'

/**
 * Варианты оформления BaseKanban: `default` — колонки на приглушённой подложке, `soft` — на приподнятой,
 * `outline` — колонки в рамке без фона, `ghost` — без подложки колонок
 */
export const KANBAN_VARIANTS = ['default', 'soft', 'outline', 'ghost'] as const

/**
 * Части доски для пропа `ui` (БЭМ-элементы `.base-kanban__<часть>`, `root` — сама доска):
 * board — полоса колонок; column — колонка; header — шапка колонки; dot — цветная точка колонки; title — название колонки;
 * count — счётчик карточек; toggle — кнопка «Свернуть» (корень BaseButton); list — список карточек `<ul>`;
 * item — пункт списка `<li>`; card — карточка; cover — обложка; labels — строка меток; card-title — название карточки;
 * card-description — описание карточки; meta — нижняя строка карточки (номер, срок, счётчики, исполнители);
 * empty — текст пустой колонки; add — кнопка «Добавить карточку» (корень BaseButton); editor — поле добавления и
 * переименования; field — его `<textarea>`; ghost — копия карточки под курсором при перетаскивании мышью.
 */
export const KANBAN_PARTS = [
	'board',
	'column',
	'header',
	'dot',
	'title',
	'count',
	'toggle',
	'list',
	'item',
	'card',
	'cover',
	'labels',
	'card-title',
	'card-description',
	'meta',
	'empty',
	'add',
	'editor',
	'field',
	'ghost',
] as const

/** Часть доски для пропа `ui` */
export type BaseKanbanPart = (typeof KANBAN_PARTS)[number]

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
	/** Цвет колонки: точка у заголовка и полоса сверху */
	color?: string
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

/** Объявление для скринридера при перемещении с клавиатуры: ключ строки из словаря `kanban` */
export type KanbanAnnouncement = 'PICKED' | 'MOVED' | 'DROPPED' | 'CANCELLED' | 'BLOCKED' | 'CREATED' | 'RENAMED'

/**
 * Колонка для разметки: показанные карточки, счётчик («3 / 5» с лимитом, «1 из 3» под фильтром), доступное имя
 * списка и текст пустой колонки
 */
export interface KanbanColumnView {
	column: KanbanColumn
	cards: KanbanCard[]
	count: string
	label: string
	emptyText: string
	isOverLimit: boolean
	isCollapsed: boolean
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
	 * «Переместить в» и «В начало / в конец колонки»: например, «Копировать ссылку»
	 */
	cardActions?: (card: KanbanCard) => DropdownMenuItem[]
	/** Сегодняшняя дата для сроков карточек: сегодня, завтра, просрочено. По умолчанию — текущая */
	today?: string | Date
	/**
	 * Доска редактируется: «Добавить карточку» внизу колонки, переименование по F2 или из меню карточки,
	 * «Удалить» в меню карточки
	 */
	isEditable?: boolean
	/** Какие карточки показывать: например, результат BaseFilterBuilder или поиска. Скрытые карточки не теряются */
	filter?: (card: KanbanCard) => boolean
	/** Колонки сворачиваются кнопкой в заголовке */
	isCollapsible?: boolean
	/** Свёрнутые колонки (`v-model:collapsed-columns`): узкая полоса с названием и счётчиком */
	collapsedColumns?: readonly string[]
	/** Id новой карточки; по умолчанию — `card-` и метка времени */
	createCardId?: () => string
	/** Только просмотр: карточки не перетаскиваются, не открываются, меню карточки не показывается */
	isDisabled?: boolean
	/**
	 * Классы частей доски (`root`, `column`, `header`, `list`, `card`, `card-title`, `ghost`…) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseKanban: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseKanban v-model:cards="cards" :columns="columns" :ui="{ column: 'bg-slate-50', card: 'shadow-none' }" />
	 */
	ui?: UiProp<BaseKanbanPart>
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
	/** Добавлена карточка («Добавить карточку» при `is-editable`) */
	(event: 'create', card: KanbanCard): void
	/** Карточка переименована: карточка с новым названием */
	(event: 'rename', card: KanbanCard): void
	/** Карточка удалена из меню */
	(event: 'delete', card: KanbanCard): void
	/** Колонку свернули или развернули */
	(event: 'update:collapsedColumns', ids: string[]): void
}

/**
 * Слоты компонента BaseKanban
 */
export interface BaseKanbanSlots {
	/** Содержимое карточки вместо названия, описания и меток; без кнопок и ссылок внутри — карточка сама кнопка */
	card?: (props: { card: KanbanCard; isDragging: boolean }) => unknown
	/** Низ колонки: например, сумма оценок или ссылка «Все задачи» */
	'column-footer'?: (props: { column: KanbanColumn; cards: KanbanCard[] }) => unknown
}

/**
 * Общее состояние доски: `cards` — показанные карточки (с учётом фильтра и перетаскивания), `full` — все,
 * `columns` — развёрнутые колонки для перехода стрелками
 */
export interface KanbanBoardContext {
	props: BaseKanbanProps
	emit: BaseKanbanEmits
	rootRef: Ref<HTMLElement | null>
	draft: ShallowRef<KanbanCard[] | null>
	cards: ComputedRef<readonly KanbanCard[]>
	announce: (message: KanbanAnnouncement, cardId: string, cards?: readonly KanbanCard[]) => void
	full: ComputedRef<readonly KanbanCard[]>
	columns: ComputedRef<readonly KanbanColumn[]>
	collapsed: ShallowRef<readonly string[]>
	setCards: (cards: KanbanCard[]) => void
	say: (text: string) => void
	finish: (move: { cardId: string; origin: KanbanPlace }, done: () => void) => void
	cancel: (cardId: string, done: () => void) => void
	moveTo: (cardId: string, place: KanbanPlace) => void
}

/** Действия редактирования, которые меню карточки вызывает при `is-editable` */
export interface KanbanMenuEdit {
	startRename: (card: KanbanCard) => void
	deleteCard: (card: KanbanCard) => void
}
