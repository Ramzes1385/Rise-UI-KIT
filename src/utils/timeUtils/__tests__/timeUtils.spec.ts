/** Тесты утилит времени */
import { buildTimeOptions, minutesToTime, parseTimeInput, timePrefixes, timeToMinutes } from '../timeUtils'

describe('timeUtils', () => {
	it('minutesToTime и timeToMinutes', () => {
		expect(minutesToTime(9 * 60 + 5)).toBe('09:05')
		expect(timeToMinutes('21:15')).toBe(21 * 60 + 15)
		expect(timeToMinutes('24:00')).toBeUndefined()
		expect(timeToMinutes('12:60')).toBeUndefined()
		expect(timeToMinutes('9:30')).toBeUndefined()
	})

	it('parseTimeInput: с разделителем и без', () => {
		expect(parseTimeInput('9:30')).toBe('09:30')
		expect(parseTimeInput('21.15')).toBe('21:15')
		expect(parseTimeInput('7 5')).toBe('07:05')
		expect(parseTimeInput('930')).toBe('09:30')
		expect(parseTimeInput('0930')).toBe('09:30')
		expect(parseTimeInput('9')).toBe('09:00')
		expect(parseTimeInput(' 18 ')).toBe('18:00')
	})

	it('parseTimeInput: не время — null', () => {
		expect(parseTimeInput('25:00')).toBeNull()
		expect(parseTimeInput('12:75')).toBeNull()
		expect(parseTimeInput('обед')).toBeNull()
		expect(parseTimeInput('')).toBeNull()
	})

	it('buildTimeOptions: шаг, границы, неверный шаг — 30 минут', () => {
		expect(buildTimeOptions(30, '09:00', '10:30')).toEqual(['09:00', '09:30', '10:00', '10:30'])
		expect(buildTimeOptions(60)).toHaveLength(24)
		expect(buildTimeOptions(0, '09:00', '10:00')).toEqual(['09:00', '09:30', '10:00'])
		expect(buildTimeOptions(15, 'утро', 'вечер')).toHaveLength(96)
	})

	it('timePrefixes: начала времени для фильтра списка', () => {
		expect(timePrefixes('9')).toEqual(['09', '9'])
		expect(timePrefixes('14')).toEqual(['14'])
		expect(timePrefixes('9:3')).toEqual(['09:3'])
		expect(timePrefixes('9.')).toEqual(['09:'])
		expect(timePrefixes('930')).toEqual(['09:30'])
		expect(timePrefixes('обед')).toEqual(['обед'])
	})
})
