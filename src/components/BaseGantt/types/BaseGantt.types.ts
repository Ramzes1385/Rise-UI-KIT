import type { UiProp } from '@composables/base/useUi'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты оформления полос: default — залитые полосы, soft — светлые полосы с цветной заливкой прогресса,
 * outline — полосы с рамкой на светлом фоне.
 */
export const GANTT_VARIANTS = ['default', 'soft', 'outline'] as const

export type GanttVariant = (typeof GANTT_VARIANTS)[number]

/** Шкала времени: day — столбец на день, week — на неделю (первый день недели — из языка кита), month — на календарный месяц */
export const GANTT_SCALES = ['day', 'week', 'month'] as const

export type GanttScale = (typeof GANTT_SCALES)[number]

/**
 * Части диаграммы для пропа `ui` (БЭМ-элементы `.base-gantt__<часть>`, `root` — корень):
 * viewport — прокручиваемая область, header — строка шкалы времени, row — строка задачи, name — ячейка с названием,
 * timeline — ячейка с полосой, bar — полоса задачи, progress — заливка прогресса, milestone — веха,
 * today — линия «сегодня», dependencies — слой со стрелками зависимостей, status — живой регион для скринридера.
 */
export const GANTT_PARTS = [
	'viewport',
	'header',
	'row',
	'name',
	'timeline',
	'bar',
	'progress',
	'milestone',
	'today',
	'dependencies',
	'status',
] as const

export type BaseGanttPart = (typeof GANTT_PARTS)[number]

/** Идентификатор задачи */
export type GanttTaskId = string | number

/** Дата задачи: `Date` или строка `ГГГГ-ММ-ДД` (также `ГГГГ-ММ-ДДTЧЧ:ММ`); время отбрасывается, важен календарный день */
export type GanttDate = Date | string

/** Задача диаграммы. Окончание включительно: задача `2026-10-05` — `2026-10-07` занимает три дня */
export interface GanttTask {
	/** Уникальный идентификатор. Повторы пропускаются с предупреждением */
	id: GanttTaskId
	/** Название — подпись в списке слева и в доступном имени полосы */
	name: string
	/** Первый день задачи */
	start: GanttDate
	/** Последний день задачи (включительно). Не задан или раньше начала — задача длится один день. У вехи игнорируется */
	end?: GanttDate
	/** Готовность, % (0–100). Не задана — 0 */
	progress?: number
	/** Родитель в дереве. Неизвестный или замкнутый в цикл родитель игнорируется: задача показывается на верхнем уровне */
	parentId?: GanttTaskId
	/** Задачи, после которых начинается эта (зависимость «окончание — начало»). Неизвестные и замыкающие цикл игнорируются */
	dependencies?: GanttTaskId[]
	/** Веха: точка во времени без длительности, рисуется ромбом */
	isMilestone?: boolean
}

/** Что изменил пользователь: сдвинул задачу целиком или потянул за начало или окончание */
export type GanttChangeKind = 'move' | 'resize-start' | 'resize-end'

/** Чем изменение сделано: перетаскиванием или клавишами */
export type GanttChangeSource = 'pointer' | 'keyboard'

/** Изменение задачи пользователем (`task-change`) */
export interface GanttTaskChange {
	/** Задача с новыми датами. Даты — в том же виде, что были у задачи: строка `ГГГГ-ММ-ДД` или `Date` */
	task: GanttTask
	/** Задача до изменения */
	previous: GanttTask
	/** Сдвиг целиком или изменение длительности */
	kind: GanttChangeKind
	/** Перетаскивание или клавиатура */
	source: GanttChangeSource
}

export interface BaseGanttProps extends BaseComponentProps<
	GanttVariant,
	'root' | 'viewport' | 'header' | 'row' | 'name' | 'timeline' | 'bar' | 'progress' | 'milestone' | 'today' | 'dependencies' | 'status'
> {
	/** Задачи плоским списком; иерархия — через `parentId`, порядок строк — порядок в массиве внутри уровня */
	tasks?: GanttTask[]
	/** Шкала времени: день, неделя или месяц */
	scale?: GanttScale
	/** Ширина одного столбца шкалы, px при `sizeScale` 100. По умолчанию: день — 36, неделя — 98, месяц — 90 */
	columnWidth?: number
	/** Высота строки, px при `sizeScale` 100 */
	rowHeight?: number
	/** Ширина списка задач слева, px при `sizeScale` 100 */
	listWidth?: number
	/** Высота области диаграммы: число — px, строка — любая CSS-длина. Строки за её пределами не отрисовываются (виртуализация) */
	height?: number | string
	/** Сегодняшний день для линии «сегодня». По умолчанию — текущий день; в историях и тестах задаётся явно */
	today?: GanttDate
	/** Показывать линию «сегодня» */
	isTodayVisible?: boolean
	/** Разрешает менять даты: перетаскивание полосы и краёв мышью, стрелки на фокусе полосы */
	isEditable?: boolean
	/** Отключает диаграмму: полосы не реагируют на клики и не редактируются */
	isDisabled?: boolean
	/** Показывает скелетон вместо строк */
	isLoading?: boolean
	/** Свёрнутые задачи — их `id` (`v-model:collapsed-ids`). Дети свёрнутых скрыты */
	collapsedIds?: GanttTaskId[]
	/** Формат дат в подписях: параметры `Intl.DateTimeFormat`, язык берётся из настроек кита */
	dateFormat?: Intl.DateTimeFormatOptions
	/** Доступное имя диаграммы (по умолчанию — из словаря) */
	ariaLabel?: string
	/**
	 * Классы частей диаграммы (`root`, `viewport`, `header`, `row`, `name`, `timeline`, `bar`, `progress`, `milestone`, `today`,
	 * `dependencies`, `status`) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseGantt: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseGantt :tasks="tasks" :ui="{ root: 'my-gantt', bar: 'my-bar' }" />
	 */
	ui?: UiProp<BaseGanttPart>
}

export interface BaseGanttEmits {
	/** Пользователь изменил даты задачи: задача с новыми датами. Диаграмма сама `tasks` не меняет — подставьте задачу в свой массив */
	(event: 'update:task', task: GanttTask): void
	/** То же с подробностями: что изменено (`kind`), чем (`source`) и задача до изменения */
	(event: 'task-change', change: GanttTaskChange): void
	/** Клик по полосе или названию, Enter на полосе */
	(event: 'task-click', task: GanttTask, e: MouseEvent | KeyboardEvent): void
	/** Свёрнута или развёрнута задача: новый список свёрнутых `id` (`v-model:collapsed-ids`) */
	(event: 'update:collapsedIds', ids: GanttTaskId[]): void
}

export interface BaseGanttSlots {
	/** Содержимое ячейки названия вместо текста */
	name?: (props: { task: GanttTask; level: number; isCollapsed: boolean }) => unknown
	/** Содержимое пустого состояния вместо «Нет задач» */
	empty?: () => unknown
}

export type GanttProps = PropsWithDefaults<
	BaseGanttProps,
	'tasks' | 'scale' | 'rowHeight' | 'listWidth' | 'height' | 'isTodayVisible' | 'isEditable' | 'isDisabled' | 'isLoading' | 'collapsedIds'
>
