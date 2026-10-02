import { MINUTE } from './eventCalendarEditDom'
import type { NormalizedCalendarEvent } from '@utils/calendar/eventUtils'
import { addDays, daysBetween, startOfDay } from '@utils/calendar/eventUtils'
import type { EventCalendarChange } from '../../types/BaseEventCalendar.types'
import type {
	EventCalendarContext,
	EventCalendarDraft,
	EventCalendarEditKind,
	EventCalendarShift,
	EventCalendarTime,
} from '../../types/BaseEventCalendarModel.types'

export function shiftDate(date: Date, by: EventCalendarShift): Date {
	return new Date(addDays(date, by.days).getTime() + by.minutes * MINUTE)
}

export function shiftBetween(from: Date, to: Date): EventCalendarShift {
	const minutes = to.getHours() * 60 + to.getMinutes() - (from.getHours() * 60 + from.getMinutes())
	return { days: daysBetween(from, to), minutes }
}

export function leastLength(kind: EventCalendarEditKind, step: number): EventCalendarShift {
	return kind === 'time' ? { days: 0, minutes: step } : { days: 1, minutes: 0 }
}

export function movedTime(time: EventCalendarTime, by: EventCalendarShift): EventCalendarTime {
	return { start: shiftDate(time.start, by), end: shiftDate(time.end, by) }
}

export function resizedTime(time: EventCalendarTime, end: Date, least: EventCalendarShift): EventCalendarTime {
	const shortest = shiftDate(time.start, least)
	return { start: time.start, end: end < shortest ? shortest : end }
}

function toChange(item: NormalizedCalendarEvent, time: EventCalendarTime): EventCalendarChange {
	return {
		type: time.start.getTime() === item.start.getTime() ? 'resize' : 'move',
		event: item.event,
		start: time.start,
		end: time.end,
		allDay: item.allDay,
		oldStart: item.start,
		oldEnd: item.end,
	}
}

function isUnchanged(item: NormalizedCalendarEvent, time: EventCalendarTime): boolean {
	return time.start.getTime() === item.start.getTime() && time.end.getTime() === item.end.getTime()
}

export function isInPeriod(context: EventCalendarContext, start: Date): boolean {
	const day = startOfDay(start)
	return day >= context.period.value.start && day < context.period.value.end
}

export function makeDraft(context: EventCalendarContext, item: NormalizedCalendarEvent, time: EventCalendarTime): EventCalendarDraft {
	const isAllowed = context.props.canMove?.(toChange(item, time)) ?? true
	return { key: item.key, start: time.start, end: time.end, isBlocked: !isAllowed }
}

export function emitChange(context: EventCalendarContext, item: NormalizedCalendarEvent, draft: EventCalendarDraft | null): boolean {
	if (!draft || draft.isBlocked || isUnchanged(item, draft)) return false
	context.emit('event-change', toChange(item, draft))
	return true
}
