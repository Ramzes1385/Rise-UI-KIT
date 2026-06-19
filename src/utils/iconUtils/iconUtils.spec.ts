/**
 * Unit-тесты для iconUtils.
 * Покрывают: ICON_SCALE, calcIconScale.
 */

import { describe, it, expect } from 'vitest'
import { calcIconScale, ICON_SCALE } from './iconUtils'

describe('iconUtils', () => {
	describe('ICON_SCALE', () => {
		it('содержит все размеры', () => {
			expect(ICON_SCALE.xs).toBe(60)
			expect(ICON_SCALE.sm).toBe(80)
			expect(ICON_SCALE.md).toBe(100)
			expect(ICON_SCALE.lg).toBe(140)
			expect(ICON_SCALE.xl).toBe(180)
		})
	})

	describe('calcIconScale', () => {
		it('возвращает базовый масштаб для md без parentScale', () => {
			expect(calcIconScale('md')).toBe(100)
		})

		it('возвращает масштаб xs по умолчанию', () => {
			expect(calcIconScale('xs')).toBe(60)
		})

		it('возвращает масштаб xl по умолчанию', () => {
			expect(calcIconScale('xl')).toBe(180)
		})

		it('масштабирует с учётом parentScale', () => {
			expect(calcIconScale('md', 200)).toBe(200)
		})

		it('масштабирует xs с parentScale 50', () => {
			expect(calcIconScale('xs', 50)).toBe(30)
		})

		it('корректно округляет дробные результаты', () => {
			expect(calcIconScale('xs', 33)).toBe(20)
		})

		it('возвращает 0 при parentScale 0', () => {
			expect(calcIconScale('md', 0)).toBe(0)
		})
	})
})
