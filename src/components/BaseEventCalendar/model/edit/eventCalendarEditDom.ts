import { nextTick } from 'vue'
import { formatMessage } from '@/locales/state'
import { UI_EVENT_CALENDAR } from '@/locales/messages'
import { formatDayLabel, formatTime } from '../eventCalendarFormat'
import { resourceOfElement } from '../resources/eventCalendarResources'
import { addDays, parseEventDate, startOfDay } from '@utils/calendar/eventUtils'
import type { EventCalendarSelection } from '../../types/BaseEventCalendar.types'
import type { EventCalendarContext, EventCalendarEditKind, EventCalendarSlot, ScreenPoint } from '../../types/BaseEventCalendarModel.types'

const MINUTES_PER_DAY = 1440

export const MINUTE = 60_000

export const DAY_CELL = '.base-event-calendar__day'

export const TIME_COLUMN = '.base-event-calendar__column'

function contains(element: HTMLElement, point: ScreenPoint, isColumn: boolean): boolean {
	const rect = element.getBoundingClientRect()
	const inX = point.x >= rect.left && point.x < rect.right
	return isColumn ? inX : inX && point.y >= rect.top && point.y < rect.bottom
}

function elementAtPoint(root: HTMLElement | null, selector: string, point: ScreenPoint): HTMLElement | null {
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

export function columnSelector(key: string): string {
	return `${TIME_COLUMN}[data-column="${key.replace(/"/g, '\\"')}"]`
}

export function slotLocator(context: EventCalendarContext, kind: EventCalendarEditKind): (point: ScreenPoint) => EventCalendarSlot | null {
	return point => {
		const element = elementAtPoint(context.rootRef.value, kind === 'month' ? DAY_CELL : TIME_COLUMN, point)
		const day = element && dayOf(element)
		if (!element || !day) return null
		const date = kind === 'time' ? atMinute(day, minuteAt(element, point.y, context.step.value)) : day
		return { date, resourceId: kind === 'month' ? undefined : resourceOfElement(context, element) }
	}
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
