/**
 * Unit-тесты для утилит BaseIcon.
 * Проверяют calcIconScale и ICON_SCALE.
 */

import { calcIconScale, ICON_SCALE } from '../model/BaseIcon.utils'

describe('ICON_SCALE', () => {
	it('должен содержать типовые размеры', () => {
		expect(ICON_SCALE.xs).toBe(60)
		expect(ICON_SCALE.sm).toBe(80)
		expect(ICON_SCALE.md).toBe(100)
		expect(ICON_SCALE.lg).toBe(140)
		expect(ICON_SCALE.xl).toBe(180)
	})
})

describe('calcIconScale', () => {
	it('должен вычислять масштаб иконки при parentScale=100', () => {
		expect(calcIconScale('xs', 100)).toBe(60)
		expect(calcIconScale('sm', 100)).toBe(80)
		expect(calcIconScale('md', 100)).toBe(100)
		expect(calcIconScale('lg', 100)).toBe(140)
		expect(calcIconScale('xl', 100)).toBe(180)
	})

	it('должен масштабировать относительно parentScale', () => {
		expect(calcIconScale('sm', 150)).toBe(120)
		expect(calcIconScale('xs', 50)).toBe(30)
	})

	it('должен использовать parentScale=100 по умолчанию', () => {
		expect(calcIconScale('md')).toBe(100)
		expect(calcIconScale('lg')).toBe(140)
	})

	it('должен округлять результат', () => {
		expect(calcIconScale('lg', 33)).toBe(46)
	})

	it('должен возвращать 0 при parentScale=0', () => {
		expect(calcIconScale('md', 0)).toBe(0)
	})
})
