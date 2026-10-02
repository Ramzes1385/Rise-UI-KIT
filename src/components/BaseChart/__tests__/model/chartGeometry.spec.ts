import type { ChartFrame } from '../../types/BaseChart.types'
import { areaPath, barRect, linePath, nearestIndex, tickIndexes, xPosition, yPosition } from '../../model/chart/chartGeometry'

const domain = { min: 0, max: 10, ticks: [0, 5, 10] }
const points: ChartFrame = { count: 3, domain, isBand: false }
const bands: ChartFrame = { count: 4, domain, isBand: true }

describe('геометрия графика', () => {
	it('ставит точки от края до края, полосы — серединами', () => {
		expect([0, 1, 2].map(index => xPosition(index, points))).toEqual([0, 50, 100])
		expect(xPosition(0, { ...points, count: 1 })).toBe(50)
		expect(xPosition(1, bands)).toBe(37.5)
	})

	it('переводит значение в долю высоты сверху', () => {
		expect(yPosition(10, points)).toBe(0)
		expect(yPosition(0, points)).toBe(100)
		expect(yPosition(2.5, points)).toBe(75)
	})

	it('рисует линию с разрывами и одиночную точку', () => {
		expect(linePath([[0, 0], [0, 10], null], points)).toBe('M0.00 100.00 L50.00 0.00')
		expect(linePath([[0, 5], null, [0, 10]], points)).toBe('M0.00 50.00 L0.00 50.00 M100.00 0.00 L100.00 0.00')
		expect(linePath([null, null, null], points)).toBe('')
	})

	it('рисует область от основания отрезка', () => {
		expect(
			areaPath(
				[
					[0, 10],
					[5, 10],
				],
				{ ...points, count: 2 },
			),
		).toBe('M0.00 0.00 L100.00 0.00 L100.00 50.00 L0.00 100.00 Z')
		expect(areaPath([null, [0, 5], null], points)).toBe('M50.00 50.00 L50.00 100.00 Z')
	})

	it('делит полосу между рядами группы и сужает одиночный столбик', () => {
		expect(barRect([0, 5], { index: 1, order: 1, total: 2 }, bands)).toEqual({ x: 25 + 3.75 + 8.75, y: 50, width: 8.75, height: 50 })
		expect(barRect([0, 10], { index: 0, order: 0, total: 1 }, bands)).toEqual({ x: 5, y: 0, width: 15, height: 100 })
	})

	it('рисует отрицательный столбик вниз от основания', () => {
		const frame: ChartFrame = { count: 1, domain: { min: -10, max: 10, ticks: [] }, isBand: true }
		expect(barRect([0, -5], { index: 0, order: 0, total: 1 }, frame)).toEqual({ x: 20, y: 50, width: 60, height: 25 })
	})

	it('находит ближайшую точку и полосу, зажимая края', () => {
		expect(nearestIndex(0.3, points)).toBe(1)
		expect(nearestIndex(0.2, points)).toBe(0)
		expect(nearestIndex(-1, points)).toBe(0)
		expect(nearestIndex(2, points)).toBe(2)
		expect(nearestIndex(0.3, bands)).toBe(1)
		expect(nearestIndex(1, bands)).toBe(3)
	})

	it('прореживает подписи по ширине', () => {
		expect(tickIndexes(10, 4)).toEqual([0, 3, 6, 9])
		expect(tickIndexes(3, 6)).toEqual([0, 1, 2])
		expect(tickIndexes(3, 0)).toEqual([0])
		expect(tickIndexes(0, 6)).toEqual([])
	})
})
