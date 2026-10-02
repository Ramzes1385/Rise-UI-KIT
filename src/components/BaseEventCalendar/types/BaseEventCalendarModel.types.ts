import type { ComputedRef, Ref, ShallowRef } from 'vue'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { CalendarTimeSegment, CalendarWeekSegment, NormalizedCalendarEvent } from '@utils/calendar/eventUtils'
import type {
	BaseEventCalendarEmits,
	BaseEventCalendarProps,
	EventCalendarPeriod,
	EventCalendarSelection,
	EventCalendarView,
} from './BaseEventCalendar.types'

/** Пропсы после `withDefaults`: значения по умолчанию заданы в `ui/BaseEventCalendar.vue` */
export type EventCalendarProps = PropsWithDefaults<
	BaseEventCalendarProps,
	'events' | 'view' | 'views' | 'slotDuration' | 'maxEventsPerDay' | 'hasNowIndicator' | 'isSelectable' | 'isEditable'
>

/** Событие, которое сейчас переносят или растягивают: ключ показа и новое время; `isBlocked` — `canMove` запретил */
export interface EventCalendarDraft {
	key: string
	start: Date
	end: Date
	isBlocked: boolean
}

/** Выделение: откуда начали (`anchor`) и где сейчас (`focus`) — дни (`allDay`) или начала шагов времени */
export interface EventCalendarSelectionState {
	anchor: Date
	focus: Date
	allDay: boolean
}

/** Общее состояние календаря: вид, дата, сегодня, показанный период и его события */
export interface EventCalendarContext {
	props: EventCalendarProps
	emit: BaseEventCalendarEmits
	view: ShallowRef<EventCalendarView>
	date: ShallowRef<Date>
	now: ComputedRef<Date>
	today: ComputedRef<Date>
	firstDay: ComputedRef<number>
	period: ComputedRef<EventCalendarPeriod>
	items: ComputedRef<NormalizedCalendarEvent[]>
	/** Шаг сетки времени, минуты (5–60) */
	step: ComputedRef<number>
	/** Текст `role="status"`: смена периода, выделение, перенос */
	status: Ref<string>
	draft: ShallowRef<EventCalendarDraft | null>
	rootRef: Ref<HTMLElement | null>
	setDate: (value: Date) => void
	setView: (value: EventCalendarView) => void
}

/** День сетки месяца */
export interface EventCalendarMonthDay {
	date: Date
	key: string
	column: number
	isToday: boolean
	isOutside: boolean
	label: string
	/** События дня, которые не поместились: за кнопкой «+N ещё» */
	hidden: number
	/** Все события дня — для поповера и слота `day` */
	items: NormalizedCalendarEvent[]
}

/** Неделя сетки месяца: дни, отрезки событий и сколько рядов видно */
export interface EventCalendarMonthWeek {
	key: string
	days: EventCalendarMonthDay[]
	segments: CalendarWeekSegment[]
	lanes: number
	hasMore: boolean
}

/** День сетки времени: подпись, рабочие часы (доли суток), события со временем */
export interface EventCalendarTimeDay {
	date: Date
	key: string
	label: string
	isToday: boolean
	work: { top: number; height: number } | null
	segments: CalendarTimeSegment[]
}

/** Шаг шкалы времени: время и подпись (у шагов не на целый час подписи нет) */
export interface EventCalendarTimeSlot {
	key: string
	time: Date
	label: string
	isHour: boolean
}

/** Слот события по приоритету: `event-<id>`, `category-<категория>`, `event` */
export type EventSlotName = 'event' | `event-${string}` | `category-${string}`

/** Слот дня месяца: `day-<ГГГГ-ММ-ДД>` или `day` */
export type DaySlotName = 'day' | `day-${string}`

/** Точка экрана: координаты указателя */
export interface ScreenPoint {
	x: number
	y: number
}

/** Обработчики слежения за указателем после нажатия: движение, отпускание, отмена (Escape, `pointercancel`) */
export interface PointerTrackHandlers {
	move: (point: ScreenPoint) => void
	up: (point: ScreenPoint) => void
	cancel: () => void
}

/** Выделение для мыши и клавиатуры: состояние, диапазон и действия */
export interface EventCalendarSelectionApi {
	selection: ShallowRef<EventCalendarSelectionState | null>
	range: ComputedRef<EventCalendarSelection | null>
	update: (state: EventCalendarSelectionState | null) => void
	clear: () => void
	finish: (state: EventCalendarSelectionState) => void
}
