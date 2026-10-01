/** Утилиты: базовая дата, число месяцев и сдвиги панели дейтпикера */
import type { MonthItem, UseDatePickerPanelNavigationOptions } from './types/useDatePickerPanelNavigation.types'

/** Первое число месяца базовой даты со сдвигом на месяцы и годы */
function monthStart(base: Date, monthOffset: number, yearOffset = 0): Date {
	return new Date(base.getFullYear() + yearOffset, base.getMonth() + monthOffset, 1)
}

function resolveBaseDate(options: UseDatePickerPanelNavigationOptions): Date {
	const firstSelectedDate = options.selectedDates()?.[0]
	const sourceDate = options.modelValue() ?? options.modelValueEnd() ?? firstSelectedDate ?? new Date()

	return monthStart(sourceDate, 0)
}

/** Число месяцев панели: целое не меньше 1, нечисловое значение — 1 */
function normalizeMonthsCount(rawCount: number | string): number {
	const count = typeof rawCount === 'number' ? rawCount : Number.NaN

	if (!Number.isFinite(count) || count < 1) return 1

	return Math.floor(count)
}

/** Год панели: один год или «начало - конец», если месяцы панели переходят через год */
function formatDisplayYear(base: Date, monthsCount: number): string {
	const startYear = base.getFullYear()
	const endYear = monthStart(base, monthsCount - 1).getFullYear()

	return startYear === endYear ? `${startYear}` : `${startYear} - ${endYear}`
}

function buildMonthItems(base: Date, monthsCount: number): MonthItem[] {
	return Array.from({ length: monthsCount }, (_, index) => {
		const monthDate = monthStart(base, index)
		return {
			key: `${monthDate.getFullYear()}-${monthDate.getMonth()}`,
			month: monthDate.getMonth(),
			year: monthDate.getFullYear(),
		}
	})
}

/** Базовая дата, при которой календарь itemIndex показывает месяц month */
function baseForMonth(base: Date, month: number, itemIndex: number): Date {
	const targetDate = monthStart(base, itemIndex)
	const monthDiff = month - targetDate.getMonth()

	return new Date(targetDate.getFullYear(), targetDate.getMonth() + monthDiff - itemIndex, 1)
}

/** Базовая дата, при которой календарь itemIndex показывает год year */
function baseForYear(base: Date, year: number, itemIndex: number): Date {
	const yearDiff = year - monthStart(base, itemIndex).getFullYear()

	return monthStart(base, 0, yearDiff)
}

export { baseForMonth, baseForYear, buildMonthItems, formatDisplayYear, monthStart, normalizeMonthsCount, resolveBaseDate }
