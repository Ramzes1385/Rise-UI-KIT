import { toDateOnly } from '@utils/data/dateUtils'
import type { CalendarConstraints } from '@components/BaseCalendar'
import { createDayAvailability } from '@composables/calendar/useCalendar/calendarUtils'
import type { BaseDatePickerCalendarConfig } from '../../types/BaseDatePickerCalendar.types'
import type { DatePickerInputIssue, DatePickerRange, DatePickerRangeLimits } from '../../types/DatePickerRange.types'

const MS_PER_DAY = 86_400_000

export function normalizeDayLimit(value: number | null | undefined): number | null {
	if (typeof value !== 'number' || !Number.isFinite(value) || value < 1) return null
	return Math.floor(value)
}

export function resolveRangeLimits(minDays: number | null | undefined, maxDays: number | null | undefined): DatePickerRangeLimits {
	const min = normalizeDayLimit(minDays)
	const max = normalizeDayLimit(maxDays)
	return { minDays: min, maxDays: min !== null && max !== null ? Math.max(min, max) : max }
}

export function getRangeDays(range: DatePickerRange): number {
	return Math.round((toDateOnly(range.end).getTime() - toDateOnly(range.start).getTime()) / MS_PER_DAY) + 1
}

export function createDateAvailability(config: BaseDatePickerCalendarConfig): (date: Date) => boolean {
	const isDisabled = createDayAvailability({
		disabledDates: () => config.disabledDates,
		disabledWeekdays: () => config.disabledWeekdays,
		minDate: () => config.minDate,
		maxDate: () => config.maxDate,
		disableFrom: () => config.disableFrom,
		disableTo: () => config.disableTo,
	})
	return date => !isDisabled(date)
}

export function findRangeIssue(
	range: DatePickerRange,
	isAvailable: (date: Date) => boolean,
	limits: DatePickerRangeLimits,
): DatePickerInputIssue | null {
	if (!isAvailable(range.start) || !isAvailable(range.end)) return 'unavailable'
	const days = getRangeDays(range)
	if (limits.minDays !== null && days < limits.minDays) return 'min-days'
	if (limits.maxDays !== null && days > limits.maxDays) return 'max-days'
	return null
}

function shiftDays(date: Date, days: number): Date {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

function tighten(current: Date | null, next: Date, pick: (a: number, b: number) => number): Date {
	return current ? new Date(pick(toDateOnly(current).getTime(), next.getTime())) : next
}

export function pendingRangeConstraints(start: Date, base: CalendarConstraints, limits: DatePickerRangeLimits): CalendarConstraints {
	const origin = toDateOnly(start)
	const near = limits.minDays === null ? -1 : limits.minDays - 2
	const nearDates = Array.from({ length: near < 0 ? 0 : near * 2 + 1 }, (_, index) => shiftDays(origin, index - near))
	const far = limits.maxDays === null ? null : limits.maxDays - 1
	return {
		...base,
		disabledDates: [...(base.disabledDates ?? []), ...nearDates],
		minDate: far === null ? base.minDate : tighten(base.minDate ?? null, shiftDays(origin, -far), Math.max),
		maxDate: far === null ? base.maxDate : tighten(base.maxDate ?? null, shiftDays(origin, far), Math.min),
	}
}
