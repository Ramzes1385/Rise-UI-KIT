import type { ComputedRef, ShallowRef } from 'vue'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { CalendarAgendaDay, CalendarTimeSegment, CalendarWeekSegment, NormalizedCalendarEvent } from '@utils/calendar/eventUtils'
import type { BaseEventCalendarEmits, BaseEventCalendarProps, EventCalendarPeriod, EventCalendarView } from './BaseEventCalendar.types'

/** Пропсы после `withDefaults`: значения по умолчанию заданы в `ui/BaseEventCalendar.vue` */
export type EventCalendarProps = PropsWithDefaults<
	BaseEventCalendarProps,
	'events' | 'view' | 'views' | 'slotDuration' | 'maxEventsPerDay' | 'hasNowIndicator'
>

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

/** Дни вида «Список» */
export type EventCalendarAgenda = CalendarAgendaDay[]

/** Слот события по приоритету: `event-<id>`, `category-<категория>`, `event` */
export type EventSlotName = 'event' | `event-${string}` | `category-${string}`

/** Слот дня месяца: `day-<ГГГГ-ММ-ДД>` или `day` */
export type DaySlotName = 'day' | `day-${string}`
