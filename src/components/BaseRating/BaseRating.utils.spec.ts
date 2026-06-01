/**
 * Unit-тесты для математики BaseRating.
 * Граничные значения, округление к шагу, заливка звезды.
 */

import { describe, expect, it } from 'vitest'

import { rawValueFromPointer, snapRating, starFillPercent, valueFromPointer } from './BaseRating.utils'

describe('BaseRating utils', () => {
	describe('snapRating', () => {
		it('округляет к ближайшему целому при step=1', () => {
			expect(snapRating(3.4, 1, 5)).toBe(3)
			expect(snapRating(3.6, 1, 5)).toBe(4)
		})

		it('округляет к половинкам при step=0.5', () => {
			expect(snapRating(3.24, 0.5, 5)).toBe(3)
			expect(snapRating(3.26, 0.5, 5)).toBe(3.5)
		})

		it('округляет к десятым при step=0.1', () => {
			expect(snapRating(4.27, 0.1, 5)).toBe(4.3)
		})

		it('зажимает значение в диапазоне [0, max]', () => {
			expect(snapRating(-2, 0.5, 5)).toBe(0)
			expect(snapRating(99, 0.5, 5)).toBe(5)
		})
	})

	describe('valueFromPointer', () => {
		it('возвращает целую звезду при клике по правой половине, step=1', () => {
			expect(valueFromPointer({ star: 3, ratio: 0.9, step: 1, max: 5 })).toBe(3)
		})

		it('возвращает половину при клике по левой половине, step=0.5', () => {
			expect(valueFromPointer({ star: 3, ratio: 0.2, step: 0.5, max: 5 })).toBe(2.5)
		})

		it('возвращает полную звезду при клике по правой половине, step=0.5', () => {
			expect(valueFromPointer({ star: 3, ratio: 0.8, step: 0.5, max: 5 })).toBe(3)
		})

		it('не опускается ниже одного шага (нет нулевого выбора кликом)', () => {
			expect(valueFromPointer({ star: 1, ratio: 0, step: 0.5, max: 5 })).toBe(0.5)
		})

		it('зажимает ratio за пределами [0,1]', () => {
			expect(valueFromPointer({ star: 2, ratio: 1.5, step: 1, max: 5 })).toBe(2)
			expect(valueFromPointer({ star: 2, ratio: -0.5, step: 1, max: 5 })).toBe(1)
		})
	})

	describe('starFillPercent', () => {
		it('возвращает 100 для полностью заполненной звезды', () => {
			expect(starFillPercent(2, 3)).toBe(100)
		})

		it('возвращает 0 для пустой звезды', () => {
			expect(starFillPercent(4, 2)).toBe(0)
		})

		it('возвращает частичную заливку для дробного значения', () => {
			expect(starFillPercent(4, 3.3)).toBeCloseTo(30, 5)
		})

		it('зажимает заливку в [0, 100]', () => {
			expect(starFillPercent(1, 5)).toBe(100)
			expect(starFillPercent(5, 0)).toBe(0)
		})
	})

	describe('rawValueFromPointer', () => {
		it('возвращает непрерывное значение без привязки к шагу', () => {
			expect(rawValueFromPointer(3, 0.27, 5)).toBe(2.27)
			expect(rawValueFromPointer(4, 0.73, 5)).toBe(3.73)
		})

		it('возвращает 0 при курсоре в самом начале первой звезды', () => {
			expect(rawValueFromPointer(1, 0, 5)).toBe(0)
		})

		it('зажимает ratio за пределами [0,1]', () => {
			expect(rawValueFromPointer(2, 1.5, 5)).toBe(2)
			expect(rawValueFromPointer(2, -0.5, 5)).toBe(1)
		})

		it('зажимает значение по max', () => {
			expect(rawValueFromPointer(5, 1, 5)).toBe(5)
		})
	})
})
