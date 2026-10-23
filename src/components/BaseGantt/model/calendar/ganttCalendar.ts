import type { GanttDate, GanttScale } from '../../types/BaseGantt.types'
import type { GanttRange, GanttScaleCell, GanttScaleFormat, GanttUnit } from '../../types/BaseGanttModel.types'
import { addDays, daysBetween, parseEventDate, startOfDay, startOfWeek, toDayKey } from '@utils/calendar/eventUtils'

const UNIT_DAYS: Record<GanttScale, number> = { day: 1, week: 7, month: 30 }

export const DEFAULT_COLUMN_WIDTH: Record<GanttScale, number> = { day: 36, week: 98, month: 90 }

const RANGE_PADDING: Record<GanttScale, number> = { day: 2, week: 7, month: 31 }

export function parseGanttDate(value: GanttDate | undefined): Date | null {
	if (value === undefined) return null
	const parsed = parseEventDate(value)
	return parsed ? startOfDay(parsed.date) : null
}

export function toGanttDate(original: GanttDate, day: Date): GanttDate {
	return typeof original === 'string' ? toDayKey(day) : day
}

export function addMonths(date: Date, months: number): Date {
	const target = new Date(date.getFullYear(), date.getMonth() + months, 1)
	const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
	target.setDate(Math.min(date.getDate(), lastDay))
	return target
}

export function shiftByUnit(date: Date, scale: GanttScale, units: number): Date {
	if (scale === 'month') return addMonths(date, units)
	return addDays(date, units * UNIT_DAYS[scale])
}

export function startOfUnit(date: Date, scale: GanttScale, firstDayOfWeek: number): Date {
	if (scale === 'week') return startOfWeek(date, firstDayOfWeek)
	if (scale === 'month') return new Date(date.getFullYear(), date.getMonth(), 1)
	return startOfDay(date)
}

function endOfUnits(date: Date, scale: GanttScale, firstDayOfWeek: number): Date {
	const unitStart = startOfUnit(date, scale, firstDayOfWeek)
	return unitStart.getTime() === date.getTime() ? date : shiftByUnit(unitStart, scale, 1)
}

export function pxPerDay(scale: GanttScale, columnWidth: number): number {
	return columnWidth / UNIT_DAYS[scale]
}

export function computeRange(spans: readonly { start: Date; end: Date }[], today: Date, unit: GanttUnit): GanttRange {
	const { scale, firstDay: firstDayOfWeek } = unit
	const starts = spans.map(span => span.start.getTime())
	const ends = spans.map(span => span.end.getTime())
	const first = new Date(starts.length ? Math.min(...starts) : today.getTime())
	const last = new Date(ends.length ? Math.max(...ends) : today.getTime())
	const padding = RANGE_PADDING[scale]
	const start = startOfUnit(addDays(first, -padding), scale, firstDayOfWeek)
	const end = endOfUnits(addDays(last, padding + 1), scale, firstDayOfWeek)
	return { start, days: daysBetween(start, end) }
}

export function dayOffset(range: GanttRange, date: Date): number {
	return daysBetween(range.start, date)
}

function nextGroup(date: Date, scale: GanttScale): Date {
	return scale === 'month' ? new Date(date.getFullYear() + 1, 0, 1) : new Date(date.getFullYear(), date.getMonth() + 1, 1)
}

export function scaleCells(
	range: GanttRange,
	unit: GanttUnit,
	format: GanttScaleFormat,
): { top: GanttScaleCell[]; bottom: GanttScaleCell[] } {
	const { scale } = unit
	const end = addDays(range.start, range.days)
	const bottom: GanttScaleCell[] = []
	for (let cursor = range.start; cursor < end;) {
		const next = shiftByUnit(cursor, scale, 1)
		bottom.push({
			key: toDayKey(cursor),
			label: format(cursor, scale === 'month' ? 'month' : 'day'),
			offset: dayOffset(range, cursor),
			span: daysBetween(cursor, next),
		})
		cursor = next
	}
	const top: GanttScaleCell[] = []
	for (let cursor = range.start; cursor < end;) {
		const next = nextGroup(cursor, scale)
		const stop = next < end ? next : end
		top.push({
			key: toDayKey(cursor),
			label: format(cursor, scale === 'month' ? 'year' : 'monthYear'),
			offset: dayOffset(range, cursor),
			span: daysBetween(cursor, stop),
		})
		cursor = stop
	}
	return { top, bottom }
}
