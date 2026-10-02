import type { BaseComponentProps } from '@composables/base/useBaseComponent'
import type { CalendarEvent, CalendarEventDate, CalendarRange, NormalizedCalendarEvent } from '@utils/calendar/eventUtils'

/**
 * Варианты оформления BaseEventCalendar: `default` — рамка и фон страницы, `soft` — приподнятый фон без рамки,
 * `outline` — заметная рамка без фона, `ghost` — без рамки и фона (календарь внутри своей карточки)
 */
export const EVENT_CALENDAR_VARIANTS = ['default', 'soft', 'outline', 'ghost'] as const

export type EventCalendarVariant = (typeof EVENT_CALENDAR_VARIANTS)[number]

/** Виды календаря: месяц, неделя, день, список событий (повестка) */
export const EVENT_CALENDAR_VIEWS = ['month', 'week', 'day', 'list'] as const

export type EventCalendarView = (typeof EVENT_CALENDAR_VIEWS)[number]

/** Рабочие часы: `start` и `end` — `ЧЧ:ММ`, `days` — рабочие дни недели (0 — воскресенье); по умолчанию пн–пт */
export interface EventCalendarWorkHours {
	start: string
	end: string
	days?: number[]
}

/**
 * Пропсы компонента BaseEventCalendar
 */
export interface BaseEventCalendarProps extends BaseComponentProps<EventCalendarVariant, 'root' | 'toolbar' | 'event'> {
	/** События: `{ id, title, start, end?, allDay?, color?, category?, rrule? }`; `end` не входит в событие */
	events?: CalendarEvent[]
	/** Вид (`v-model:view`) */
	view?: EventCalendarView
	/** Дата внутри показанного периода (`v-model:date`); по умолчанию — сегодня */
	date?: CalendarEventDate
	/** Виды в переключателе панели; один вид — переключателя нет */
	views?: EventCalendarView[]
	/** Шаг сетки времени в неделе и дне, минуты: 15, 30 или 60 */
	slotDuration?: number
	/** Рабочие часы: остальное время в неделе и дне приглушено; сетка открывается на их начале */
	workHours?: EventCalendarWorkHours
	/** Первый день недели: 0 — воскресенье, 1 — понедельник; по умолчанию — из языка кита */
	firstDayOfWeek?: number
	/** Сколько событий видно в дне месяца; остальные — за кнопкой «+N ещё» */
	maxEventsPerDay?: number
	/** Линия текущего времени в неделе и дне */
	hasNowIndicator?: boolean
	/** Сегодняшняя дата (подсветка дня и линия времени); по умолчанию — часы браузера */
	today?: CalendarEventDate
	/**
	 * Выделение и создание: протянуть мышью по дням или шагам времени — событие `select`, нажать пустое место — `create`.
	 * С клавиатуры: Shift со стрелками выделяет, Enter — `select` или `create`, Escape снимает выделение
	 */
	isSelectable?: boolean
	/**
	 * Перенос и растягивание событий: мышью — за событие и за его край, с клавиатуры — Space берёт событие, стрелки
	 * двигают на шаг сетки или день, Shift со стрелками меняет длительность, Enter кладёт, Escape отменяет. Итог —
	 * событие `event-change`: календарь не меняет `events` сам
	 */
	isEditable?: boolean
	/** Запрет переноса и растягивания: вернуть false — событие нельзя положить на это время */
	canMove?: (change: EventCalendarChange) => boolean
}

/** Событие, которое нажали: исходное, начало и конец показа (у повтора — этого повтора) */
export interface EventCalendarEventPayload {
	event: CalendarEvent
	start: Date
	end: Date
	allDay: boolean
}

/** Выделенное время или пустое место для нового события: начало, конец (не входит), весь ли день */
export interface EventCalendarSelection extends CalendarRange {
	allDay: boolean
}

/** Изменение события: перенос (`move`) или растягивание (`resize`), новое время и прежнее */
export interface EventCalendarChange extends EventCalendarEventPayload {
	type: 'move' | 'resize'
	oldStart: Date
	oldEnd: Date
}

/** Показанный период: вид, начало и конец (не входит) — для загрузки событий приложением */
export interface EventCalendarPeriod extends CalendarRange {
	view: EventCalendarView
}

