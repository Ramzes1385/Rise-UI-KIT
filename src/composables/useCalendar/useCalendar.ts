import {
	buildDateWithTime as buildDateWithTimeUtil,
	daysInMonth,
	getWeekNumber,
	getWeekday,
	isSameDay,
	toDateOnly,
} from '@utils/dateUtils'
import { computed, ref, watch } from 'vue'
import type { CalendarHighlight, CalendarView, CalendarWeekday, UseCalendarOptions } from './useCalendar.types'

export function useCalendar(options: UseCalendarOptions) {
	const currentMonth = ref(options.initialMonth?.() ?? new Date().getMonth())
	const currentYear = ref(options.initialYear?.() ?? new Date().getFullYear())
	const currentView = ref<CalendarView>('days')

	/** Синхронизация с внешним управлением месяцем/годом (для DatePickerPanel) */
	watch(
		() => options.initialMonth?.(),
		val => {
			if (val !== undefined) currentMonth.value = val
		},
	)

	watch(
		() => options.initialYear?.(),
		val => {
			if (val !== undefined) currentYear.value = val
		},
	)

	/** Время */
	const hours = ref(0)
	const minutes = ref(0)
	const seconds = ref(0)

	/** Внутреннее состояние выделения (мгновенное обновление) */
	const internalValue = ref<Date | null>(null)
	const internalValueEnd = ref<Date | null>(null)
	const internalSelectedDates = ref<Date[]>([])

	/** Синхронизация внутреннего состояния с props */
	watch(
		() => options.modelValue(),
		val => {
			const date = val ? new Date(val) : null
			internalValue.value = date
			if (date && options.initialMonth?.() === undefined) {
				currentMonth.value = date.getMonth()
				currentYear.value = date.getFullYear()
				hours.value = date.getHours()
				minutes.value = date.getMinutes()
				seconds.value = date.getSeconds()
			}
		},
		{ immediate: true },
	)

	watch(
		() => options.modelValueEnd(),
		val => {
			internalValueEnd.value = val ? new Date(val) : null
		},
		{ immediate: true },
	)

	watch(
		() => options.selectedDates(),
		val => {
			internalSelectedDates.value = Array.isArray(val) ? val.map(item => new Date(item)) : []
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
			const month = monthNames.value[currentMonth.value]
			return options.showYear?.() !== false ? `${month} ${currentYear.value}` : month
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

		const prevMonth = currentMonth.value === 0 ? 11 : currentMonth.value - 1
		const prevYear = currentMonth.value === 0 ? currentYear.value - 1 : currentYear.value
		const prevTotal = daysInMonth(prevYear, prevMonth)
		for (let i = startWeekday - 1; i >= 0; i--) {
			days.push(new Date(prevYear, prevMonth, prevTotal - i))
		}

		for (let d = 1; d <= total; d++) {
			days.push(new Date(currentYear.value, currentMonth.value, d))
		}

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

	/** Проверить, выбрана ли дата (из внутреннего состояния) */
	function isSelected(date: Date): boolean {
		if (internalValue.value && isSameDay(date, internalValue.value)) return true
		if (internalValueEnd.value && isSameDay(date, internalValueEnd.value)) return true
		return internalSelectedDates.value.some(item => isSameDay(date, item))
	}

	/** Проверить, в диапазоне ли дата */
	function isInRange(date: Date): boolean {
		if (!internalValue.value || !internalValueEnd.value) return false
		const d = toDateOnly(date)
		return d > toDateOnly(internalValue.value) && d < toDateOnly(internalValueEnd.value)
	}

	/** Начало диапазона */
	function isRangeStart(date: Date): boolean {
		return !!internalValue.value && isSameDay(date, internalValue.value) && options.selectionMode() === 'range'
	}

	/** Конец диапазона */
	function isRangeEnd(date: Date): boolean {
		return !!internalValueEnd.value && isSameDay(date, internalValueEnd.value) && options.selectionMode() === 'range'
	}

	/** Дата вне выделенного диапазона */
	function isOutOfRange(date: Date): boolean {
		if (options.selectionMode() !== 'range') return false
		if (!internalValue.value || !internalValueEnd.value) return false
		return !isSelected(date) && !isInRange(date) && isCurrentMonth(date)
	}

	/** Проверить, отключена ли дата */
	function isDayDisabled(date: Date): boolean {
		const dateOnly = toDateOnly(date)
		const dateTs = dateOnly.getTime()

		// Проверка списка отключенных дат
		const disabledDates = options.disabledDates()
		if (Array.isArray(disabledDates)) {
			for (const dis of disabledDates) {
				if (dis && isSameDay(dateOnly, new Date(dis))) return true
			}
		}

		// Проверка дней недели
		const disabledWeekdays = options.disabledWeekdays()
		if (Array.isArray(disabledWeekdays) && disabledWeekdays.includes(getWeekday(dateOnly) as CalendarWeekday)) return true

		// Проверка минимальной даты
		const min = options.minDate()
		if (min && dateTs < toDateOnly(new Date(min)).getTime()) return true

		// Проверка максимальной даты
		const max = options.maxDate()
		if (max && dateTs > toDateOnly(new Date(max)).getTime()) return true

		// Проверка диапазона "от"
		const from = options.disableFrom()
		if (from && dateTs >= toDateOnly(new Date(from)).getTime()) return true

		// Проверка диапазона "до"
		const to = options.disableTo()
		if (to && dateTs <= toDateOnly(new Date(to)).getTime()) return true

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
		const hls = options.highlights()
		if (!Array.isArray(hls)) return undefined
		return hls.find(h => isSameDay(date, new Date(h.date)))
	}

	/** Получить события для даты */
	function getEvents(date: Date): CalendarHighlight[] {
		const hls = options.highlights()
		if (!Array.isArray(hls)) return []
		return hls.filter(h => isSameDay(date, new Date(h.date)))
	}

	/** Проверить, относится ли дата к текущему месяцу */
	function isCurrentMonth(date: Date): boolean {
		return date.getMonth() === currentMonth.value && date.getFullYear() === currentYear.value
	}

	// ── Методы обновления внутреннего состояния ──

	function setSingleValue(date: Date | null): void {
		internalValue.value = date
	}

	function setRangeStart(date: Date | null): void {
		internalValue.value = date
	}

	function setRangeEnd(date: Date | null): void {
		internalValueEnd.value = date
	}

	function toggleMultipleDate(date: Date): void {
		const idx = internalSelectedDates.value.findIndex(item => isSameDay(item, date))
		if (idx > -1) {
			internalSelectedDates.value.splice(idx, 1)
		} else {
			internalSelectedDates.value.push(date)
		}
	}

	// ── Навигация ──

	/** Можно ли перейти к предыдущему месяцу */
	const canPrev = computed((): boolean => {
		const prevM = currentMonth.value === 0 ? 11 : currentMonth.value - 1
		const prevY = currentMonth.value === 0 ? currentYear.value - 1 : currentYear.value
		const lastDayPrev = new Date(prevY, prevM + 1, 0).getTime()

		const min = options.minDate()
		if (min && toDateOnly(new Date(min)).getTime() > lastDayPrev) return false

		const to = options.disableTo()
		if (to && toDateOnly(new Date(to)).getTime() > lastDayPrev) return false

		return true
	})

	/** Можно ли перейти к следующему месяцу */
	const canNext = computed((): boolean => {
		const nextM = currentMonth.value === 11 ? 0 : currentMonth.value + 1
		const nextY = currentMonth.value === 11 ? currentYear.value + 1 : currentYear.value
		const firstDayNext = new Date(nextY, nextM, 1).getTime()

		const max = options.maxDate()
		if (max && toDateOnly(new Date(max)).getTime() < firstDayNext) return false

		const from = options.disableFrom()
		if (from && toDateOnly(new Date(from)).getTime() < firstDayNext) return false

		return true
	})

	function prevMonth(): void {
		if (!canPrev.value) return
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
		if (!canNext.value) return
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

	/** Номер недели для ряда по индексу первого дня */
	function getRowWeekNumber(rowStartIdx: number): number {
		const days = calendarDays.value
		const midIdx = Math.min(rowStartIdx + 3, days.length - 1)
		return getWeekNumber(days[midIdx])
	}

	return {
		currentMonth,
		currentYear,
		currentView,
		hours,
		minutes,
		seconds,
		internalValue,
		internalValueEnd,
		internalSelectedDates,
		monthNames,
		weekdayNames,
		headerTitle,
		orderedWeekdays,
		calendarDays,
		yearRange,
		isToday,
		isSelected,
		isInRange,
		isRangeStart,
		isRangeEnd,
		isOutOfRange,
		isDayDisabled,
		isWeekend,
		getHighlight,
		getEvents,
		isCurrentMonth,
		getWeekNumber,
		getRowWeekNumber,
		canPrev,
		canNext,
		prevMonth,
		nextMonth,
		goToToday,
		switchView,
		selectMonth,
		selectYear,
		setSingleValue,
		setRangeStart,
		setRangeEnd,
		toggleMultipleDate,
		buildDateWithTime,
		isSameDay,
	}
}

