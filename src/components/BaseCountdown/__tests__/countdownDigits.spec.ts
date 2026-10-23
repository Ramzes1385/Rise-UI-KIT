import { clockSegments, clockText } from '../model/time/countdownTime'
import { countdownDigits, segmentDigits } from '../model/digits/countdownDigits'
import type { CountdownParts, CountdownUnit } from '../types/BaseCountdown.types'

const parts = ([days, hours, minutes, seconds]: [number, number, number, number]): CountdownParts => ({
	days,
	hours,
	minutes,
	seconds,
	total: 1,
	isFinished: false,
})

const chars = (text: string, unit: string): string =>
	countdownDigits(text, unit)
		.map(digit => digit.char)
		.join('')

describe('countdownDigits', () => {
	it('ключ — единица и позиция с конца, цифры отмечены', () => {
		expect(countdownDigits('05', 'seconds')).toEqual([
			{ key: 'seconds-1', char: '0', isDigit: true },
			{ key: 'seconds-0', char: '5', isDigit: true },
		])
	})

	it('при смене длины младшие разряды сохраняют ключи', () => {
		const ten = countdownDigits('10', 'days').map(digit => digit.key)
		const nine = countdownDigits('9', 'days').map(digit => digit.key)
		expect(ten).toEqual(['days-1', 'days-0'])
		expect(nine).toEqual(['days-0'])
	})

	it('не цифры — статичны: прочерк, буквы, пробел', () => {
		expect(countdownDigits('-', 'pending')).toEqual([{ key: 'pending-0', char: '-', isDigit: false }])
		expect(countdownDigits('2 d', 'days').map(digit => digit.isDigit)).toEqual([true, false, false])
		expect(chars('2 дн.', 'days')).toBe('2 дн.')
	})

	it('цифры других письменностей — тоже цифры', () => {
		expect(countdownDigits('٣', 'seconds')[0].isDigit).toBe(true)
	})

	it('пустая строка — нет разрядов', () => {
		expect(countdownDigits('', 'seconds')).toEqual([])
	})
})

describe('segmentDigits', () => {
	it('разделители между единицами: пробел после дней, двоеточие между остальными', () => {
		const digits = segmentDigits([
			{ unit: 'days', text: '2' },
			{ unit: 'hours', text: '03' },
			{ unit: 'minutes', text: '04' },
		])
		expect(digits.map(digit => digit.char).join('')).toBe('2 03:04')
		expect(digits.filter(digit => !digit.isDigit)).toEqual([
			{ key: 'sep-days', char: ' ', isDigit: false },
			{ key: 'sep-hours', char: ':', isDigit: false },
		])
	})

	it('без частей — пусто', () => {
		expect(segmentDigits([])).toEqual([])
	})

	it.each<[string, CountdownParts, CountdownUnit[]]>([
		['дни и часы', parts([2, 3, 4, 5]), ['days', 'hours', 'minutes', 'seconds']],
		['дней нет — без дней', parts([0, 3, 4, 5]), ['days', 'hours', 'minutes', 'seconds']],
		['только дни', parts([2, 0, 0, 0]), ['days']],
		['только дни, ноль', parts([0, 0, 0, 0]), ['days']],
		['минуты и секунды', parts([0, 0, 4, 5]), ['minutes', 'seconds']],
	])('совпадает со строкой часов: %s', (_, value, units) => {
		expect(
			segmentDigits(clockSegments(value, units))
				.map(digit => digit.char)
				.join(''),
		).toBe(clockText(value, units))
	})
})