/**
 * События компонента BaseEventCalendar
 */
export interface BaseEventCalendarEmits {
	/** Сменился вид — переключателем панели */
	(event: 'update:view', value: EventCalendarView): void
	/** Сменилась дата: «Сегодня», стрелки периода, клавиши в сетке месяца */
	(event: 'update:date', value: Date): void
	/** Показан другой период: приходит при монтировании и после каждой смены вида или периода */
	(event: 'period-change', value: EventCalendarPeriod): void
	/** Нажато событие (мышью, Enter или Space) */
	(event: 'event-click', value: EventCalendarEventPayload): void
	/** Выделено время (`isSelectable`): мышью по нескольким дням или шагам, с клавиатуры — Shift со стрелками и Enter */
	(event: 'select', value: EventCalendarSelection): void
	/** Нажато пустое место (`isSelectable`): день в месяце или шаг времени в неделе и дне; с клавиатуры — Enter */
	(event: 'create', value: EventCalendarSelection): void
	/** Событие перенесено или растянуто (`isEditable`); у повтора — время этого повтора */
	(event: 'event-change', value: EventCalendarChange): void
}

/** Данные слота события: событие, его время для показа (`time` — «10:00–11:00», пусто у события на весь день) и вид */
export interface EventCalendarEventSlotProps extends EventCalendarEventPayload {
	time: string
	view: EventCalendarView
}

/** Данные слота дня месяца: дата, сегодня ли, из соседнего ли месяца, события дня */
export interface EventCalendarDaySlotProps {
	date: Date
	isToday: boolean
	isOutside: boolean
	events: NormalizedCalendarEvent[]
}

/** Данные слота панели: заголовок периода и действия */
export interface EventCalendarToolbarSlotProps {
	title: string
	view: EventCalendarView
	date: Date
	period: EventCalendarPeriod
	today: () => void
	prev: () => void
	next: () => void
	setView: (view: EventCalendarView) => void
}

/** Данные слота шага шкалы времени: время шага и подпись «10:00» */
export interface EventCalendarTimeSlotProps {
	time: Date
	label: string
}

/** Данные слота заголовка дня: дата, подпись «пн, 2 окт.» и сегодня ли */
export interface EventCalendarHeaderDaySlotProps {
	date: Date
	label: string
	isToday: boolean
}

/**
 * Слоты компонента BaseEventCalendar
 */
export interface BaseEventCalendarSlots {
	/** Панель целиком: вместо «Сегодня», стрелок, заголовка и переключателя видов */
	toolbar?: (props: EventCalendarToolbarSlotProps) => unknown
	/** Число дня в сетке месяца — для всех дней; у дня со своим слотом `day-<ГГГГ-ММ-ДД>` — он */
	day?: (props: EventCalendarDaySlotProps) => unknown
	/** Число одного дня месяца по его дате: `day-2026-10-02` — 2 октября 2026 */
	[name: `day-${string}`]: ((props: EventCalendarDaySlotProps) => unknown) | undefined
	/**
	 * Содержимое события во всех видах; приоритет: `event-<id>`, затем `category-<категория>`, затем `event`.
	 * Событие остаётся кнопкой с доступным именем — в слоте не нужны свои кнопки и ссылки
	 */
	event?: (props: EventCalendarEventSlotProps) => unknown
	/** Содержимое одного события по его `id`: `event-42` — событие с `id: 42` */
	[name: `event-${string}`]: ((props: EventCalendarEventSlotProps) => unknown) | undefined
	/** Содержимое событий одной категории: `category-meeting` — события с `category: 'meeting'` */
	[name: `category-${string}`]: ((props: EventCalendarEventSlotProps) => unknown) | undefined
	/** Подпись шага шкалы времени в неделе и дне */
	'time-slot'?: (props: EventCalendarTimeSlotProps) => unknown
	/** Заголовок дня в неделе и дне */
	'header-day'?: (props: EventCalendarHeaderDaySlotProps) => unknown
	/** Подпись строки событий на весь день в неделе и дне (по умолчанию «Весь день») */
	'all-day'?: () => unknown
	/** Пустой вид «Список»: в периоде нет событий */
	empty?: () => unknown
}
