import '@testing-library/jest-dom/vitest'
import { calcFillStyle, calcThumbStyle, snapToStep, toPercent } from '../rangeUtils'

describe('rangeUtils', () => {
	describe('toPercent', () => {
		it('рассчитывает процент в середине диапазона', () => {
			expect(toPercent({ min: 0, max: 100, value: 50 })).toBe(50)
		})

		it('возвращает 0 для минимального значения', () => {
			expect(toPercent({ min: 0, max: 100, value: 0 })).toBe(0)
		})

		it('возвращает 100 для максимального значения', () => {
			expect(toPercent({ min: 0, max: 100, value: 100 })).toBe(100)
		})

		it('возвращает 0 при нулевом диапазоне', () => {
			expect(toPercent({ min: 50, max: 50, value: 50 })).toBe(0)
		})

		it('работает со смещённым минимумом', () => {
			expect(toPercent({ min: 10, max: 20, value: 15 })).toBe(50)
		})
	})

	describe('snapToStep', () => {
		it('привязывает значение к ближайшему шагу', () => {
			expect(snapToStep({ value: 7, min: 0, max: 10, step: 5 })).toBe(5)
		})

		it('округляет вверх к ближайшему шагу', () => {
			expect(snapToStep({ value: 8, min: 0, max: 10, step: 5 })).toBe(10)
		})

		it('ограничивает минимумом', () => {
			expect(snapToStep({ value: -3, min: 0, max: 10, step: 5 })).toBe(0)
		})

		it('ограничивает максимумом', () => {
			expect(snapToStep({ value: 12, min: 0, max: 10, step: 5 })).toBe(10)
		})

		it('работает с дробным шагом', () => {
			expect(snapToStep({ value: 0.12, min: 0, max: 1, step: 0.1 })).toBeCloseTo(0.1)
		})

		it('округляет результат до точности шага без хвостов плавающей точки', () => {
			expect(snapToStep({ value: 0.3, min: 0, max: 1, step: 0.1 })).toBe(0.3)
			expect(snapToStep({ value: 0.7, min: 0, max: 1, step: 0.1 })).toBe(0.7)
			expect(snapToStep({ value: 0.6, min: 0, max: 1, step: 0.05 })).toBe(0.6)
		})

		it('учитывает точность смещённого минимума', () => {
			expect(snapToStep({ value: 0.35, min: 0.05, max: 1, step: 0.1 })).toBe(0.35)
		})

		it('учитывает шаг в экспоненциальной записи', () => {
			expect(snapToStep({ value: 3e-7, min: 0, max: 1, step: 1e-7 })).toBe(3e-7)
		})
	})

	describe('calcFillStyle', () => {
		it('рассчитывает стиль заливки от начала', () => {
			expect(calcFillStyle(60)).toEqual({ left: '0', width: '60%' })
		})

		it('рассчитывает стиль заливки между двумя точками', () => {
			expect(calcFillStyle(30, 70)).toEqual({ left: '30%', width: '40%' })
		})
	})

	describe('calcThumbStyle', () => {
		it('рассчитывает позицию ползунка', () => {
			expect(calcThumbStyle(75)).toEqual({ left: '75%' })
		})
	})

	it('возвращает отрицательный процент когда значение меньше минимума', () => {
		expect(toPercent({ min: 0, max: 100, value: -25 })).toBe(-25)
	})

	it('рассчитывает стиль заливки когда secondPercent = 0', () => {
		expect(calcFillStyle(0, 0)).toEqual({ left: '0%', width: '0%' })
	})
})
