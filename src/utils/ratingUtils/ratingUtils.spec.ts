/**
 * Unit-тесты для ratingUtils.
 * Покрывают: snapRating, valueFromPointer, rawValueFromPointer, starFillPercent.
 */

import { describe, it, expect } from 'vitest'
import {
	rawValueFromPointer,
	snapRating,
	starFillPercent,
	valueFromPointer,
} from './ratingUtils'

describe('ratingUtils', () => {
	describe('snapRating', () => {
		it('привязывает значение к ближайшему шагу', () => {
			expect(snapRating(0.7, 0.5, 5)).toBe(0.5)
		})

		it('округляет вверх при >= половины шага', () => {
			expect(snapRating(0.8, 0.5, 5)).toBe(1)
		})

		it('ограничивает значение нулём снизу', () => {
			expect(snapRating(-1, 0.5, 5)).toBe(0)
		})

		it('ограничивает значение максимумом сверху', () => {
			expect(snapRating(10, 0.5, 5)).toBe(5)
		})

		it('работает с шагом 1', () => {
			expect(snapRating(3.2, 1, 5)).toBe(3)
			expect(snapRating(3.6, 1, 5)).toBe(4)
		})

		it('работает с шагом 0.25', () => {
			expect(snapRating(1.37, 0.25, 5)).toBe(1.25)
		})

		it('возвращает 0 для нулевого значения', () => {
			expect(snapRating(0, 0.5, 5)).toBe(0)
		})

		it('возвращает max для значения равного max', () => {
			expect(snapRating(5, 0.5, 5)).toBe(5)
		})
	})

	describe('valueFromPointer', () => {
		it('возвращает значение для середины второй звезды', () => {
			const result = valueFromPointer({ star: 2, ratio: 0.5, step: 0.5, max: 5 })
			expect(result).toBe(1.5)
		})

		it('ограничивает ratio снизу нулём', () => {
			const result = valueFromPointer({ star: 1, ratio: -0.5, step: 0.5, max: 5 })
			expect(result).toBe(0.5)
		})

		it('ограничивает ratio сверху единицей', () => {
			const result = valueFromPointer({ star: 1, ratio: 1.5, step: 0.5, max: 5 })
			expect(result).toBe(1)
		})

		it('ограничивает значение максимумом', () => {
			const result = valueFromPointer({ star: 5, ratio: 1, step: 0.5, max: 5 })
			expect(result).toBe(5)
		})

		it('ограничивает значение минимумом (step)', () => {
			const result = valueFromPointer({ star: 1, ratio: 0, step: 0.5, max: 5 })
			expect(result).toBe(0.5)
		})

		it('работает с шагом 1', () => {
			const result = valueFromPointer({ star: 3, ratio: 0.3, step: 1, max: 5 })
			expect(result).toBe(3)
		})

		it('работает с ratio = 0', () => {
			const result = valueFromPointer({ star: 2, ratio: 0, step: 0.5, max: 5 })
			expect(result).toBe(1)
		})

		it('работает с ratio = 1', () => {
			const result = valueFromPointer({ star: 2, ratio: 1, step: 0.5, max: 5 })
			expect(result).toBe(2)
		})
	})

	describe('rawValueFromPointer', () => {
		it('возвращает непрерывное значение для середины звезды', () => {
			expect(rawValueFromPointer(3, 0.5, 5)).toBe(2.5)
		})

		it('ограничивает ratio нулём снизу', () => {
			expect(rawValueFromPointer(1, -0.5, 5)).toBe(0)
		})

		it('ограничивает ratio единицей сверху', () => {
			expect(rawValueFromPointer(1, 1.5, 5)).toBe(1)
		})

		it('ограничивает значение нулём снизу', () => {
			expect(rawValueFromPointer(1, 0, 5)).toBe(0)
		})

		it('ограничивает значение максимумом сверху', () => {
			expect(rawValueFromPointer(5, 1, 3)).toBe(3)
		})

		it('возвращает 0 для ratio = 0 и star = 1', () => {
			expect(rawValueFromPointer(1, 0, 5)).toBe(0)
		})

		it('возвращает max для полной последней звезды', () => {
			expect(rawValueFromPointer(5, 1, 5)).toBe(5)
		})

		it('работает с дробными значениями', () => {
			expect(rawValueFromPointer(2, 0.75, 5)).toBe(1.75)
		})
	})

	describe('starFillPercent', () => {
		it('возвращает 100% для полностью заполненной звезды', () => {
			expect(starFillPercent(1, 1)).toBe(100)
		})

		it('возвращает 0% для пустой звезды', () => {
			expect(starFillPercent(1, 0)).toBe(0)
		})

		it('возвращает 50% для половины звезды', () => {
			expect(starFillPercent(1, 0.5)).toBe(50)
		})

		it('возвращает 0% если значение ниже звезды', () => {
			expect(starFillPercent(3, 1.5)).toBe(0)
		})

		it('возвращает 100% если значение выше звезды', () => {
			expect(starFillPercent(2, 4)).toBe(100)
		})

		it('корректно считает для третьей звезды', () => {
			expect(starFillPercent(3, 2.7)).toBe(70)
		})

		it('округляет до десятых', () => {
			expect(starFillPercent(1, 0.333)).toBe(33.3)
		})

		it('ограничивает fill единицей', () => {
			expect(starFillPercent(1, 2)).toBe(100)
		})

		it('ограничивает fill нулём', () => {
			expect(starFillPercent(2, 0.5)).toBe(0)
		})
	})
})
