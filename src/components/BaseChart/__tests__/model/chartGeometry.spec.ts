import type { ChartFrame } from '../../types/BaseChart.types'
import { areaPath, bandSlot, barRect, linePath, nearestIndex, tickIndexes, xPosition, yPosition } from '../../model/chart/chartGeometry'

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
		const second = barRect([0, 5], { ...bandSlot(1, 2), index: 1 }, bands)
		expect(second.x).toBeCloseTo(25 + 3.75 + 8.75)
		expect(second.width).toBeCloseTo(8.75)
		expect(second).toMatchObject({ y: 50, height: 50 })
		const single = barRect([0, 10], { ...bandSlot(0, 1), index: 0 }, bands)
		expect(single.x).toBeCloseTo(5)
		expect(single.width).toBeCloseTo(15)
		expect(single).toMatchObject({ y: 0, height: 100 })
	})

	it('место в полосе: доли полосы, у скрытого ряда — нулевая ширина на своём месте, без рядов — как один', () => {
		expect(bandSlot(0, 1).offset).toBeCloseTo(0.2)
		expect(bandSlot(0, 1).width).toBeCloseTo(0.6)
		expect(bandSlot(1, 2).offset).toBeCloseTo(0.15 + 0.35)
		expect(bandSlot(1, 2, true)).toEqual({ offset: bandSlot(1, 2).offset, width: 0 })
		expect(bandSlot(0, 0)).toEqual(bandSlot(0, 1))
	})

	it('рисует отрицательный столбик вниз от основания', () => {
		const frame: ChartFrame = { count: 1, domain: { min: -10, max: 10, ticks: [] }, isBand: true }
		const rect = barRect([0, -5], { ...bandSlot(0, 1), index: 0 }, frame)
		expect(rect.x).toBeCloseTo(20)
		expect(rect.width).toBeCloseTo(60)
		expect(rect).toMatchObject({ y: 50, height: 25 })
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
