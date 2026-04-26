import {
	buildDateWithTime as buildDateWithTimeUtil,
	daysInMonth,
	getWeekNumber,
	getWeekday,
	isSameDay,
	toDateOnly,
} from '@/shared/utils/dateUtils'
import { computed, ref, watch } from 'vue'
import type { CalendarHighlight, CalendarView, CalendarWeekday, CalendarWeekends } from './BaseCalendar.types'

interface UseCalendarOptions {
	selectionMode: () => 'single' | 'range' | 'multiple'
	modelValue: () => Date | null
	modelValueEnd: () => Date | null
	selectedDates: () => Date[]
	minDate: () => Date | null
	maxDate: () => Date | null
	disabledDates: () => Date[]
	disabledWeekdays: () => CalendarWeekday[]
	disableFrom: () => Date | null
	disableTo: () => Date | null
	highlights: () => CalendarHighlight[]
	weekends: () => CalendarWeekends | null
	firstDayOfWeek: () => CalendarWeekday
	locale: () => string
}

export function useCalendar(options: UseCalendarOptions) {
	const currentMonth = ref(new Date().getMonth())
	const currentYear = ref(new Date().getFullYear())
	const currentView = ref<CalendarView>('days')

	/** Время */
	const hours = ref(0)
	const minutes = ref(0)
	const seconds = ref(0)

	/** Диапазонный старт (для range) */
	const rangeStart = ref<Date | null>(null)

	/** Следить за modelValue для синхронизации месяца/года */
	watch(
		options.modelValue,
		val => {
			if (val) {
				currentMonth.value = val.getMonth()
				currentYear.value = val.getFullYear()
				hours.value = val.getHours()
				minutes.value = val.getMinutes()
				seconds.value = val.getSeconds()
			}
		},
		{ immediate: true },
	)

	/** Названия месяцев */
	const monthNames = computed<string[]>(() => {
		const formatter = new Intl.DateTimeFormat(options.locale(), { month: 'long' })
		const names: string[] = []
		for (let i = 0; i < 12; i++) {
			const d = new Date(2000, i, 1)
			names.push(formatter.format(d))
		}
		return names
	})

	/** Короткие названия дней недели */
	const weekdayNames = computed<string[]>(() => {
		const formatter = new Intl.DateTimeFormat(options.locale(), { weekday: 'short' })
		const names: string[] = []
		const base = new Date(2023, 0, 1)
		for (let i = 0; i < 7; i++) {
			const d = new Date(base)
			d.setDate(d.getDate() + i)
			names.push(formatter.format(d))
		}
		return names
	})

	/** Заголовок текущего месяца/года */
	const headerTitle = computed((): string => {
		if (currentView.value === 'days') {
			return `${monthNames.value[currentMonth.value]} ${currentYear.value}`
		}
		if (currentView.value === 'months') {
			return `${currentYear.value}`
		}
		return `${currentYear.value - 5} – ${currentYear.value + 6}`
	})

	/** Упорядоченные названия дней недели с учётом firstDayOfWeek */
	const orderedWeekdays = computed<string[]>(() => {
		const names = weekdayNames.value
		const offset = options.firstDayOfWeek()
		const result: string[] = []
		for (let i = 0; i < 7; i++) {
			result.push(names[(i + offset) % 7])
		}
		return result
	})

	/** Дни текущего месяца для сетки */
	const calendarDays = computed<Date[]>(() => {
		const days: Date[] = []
		const total = daysInMonth(currentYear.value, currentMonth.value)
		const firstDay = new Date(currentYear.value, currentMonth.value, 1)
		let startWeekday = getWeekday(firstDay) - options.firstDayOfWeek()
		if (startWeekday < 0) startWeekday += 7

		// Дни предыдущего месяца
		const prevMonth = currentMonth.value === 0 ? 11 : currentMonth.value - 1
		const prevYear = currentMonth.value === 0 ? currentYear.value - 1 : currentYear.value
		const prevTotal = daysInMonth(prevYear, prevMonth)
		for (let i = startWeekday - 1; i >= 0; i--) {
			days.push(new Date(prevYear, prevMonth, prevTotal - i))
		}

		// Дни текущего месяца
		for (let d = 1; d <= total; d++) {
			days.push(new Date(currentYear.value, currentMonth.value, d))
		}

		// Дни следующего месяца
		const remaining = 42 - days.length
		const nextMonth = currentMonth.value === 11 ? 0 : currentMonth.value + 1
		const nextYear = currentMonth.value === 11 ? currentYear.value + 1 : currentYear.value
		for (let d = 1; d <= remaining; d++) {
			days.push(new Date(nextYear, nextMonth, d))
		}

		return days
	})

	/** Годы для выбора */
	const yearRange = computed<number[]>(() => {
		const years: number[] = []
		const start = currentYear.value - 5
		for (let i = 0; i < 12; i++) {
			years.push(start + i)
		}
		return years
	})

	/** Проверить, является ли дата сегодняшней */
	function isToday(date: Date): boolean {
		return isSameDay(date, new Date())
	}

	/** Проверить, выбрана ли дата */
	function isSelected(date: Date): boolean {
		const val = options.modelValue()
		if (val && isSameDay(date, val)) return true
		const end = options.modelValueEnd()
		if (end && isSameDay(date, end)) return true
		return options.selectedDates().some(d => isSameDay(date, d))
	}

	/** Проверить, в диапазоне ли дата */
	function isInRange(date: Date): boolean {
		const start = options.modelValue()
		const end = options.modelValueEnd()
		if (!start || !end) return false
		const d = toDateOnly(date)
		return d > toDateOnly(start) && d < toDateOnly(end)
	}

	/** Проверить, отключена ли дата */
	function isDisabled(date: Date): boolean {
		const d = toDateOnly(date)

		// Выключенные даты
		if (options.disabledDates().some(dis => isSameDay(d, dis))) return true

		// Выключенные дни недели
		if (options.disabledWeekdays().includes(getWeekday(d) as CalendarWeekday)) return true

		// Мин/макс
		const min = options.minDate()
		if (min && d < toDateOnly(min)) return true
		const max = options.maxDate()
		if (max && d > toDateOnly(max)) return true

		// disableFrom / disableTo
		const from = options.disableFrom()
		if (from && d >= toDateOnly(from)) return true
		const to = options.disableTo()
		if (to && d <= toDateOnly(to)) return true

		return false
	}

	/** Проверить, выходной ли дата */
	function isWeekend(date: Date): boolean {
		const w = options.weekends()
		if (!w) return false
		const day = getWeekday(date)
		if (w.days.includes(day as CalendarWeekday)) return true
		return w.holidays.some(h => isSameDay(date, h))
	}

	/** Получить выделение для даты */
	function getHighlight(date: Date): CalendarHighlight | undefined {
		return options.highlights().find(h => isSameDay(date, h.date))
	}

	/** Получить события для даты */
	function getEvents(date: Date): CalendarHighlight[] {
		return options.highlights().filter(h => isSameDay(date, h.date))
	}

	/** Проверить, относится ли дата к текущему месяцу */
	function isCurrentMonth(date: Date): boolean {
		return date.getMonth() === currentMonth.value
	}

	// ── Навигация ──

	function prevMonth(): void {
		if (currentView.value === 'days') {
			if (currentMonth.value === 0) {
				currentMonth.value = 11
				currentYear.value--
			} else {
				currentMonth.value--
			}
		} else if (currentView.value === 'months') {
			currentYear.value--
		} else {
			currentYear.value -= 12
		}
	}

	function nextMonth(): void {
		if (currentView.value === 'days') {
			if (currentMonth.value === 11) {
				currentMonth.value = 0
				currentYear.value++
			} else {
				currentMonth.value++
			}
		} else if (currentView.value === 'months') {
			currentYear.value++
		} else {
			currentYear.value += 12
		}
	}

	function goToToday(): void {
		const now = new Date()
		currentMonth.value = now.getMonth()
		currentYear.value = now.getFullYear()
		currentView.value = 'days'
	}

	function switchView(): void {
		if (currentView.value === 'days') {
			currentView.value = 'months'
		} else if (currentView.value === 'months') {
			currentView.value = 'years'
		}
	}

	function selectMonth(month: number): void {
		currentMonth.value = month
		currentView.value = 'days'
	}

	function selectYear(year: number): void {
		currentYear.value = year
		currentView.value = 'months'
	}

	/** Собрать дату с временем */
	function buildDateWithTime(date: Date): Date {
		return buildDateWithTimeUtil({
			date,
			hours: hours.value,
			minutes: minutes.value,
			seconds: seconds.value,
		})
	}

	return {
		currentMonth,
		currentYear,
		currentView,
		hours,
		minutes,
		seconds,
		rangeStart,
		monthNames,
		weekdayNames,
		headerTitle,
		orderedWeekdays,
		calendarDays,
		yearRange,
		isToday,
		isSelected,
		isInRange,
		isDisabled,
		isWeekend,
		getHighlight,
		getEvents,
		isCurrentMonth,
		getWeekNumber,
		prevMonth,
		nextMonth,
		goToToday,
		switchView,
		selectMonth,
		selectYear,
		buildDateWithTime,
		isSameDay,
	}
}
