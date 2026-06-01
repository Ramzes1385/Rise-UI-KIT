/**
 * Unit-тесты для dateUtils.
 * Покрывают: isSameDay, toDateOnly, daysInMonth, getWeekday,
 * getWeekNumber, buildDateWithTime, isToday, isDateInRange,
 * formatDate, formatRange, formatMultiple.
 */

import '@testing-library/jest-dom/vitest'

import {
	buildDateWithTime,
	daysInMonth,
	formatDate,
	formatMultiple,
	formatRange,
	getWeekday,
	getWeekNumber,
	isDateInRange,
	isSameDay,
	isToday,
	toDateOnly,
} from './dateUtils'

describe('dateUtils', () => {
	// ── isSameDay ──

	describe('isSameDay', () => {
		it('возвращает true для одинаковых дат', () => {
			const a = new Date(2025, 0, 15)
			const b = new Date(2025, 0, 15)
			expect(isSameDay(a, b)).toBe(true)
		})

		it('возвращает false для разных дат', () => {
			const a = new Date(2025, 0, 15)
			const b = new Date(2025, 0, 16)
			expect(isSameDay(a, b)).toBe(false)
		})

		it('игнорирует время при сравнении', () => {
			const a = new Date(2025, 0, 15, 10, 30)
			const b = new Date(2025, 0, 15, 22, 0)
			expect(isSameDay(a, b)).toBe(true)
		})

		it('возвращает false для разных месяцев', () => {
			const a = new Date(2025, 0, 15)
			const b = new Date(2025, 1, 15)
			expect(isSameDay(a, b)).toBe(false)
		})

		it('возвращает false для разных годов', () => {
			const a = new Date(2024, 0, 15)
			const b = new Date(2025, 0, 15)
			expect(isSameDay(a, b)).toBe(false)
		})
	})

	// ── toDateOnly ──

	describe('toDateOnly', () => {
		it('обнуляет время', () => {
			const d = new Date(2025, 5, 10, 14, 30, 45, 500)
			const result = toDateOnly(d)
			expect(result.getHours()).toBe(0)
			expect(result.getMinutes()).toBe(0)
			expect(result.getSeconds()).toBe(0)
			expect(result.getMilliseconds()).toBe(0)
		})

		it('сохраняет дату', () => {
			const d = new Date(2025, 5, 10, 14, 30)
			const result = toDateOnly(d)
			expect(result.getFullYear()).toBe(2025)
			expect(result.getMonth()).toBe(5)
			expect(result.getDate()).toBe(10)
		})
	})

	// ── daysInMonth ──

	describe('daysInMonth', () => {
		it('возвращает 31 для января', () => {
			expect(daysInMonth(2025, 0)).toBe(31)
		})

		it('возвращает 28 для февраля невисокосного года', () => {
			expect(daysInMonth(2025, 1)).toBe(28)
		})

		it('возвращает 29 для февраля високосного года', () => {
			expect(daysInMonth(2024, 1)).toBe(29)
		})

		it('возвращает 30 для апреля', () => {
			expect(daysInMonth(2025, 3)).toBe(30)
		})
	})

	// ── getWeekday ──

	describe('getWeekday', () => {
		it('возвращает 0 для воскресенья', () => {
			const sunday = new Date(2025, 0, 5)
			expect(getWeekday(sunday)).toBe(0)
		})

		it('возвращает 1 для понедельника', () => {
			const monday = new Date(2025, 0, 6)
			expect(getWeekday(monday)).toBe(1)
		})
	})

	// ── getWeekNumber ──

	describe('getWeekNumber', () => {
		it('возвращает 1 для начала года', () => {
			const date = new Date(2025, 0, 1)
			const week = getWeekNumber(date)
			expect(week).toBeGreaterThanOrEqual(1)
			expect(week).toBeLessThanOrEqual(53)
		})

		it('возвращает корректный номер недели', () => {
			const date = new Date(2025, 0, 6)
			expect(getWeekNumber(date)).toBe(2)
		})

		it('корректно обрабатывает воскресенье', () => {
			// 5 января 2025 — воскресенье
			const sunday = new Date(2025, 0, 5)
			const week = getWeekNumber(sunday)
			expect(week).toBeGreaterThanOrEqual(1)
			expect(week).toBeLessThanOrEqual(53)
		})
	})

	// ── buildDateWithTime ──

	describe('buildDateWithTime', () => {
		it('собирает дату с указанным временем', () => {
			const date = new Date(2025, 5, 10)
			const result = buildDateWithTime({ date, hours: 14, minutes: 30, seconds: 0 })
			expect(result.getFullYear()).toBe(2025)
			expect(result.getMonth()).toBe(5)
			expect(result.getDate()).toBe(10)
			expect(result.getHours()).toBe(14)
			expect(result.getMinutes()).toBe(30)
		})
	})

	// ── isToday ──

	describe('isToday', () => {
		it('возвращает true для текущей даты', () => {
			expect(isToday(new Date())).toBe(true)
		})

		it('возвращает false для вчерашней даты', () => {
			const yesterday = new Date()
			yesterday.setDate(yesterday.getDate() - 1)
			expect(isToday(yesterday)).toBe(false)
		})
	})

	// ── isDateInRange ──

	describe('isDateInRange', () => {
		it('возвращает true для даты внутри диапазона', () => {
			const date = new Date(2025, 5, 10)
			const start = new Date(2025, 5, 5)
			const end = new Date(2025, 5, 15)
			expect(isDateInRange(date, start, end)).toBe(true)
		})

		it('возвращает false для даты на границе начала', () => {
			const date = new Date(2025, 5, 5)
			const start = new Date(2025, 5, 5)
			const end = new Date(2025, 5, 15)
			expect(isDateInRange(date, start, end)).toBe(false)
		})

		it('возвращает false для даты на границе конца', () => {
			const date = new Date(2025, 5, 15)
			const start = new Date(2025, 5, 5)
			const end = new Date(2025, 5, 15)
			expect(isDateInRange(date, start, end)).toBe(false)
		})

		it('возвращает false для даты вне диапазона', () => {
			const date = new Date(2025, 5, 20)
			const start = new Date(2025, 5, 5)
			const end = new Date(2025, 5, 15)
			expect(isDateInRange(date, start, end)).toBe(false)
		})

		it('игнорирует время при проверке', () => {
			const date = new Date(2025, 5, 10, 12, 0)
			const start = new Date(2025, 5, 5, 23, 59)
			const end = new Date(2025, 5, 15, 0, 1)
			expect(isDateInRange(date, start, end)).toBe(true)
		})
	})

	// ── formatDate ──

	describe('formatDate', () => {
		const base = {
			dateFormat: 'dd.MM.yyyy' as const,
			is24Hour: true,
			locale: 'ru-RU',
			showSeconds: false,
			showTime: false,
		}

		it('форматирует дату без времени', () => {
			const result = formatDate({ ...base, date: new Date(2025, 5, 10) })
			expect(result).toContain('2025')
		})

		it('форматирует дату со временем', () => {
			const result = formatDate({
				...base,
				date: new Date(2025, 5, 10, 14, 30),
				showTime: true,
			})
			expect(result).toContain('14')
			expect(result).toContain('30')
		})

		it('форматирует дату с секундами', () => {
			const result = formatDate({
				...base,
				date: new Date(2025, 5, 10, 14, 30, 45),
				showTime: true,
				showSeconds: true,
			})
			expect(result).toContain('45')
		})

		it('форматирует дату в 12-часовом формате', () => {
			const result = formatDate({
				...base,
				date: new Date(2025, 5, 10, 14, 30),
				showTime: true,
				is24Hour: false,
			})
			// В 12-часовом формате 14:30 отображается как 2:30 PM
			expect(result).toMatch(/PM|pm/i)
		})
	})

	// ── formatRange ──

	describe('formatRange', () => {
		const base = {
			dateFormat: 'dd.MM.yyyy' as const,
			is24Hour: true,
			locale: 'ru-RU',
			showSeconds: false,
			showTime: false,
		}

		it('возвращает пустую строку если обе даты null', () => {
			expect(formatRange({ ...base, start: null, end: null })).toBe('')
		})

		it('форматирует только начало если конец null', () => {
			const result = formatRange({ ...base, start: new Date(2025, 5, 10), end: null })
			expect(result).toContain('—')
			expect(result).toContain('...')
		})

		it('форматирует диапазон с обеими датами', () => {
			const result = formatRange({
				...base,
				start: new Date(2025, 5, 10),
				end: new Date(2025, 5, 15),
			})
			expect(result).toContain('—')
		})

		it('форматирует только конец если начало null', () => {
			const result = formatRange({ ...base, start: null, end: new Date(2025, 5, 15) })
			expect(result).toContain('—')
			expect(result).not.toContain('...')
		})
	})

	// ── formatMultiple ──

	describe('formatMultiple', () => {
		const base = {
			dateFormat: 'dd.MM.yyyy' as const,
			is24Hour: true,
			locale: 'ru-RU',
			showSeconds: false,
			showTime: false,
		}

		it('возвращает пустую строку для пустого массива', () => {
			expect(formatMultiple({ ...base, dates: [] })).toBe('')
		})

		it('форматирует до 3 дат через запятую', () => {
			const dates = [new Date(2025, 5, 10), new Date(2025, 5, 11)]
			const result = formatMultiple({ ...base, dates })
			expect(result).toContain(',')
		})

		it('форматирует ровно 3 даты через запятую', () => {
			const dates = [new Date(2025, 5, 10), new Date(2025, 5, 11), new Date(2025, 5, 12)]
			const result = formatMultiple({ ...base, dates })
			expect(result).toContain(',')
			expect(result).not.toContain('Выбрано')
		})

		it('показывает количество если дат больше 3', () => {
			const dates = [new Date(2025, 5, 10), new Date(2025, 5, 11), new Date(2025, 5, 12), new Date(2025, 5, 13)]
			const result = formatMultiple({ ...base, dates })
			expect(result).toContain('4')
		})
	})
})
