import { canInterpolate, easeOutCubic, interpolateValue, isSameValue } from '../tweenMath'

describe('tweenMath', () => {
	it('easeOutCubic: концы и замедление', () => {
		expect(easeOutCubic(0)).toBe(0)
		expect(easeOutCubic(1)).toBe(1)
		expect(easeOutCubic(0.5)).toBe(0.875)
	})

	it('canInterpolate: числа, массивы одной длины, но не смесь', () => {
		expect(canInterpolate(1, 2)).toBe(true)
		expect(canInterpolate([1], [2])).toBe(true)
		expect(canInterpolate([1], [2, 3])).toBe(false)
		expect(canInterpolate(1, [2])).toBe(false)
		expect(canInterpolate([1], 2)).toBe(false)
	})

	it('isSameValue: числа, NaN, массивы', () => {
		expect(isSameValue(1, 1)).toBe(true)
		expect(isSameValue(Number.NaN, Number.NaN)).toBe(true)
		expect(isSameValue(1, [1])).toBe(false)
		expect(isSameValue([1, 2], [1, 2])).toBe(true)
		expect(isSameValue([1, 2], [1, 3])).toBe(false)
		expect(isSameValue([1], [1, 2])).toBe(false)
	})

	it('interpolateValue: числа, массивы, нечисловые точки', () => {
		expect(interpolateValue(0, 10, 0.5)).toBe(5)
		expect(interpolateValue([0, 10], [10, 20], 0.5)).toEqual([5, 15])
		expect(interpolateValue([Number.NaN, 0], [4, Number.POSITIVE_INFINITY], 0.5)).toEqual([4, Number.POSITIVE_INFINITY])
	})
})
