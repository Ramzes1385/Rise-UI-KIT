import { formatMediaTime } from '../model/mediaTime'

describe('formatMediaTime', () => {
	it.each([
		[0, '0:00'],
		[5.9, '0:05'],
		[83, '1:23'],
		[600, '10:00'],
		[3725, '1:02:05'],
		[Number.NaN, '0:00'],
		[Number.POSITIVE_INFINITY, '0:00'],
		[-3, '0:00'],
	])('%d с → %s', (seconds, expected) => {
		expect(formatMediaTime(seconds)).toBe(expected)
	})

	it('часы показываются, если они есть у длительности: ширина текста не прыгает', () => {
		expect(formatMediaTime(83, 3725)).toBe('0:01:23')
		expect(formatMediaTime(83, Number.NaN)).toBe('1:23')
	})
})
