import { areaPath, barHeight, nearestBarIndex, nearestIndex, sparklinePoints } from '../../model/chart/sparklineGeometry'

describe('геометрия мини-графика', () => {
	it('точки, ровная линия и подписи', () => {
		expect(sparklinePoints([1, 1], { height: 20, labels: ['a'] })).toEqual([
			{ x: 0, y: 10, value: 1, label: 'a' },
			{ x: 100, y: 10, value: 1, label: '' },
		])
	})

	it('пустая заливка, высота столбика и ближайшая точка', () => {
		expect(areaPath([], 20)).toBe('')
		expect(barHeight(0, [0, 0])).toBe(4)
		expect(nearestIndex(150, { left: 100, width: 100 }, 5)).toBe(2)
		expect(nearestIndex(-50, { left: 0, width: 100 }, 5)).toBe(0)
		expect(nearestIndex(500, { left: 0, width: 100 }, 5)).toBe(4)
		expect(nearestIndex(10, { left: 0, width: 0 }, 5)).toBe(0)
		expect(nearestIndex(10, { left: 0, width: 100 }, 1)).toBe(0)
	})

	it('ближайший столбик по центру: на ничьей — первый, без столбиков — первый', () => {
		const bars = [
			{ left: 0, width: 20 },
			{ left: 22, width: 20 },
			{ left: 44, width: 20 },
		]
		expect(nearestBarIndex(60, bars)).toBe(2)
		expect(nearestBarIndex(32, bars)).toBe(1)
		expect(nearestBarIndex(21, bars)).toBe(0)
		expect(nearestBarIndex(22, bars)).toBe(1)
		expect(nearestBarIndex(16, bars)).toBe(0)
		expect(nearestBarIndex(5, [])).toBe(0)
	})
})
