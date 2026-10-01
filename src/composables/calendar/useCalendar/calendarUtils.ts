import type { CalendarHighlight, CalendarWeekday } from './types/useCalendar.types'
/** Утилиты: сетка дней, шаги по месяцам и ограничения дней календаря */
import { daysInMonth, getWeekday, isSameDay, toDateOnly } from '@utils/data/dateUtils'
import type {
	CalendarDayLimits,
	CalendarDayMarkerOptions,
	CalendarMonthPosition,
	CalendarNextLimits,
	CalendarPrevLimits,
	CalendarStepDirection,
	CalendarViewState,
} from './types/calendarUtils.types'

/** Ячеек в сетке месяца: 6 недель по 7 дней — высота сетки не меняется от месяца к месяцу */
const GRID_CELLS = 42

/** Соседний месяц: за декабрём — январь следующего года, перед январём — декабрь предыдущего */
function shiftMonth(position: CalendarMonthPosition, direction: CalendarStepDirection): CalendarMonthPosition {
	const edge = direction === 1 ? 11 : 0
	if (position.month !== edge) return { year: position.year, month: position.month + direction }
	return { year: position.year + direction, month: direction === 1 ? 0 : 11 }
}

function getMonthNames(locale: string): string[] {
	const formatter = new Intl.DateTimeFormat(locale, { month: 'long' })
	return Array.from({ length: 12 }, (_, index) => formatter.format(new Date(2000, index, 1)))
}

/** Названия дней недели с воскресенья: 1 января 2023 — воскресенье */
function getWeekdayNames(locale: string): string[] {
	const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short' })
	return Array.from({ length: 7 }, (_, index) => formatter.format(new Date(2023, 0, 1 + index)))
}

function orderWeekdays(names: string[], offset: number): string[] {
	return Array.from({ length: 7 }, (_, index) => names[(index + offset) % 7])
}

function buildYearRange(year: number): number[] {
	return Array.from({ length: 12 }, (_, index) => year - 5 + index)
}

function buildDays(position: CalendarMonthPosition, firstDay: number, count: number): Date[] {
	const days: Date[] = []
	for (let index = 0; index < count; index++) {
		days.push(new Date(position.year, position.month, firstDay + index))
	}
	return days
}

/** Сетка месяца: хвост предыдущего месяца, дни месяца и начало следующего — всего GRID_CELLS дней */
function buildMonthDays(position: CalendarMonthPosition, firstDayOfWeek: number): Date[] {
	let startWeekday = getWeekday(new Date(position.year, position.month, 1)) - firstDayOfWeek
	if (startWeekday < 0) startWeekday += 7

	const prev = shiftMonth(position, -1)
	const leading = buildDays(prev, daysInMonth(prev.year, prev.month) - startWeekday + 1, startWeekday)
	const current = buildDays(position, 1, daysInMonth(position.year, position.month))
	const trailing = buildDays(shiftMonth(position, 1), 1, GRID_CELLS - leading.length - current.length)

	return [...leading, ...current, ...trailing]
}

/** Разница между границей (без времени) и меткой времени; без границы — NaN, и любое сравнение ложно */
function boundaryDiff(boundary: Date | null, timestamp: number): number {
	return boundary ? toDateOnly(new Date(boundary)).getTime() - timestamp : Number.NaN
}

function hasPrevMonth(position: CalendarMonthPosition, limits: CalendarPrevLimits): boolean {
	const prev = shiftMonth(position, -1)
	const lastDayPrev = new Date(prev.year, prev.month + 1, 0).getTime()
	return !(boundaryDiff(limits.minDate(), lastDayPrev) > 0 || boundaryDiff(limits.disableTo(), lastDayPrev) > 0)
}

function hasNextMonth(position: CalendarMonthPosition, limits: CalendarNextLimits): boolean {
	const next = shiftMonth(position, 1)
	const firstDayNext = new Date(next.year, next.month, 1).getTime()
	return !(boundaryDiff(limits.maxDate(), firstDayNext) < 0 || boundaryDiff(limits.disableFrom(), firstDayNext) < 0)
}

/** Шаг по календарю: в виде дней — на месяц, месяцев — на год, лет — на 12 лет */
function shiftCalendarView(state: CalendarViewState, direction: CalendarStepDirection): void {
	if (state.currentView.value === 'days') {
		const next = shiftMonth({ year: state.currentYear.value, month: state.currentMonth.value }, direction)
		state.currentMonth.value = next.month
		state.currentYear.value = next.year
		return
	}
	state.currentYear.value += state.currentView.value === 'months' ? direction : direction * 12
}

function isDisabledByList(dateOnly: Date, limits: CalendarDayLimits): boolean {
	const disabled = limits.disabledDates()
	if (Array.isArray(disabled) && disabled.some(item => !!item && isSameDay(dateOnly, new Date(item)))) return true

	const weekdays = limits.disabledWeekdays()
	return Array.isArray(weekdays) && weekdays.includes(getWeekday(dateOnly) as CalendarWeekday)
}

function isOutsideLimits(timestamp: number, limits: CalendarDayLimits): boolean {
	return (
		boundaryDiff(limits.minDate(), timestamp) > 0 ||
		boundaryDiff(limits.maxDate(), timestamp) < 0 ||
		boundaryDiff(limits.disableFrom(), timestamp) <= 0 ||
		boundaryDiff(limits.disableTo(), timestamp) >= 0
	)
}

/** Отметки дня: отключён ли он, выходной ли, его подсветка и события */
function createDayMarkers(options: CalendarDayMarkerOptions) {
	const { highlights, weekends } = options

	function isDayDisabled(date: Date): boolean {
		const dateOnly = toDateOnly(date)
		return isDisabledByList(dateOnly, options) || isOutsideLimits(dateOnly.getTime(), options)
	}

	function isWeekend(date: Date): boolean {
		const w = weekends()
		if (!w) return false
		const day = getWeekday(date)
		if (w.days.includes(day as CalendarWeekday)) return true
		return w.holidays.some(h => isSameDay(date, h))
	}

	function getHighlight(date: Date): CalendarHighlight | undefined {
		const hls = highlights()
		if (!Array.isArray(hls)) return undefined
		return hls.find(h => isSameDay(date, new Date(h.date)))
	}

	function getEvents(date: Date): CalendarHighlight[] {
		const hls = highlights()
		if (!Array.isArray(hls)) return []
		return hls.filter(h => isSameDay(date, new Date(h.date)))
	}

	return { isDayDisabled, isWeekend, getHighlight, getEvents }
}

export {
	buildMonthDays,
	buildYearRange,
	createDayMarkers,
	getMonthNames,
	getWeekdayNames,
	hasNextMonth,
	hasPrevMonth,
	orderWeekdays,
	shiftCalendarView,
}
