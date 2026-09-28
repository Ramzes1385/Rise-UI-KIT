/** Тесты утилит поля числа */
import { clampNumber, parseNumberInput, roundToPrecision, stepPrecision } from '../numberInputUtils'

describe('numberInputUtils', () => {
	it('parseNumberInput: запятая и точка, пробелы и знак минус U+2212', () => {
		expect(parseNumberInput('1,5')).toBe(1.5)
		expect(parseNumberInput(' 1 000.25 ')).toBe(1000.25)
		expect(parseNumberInput('−3')).toBe(-3)
		expect(parseNumberInput('+7')).toBe(7)
		expect(parseNumberInput('.5')).toBe(0.5)
		expect(parseNumberInput('2.')).toBe(2)
	})

	it('parseNumberInput: пусто — null, не число — undefined', () => {
		expect(parseNumberInput('  ')).toBeNull()
		expect(parseNumberInput('-')).toBeUndefined()
		expect(parseNumberInput('1,2,3')).toBeUndefined()
		expect(parseNumberInput('abc')).toBeUndefined()
	})

	it('stepPrecision: знаки после запятой у шага', () => {
		expect(stepPrecision(1)).toBe(0)
		expect(stepPrecision(0.25)).toBe(2)
	})

	it('roundToPrecision убирает хвосты плавающей точки', () => {
		expect(roundToPrecision(0.1 + 0.2, 1)).toBe(0.3)
		expect(roundToPrecision(2.675, 0)).toBe(3)
	})

	it('clampNumber: границы необязательны', () => {
		expect(clampNumber(5, 0, 3)).toBe(3)
		expect(clampNumber(-1, 0, 3)).toBe(0)
		expect(clampNumber(2, 0, 3)).toBe(2)
		expect(clampNumber(100)).toBe(100)
	})
})
