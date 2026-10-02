import { nextTick } from 'vue'
import { formatMessage } from '@/locales/state'
import { UI_EVENT_CALENDAR } from '@/locales/messages'
import { formatDayLabel, formatTime } from '../eventCalendarFormat'
import type { ScreenPoint } from '../../types/BaseEventCalendarModel.types'
import { addDays, parseEventDate, startOfDay } from '@utils/calendar/eventUtils'
import type { EventCalendarSelection } from '../../types/BaseEventCalendar.types'

const MINUTES_PER_DAY = 1440

export const MINUTE = 60_000

export const DAY_CELL = '.base-event-calendar__day'

export const TIME_COLUMN = '.base-event-calendar__column'

function contains(element: HTMLElement, point: ScreenPoint, isColumn: boolean): boolean {
	const rect = element.getBoundingClientRect()
	const inX = point.x >= rect.left && point.x < rect.right
	return isColumn ? inX : inX && point.y >= rect.top && point.y < rect.bottom
}

export function elementAtPoint(root: HTMLElement | null, selector: string, point: ScreenPoint): HTMLElement | null {
	const elements = Array.from(root?.querySelectorAll<HTMLElement>(selector) ?? [])
	return elements.find(element => contains(element, point, selector === TIME_COLUMN)) ?? null
}

export function dayOf(element: HTMLElement): Date | null {
	return parseEventDate(element.dataset.day ?? '')?.date ?? null
}

export function minuteAt(element: HTMLElement, y: number, step: number): number {
	const rect = element.getBoundingClientRect()
	const ratio = rect.height > 0 ? (y - rect.top) / rect.height : 0
	const minute = Math.floor((ratio * MINUTES_PER_DAY) / step) * step
	return Math.min(MINUTES_PER_DAY - step, Math.max(0, minute))
}

export function atMinute(day: Date, minute: number): Date {
	return new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, minute)
}

export function minuteOf(date: Date): number {
	return date.getHours() * 60 + date.getMinutes()
}

export function isSameTime(first: Date, second: Date): boolean {
	return first.getTime() === second.getTime()
}

export function focusIn(root: HTMLElement | null, selector: string): void {
	nextTick(() => root?.querySelector<HTMLElement>(selector)?.focus())
}

export function formatPosition(date: Date, time = formatTime(date)): string {
	return formatMessage(UI_EVENT_CALENDAR.DAY_TIME, { day: formatDayLabel(date), time })
}

export function formatRange(range: EventCalendarSelection): string {
	const last = range.allDay ? addDays(range.end, -1) : new Date(range.end.getTime() - 1)
	const isOneDay = startOfDay(range.start).getTime() === startOfDay(last).getTime()
	if (range.allDay && isOneDay) return formatDayLabel(range.start)
	if (range.allDay) return formatMessage(UI_EVENT_CALENDAR.RANGE, { start: formatDayLabel(range.start), end: formatDayLabel(last) })
	if (isOneDay) return formatPosition(range.start, `${formatTime(range.start)}–${formatTime(range.end)}`)
	return formatMessage(UI_EVENT_CALENDAR.RANGE, { start: formatPosition(range.start), end: formatPosition(range.end) })
}
