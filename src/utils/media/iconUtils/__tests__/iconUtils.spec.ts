import { describe, it, expect } from 'vitest'
import { calcDerivedScale, calcIconScale, ICON_SCALE } from '../iconUtils'

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

		it('фиксирует размер, когда результат при масштабированном родителе ровно 100', () => {
			expect(calcIconScale('sm', 125)).toBe(100.01)
			expect(calcIconScale('xs', 167)).toBe(100.01)
		})

		it('не фиксирует размер при родителе 100: md остаётся 100 (наследование)', () => {
			expect(calcIconScale('md', 100)).toBe(100)
		})

		it('не трогает результат, отличный от 100', () => {
			expect(calcIconScale('sm', 150)).toBe(120)
		})

		it('возвращает 0 при parentScale 0', () => {
			expect(calcIconScale('md', 0)).toBe(0)
		})
	})

	describe('calcDerivedScale', () => {
		it('умножает масштаб родителя на долю без округления', () => {
			expect(calcDerivedScale(100, 0.5)).toBe(50)
			expect(calcDerivedScale(150, 0.875)).toBe(131.25)
		})

		it('фиксирует размер, когда результат при масштабированном родителе ровно 100', () => {
			expect(calcDerivedScale(200, 0.5)).toBe(100.01)
		})

		it('фиксирует и результат, который из-за дробей чуть отличается от 100', () => {
			expect(calcDerivedScale(800 / 7, 0.875)).toBe(100.01)
		})

		it('при родителе 100 и доле 1 остаётся наследованием', () => {
			expect(calcDerivedScale(100, 1)).toBe(100)
		})

		it('не трогает результат, отличный от 100', () => {
			expect(calcDerivedScale(120, 0.5)).toBe(60)
			expect(calcDerivedScale(101, 1)).toBe(101)
		})
	})
})
