import { areaPath, barHeight, nearestIndex, sparklinePoints } from '../../model/chart/sparklineGeometry'

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
})
