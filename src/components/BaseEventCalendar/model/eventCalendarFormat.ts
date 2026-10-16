import { UI_EVENT_CALENDAR } from '@/locales/messages'
import { getLocale, formatMessage } from '@/locales/state'
import { createDateFormat } from '@utils/data/dateFormatUtils'
import { addDays, startOfDay } from '@utils/calendar/eventUtils'
import type { DateFormatter } from '@utils/data/dateFormatUtils'
import type { NormalizedCalendarEvent } from '@utils/calendar/eventUtils'
import type { EventCalendarPeriod, EventCalendarView } from '../types/BaseEventCalendar.types'

const VIEW_LABELS = {
	month: 'VIEW_MONTH',
	week: 'VIEW_WEEK',
	day: 'VIEW_DAY',
	list: 'VIEW_LIST',
} as const

const formatters = new Map<string, DateFormatter>()

function formatter(options: Intl.DateTimeFormatOptions): DateFormatter {
	const { intl } = getLocale()
	const key = `${intl}|${JSON.stringify(options)}`
	const cached = formatters.get(key)
	if (cached) return cached
	const created = createDateFormat(intl, options)
	formatters.set(key, created)
	return created
}

function format(date: Date, options: Intl.DateTimeFormatOptions): string {
	return formatter(options).format(date)
}

function capitalize(text: string): string {
	return text.charAt(0).toLocaleUpperCase(getLocale().intl) + text.slice(1)
}

export function viewLabel(view: EventCalendarView): string {
	return UI_EVENT_CALENDAR[VIEW_LABELS[view]]
}

export function formatTime(date: Date): string {
	return format(date, { hour: '2-digit', minute: '2-digit' })
}

export function formatDayLabel(date: Date): string {
	return format(date, { day: 'numeric', month: 'long' })
}

export function formatFullDate(date: Date): string {
	return format(date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatHeaderDay(date: Date): string {
	return format(date, { weekday: 'short', day: 'numeric', month: 'short' })
}

export function weekdayNames(firstDay: number): string[] {
	const sunday = new Date(2023, 0, 1)
	return Array.from({ length: 7 }, (_, index) => format(addDays(sunday, (firstDay + index) % 7), { weekday: 'short' }))
}

export function periodTitle(period: EventCalendarPeriod, date: Date): string {
	if (period.view === 'week') {
		return formatter({ day: 'numeric', month: 'short', year: 'numeric' }).formatRange(period.start, addDays(period.end, -1))
	}
	if (period.view === 'day') return capitalize(formatFullDate(date))
	return capitalize(format(date, { month: 'long', year: 'numeric' }))
}

export function eventTime(item: NormalizedCalendarEvent): string {
	return item.allDay ? '' : `${formatTime(item.start)}–${formatTime(item.end)}`
}

function isSingleDay(item: NormalizedCalendarEvent): boolean {
	const last = item.allDay ? addDays(item.end, -1) : new Date(item.end.getTime() - 1)
	return startOfDay(last).getTime() === startOfDay(item.start).getTime()
}

export function eventLabel(item: NormalizedCalendarEvent): string {
	const { title } = item.event
	if (isSingleDay(item)) {
		const date = formatDayLabel(item.start)
		return item.allDay
			? formatMessage(UI_EVENT_CALENDAR.EVENT_ALL_DAY, { title, date })
			: formatMessage(UI_EVENT_CALENDAR.EVENT_TIMED, { title, date, time: eventTime(item) })
	}
	const end = item.allDay ? addDays(item.end, -1) : item.end
	const withTime = (value: Date): string => (item.allDay ? formatDayLabel(value) : `${formatDayLabel(value)}, ${formatTime(value)}`)
	return formatMessage(UI_EVENT_CALENDAR.EVENT_RANGE, { title, start: withTime(item.start), end: withTime(end) })
}
