import type { FlowPoint } from '../../types/data/flowData.types'
import { guardConsole } from '../helpers/consoleGuard.test-utils'
import { cachedRouteTable, isRouteInView, readRoute } from '../../model/scenario/particles/routeSampler'

guardConsole()

const line: FlowPoint[] = [
	{ x: 0, y: 0 },
	{ x: 100, y: 0 },
]
const bend: FlowPoint[] = [
	{ x: 0, y: 0 },
	{ x: 60, y: 0 },
	{ x: 60, y: 80 },
]

function at(points: FlowPoint[], distance: number): FlowPoint {
	const table = cachedRouteTable(points)
	const out = { x: -1, y: -1 }
	readRoute(table!, distance, out)
	return out
}

describe('таблица маршрута', () => {
	it('меряет длину ломаной и режет её шагом 6 px', () => {
		const table = cachedRouteTable(line)
		expect(table?.length).toBe(100)
		expect(table?.segments).toBe(17)
		expect(table?.xs).toHaveLength(18)
		expect(cachedRouteTable(bend)?.length).toBe(140)
	})

	it('короткий маршрут — один отрезок', () => {
		expect(
			cachedRouteTable([
				{ x: 0, y: 0 },
				{ x: 3, y: 0 },
			])?.segments,
		).toBe(1)
	})

	it('границы маршрута — по опорным точкам', () => {
		expect(cachedRouteTable(bend)?.bounds).toEqual({ x: 0, y: 0, width: 60, height: 80 })
	})

	it('меньше двух точек или нулевая длина — null', () => {
		expect(cachedRouteTable([])).toBeNull()
		expect(cachedRouteTable([{ x: 5, y: 5 }])).toBeNull()
		expect(
			cachedRouteTable([
				{ x: 5, y: 5 },
				{ x: 5, y: 5 },
			]),
		).toBeNull()
	})

	it('точки совпадающих подряд вершин не ломают таблицу', () => {
		const table = cachedRouteTable([
			{ x: 0, y: 0 },
			{ x: 0, y: 0 },
			{ x: 50, y: 0 },
		])
		expect(table?.length).toBe(50)
		expect(
			at(
				[
					{ x: 0, y: 0 },
					{ x: 0, y: 0 },
					{ x: 50, y: 0 },
				],
				25,
			).x,
		).toBeCloseTo(25, 0)
	})
})

describe('readRoute', () => {
	it('середина, начало и конец прямой', () => {
		expect(at(line, 50).x).toBeCloseTo(50, 3)
		expect(at(line, 0)).toEqual({ x: 0, y: 0 })
		expect(at(line, 100).x).toBeCloseTo(100, 3)
	})

	it('расстояние за пределами прижимается к краям', () => {
		expect(at(line, -30)).toEqual({ x: 0, y: 0 })
		expect(at(line, 999).x).toBeCloseTo(100, 3)
	})

	it('идёт по излому: после угла растёт y', () => {
		const point = at(bend, 100)
		expect(point.x).toBeCloseTo(60, 0)
		expect(point.y).toBeCloseTo(40, 0)
	})

	it('пишет в переданную точку, не создавая новую', () => {
		const out = { x: 0, y: 0 }
		readRoute(cachedRouteTable(line)!, 10, out)
		expect(out.x).toBeCloseTo(10, 3)
	})
})

describe('cachedRouteTable', () => {
	it('для одного массива точек отдаёт одну и ту же таблицу, для другого — свою', () => {
		const first = cachedRouteTable(line)
		expect(first).not.toBeNull()
		expect(cachedRouteTable(line)).toBe(first)
		expect(cachedRouteTable([...line])).not.toBe(first)
	})

	it('отсутствие таблицы тоже запоминается', () => {
		const empty: FlowPoint[] = [{ x: 1, y: 1 }]
		expect(cachedRouteTable(empty)).toBeNull()
		expect(cachedRouteTable(empty)).toBeNull()
	})
})

describe('isRouteInView', () => {
	const table = cachedRouteTable(bend)!

	it('пересекает или касается видимой области — в виде', () => {
		expect(isRouteInView(table, { x: 10, y: 10, width: 20, height: 20 })).toBe(true)
		expect(isRouteInView(table, { x: 60, y: 80, width: 10, height: 10 })).toBe(true)
		expect(isRouteInView(table, { x: -50, y: -50, width: 60, height: 60 })).toBe(true)
	})

	it('целиком снаружи с любой стороны — не в виде', () => {
		expect(isRouteInView(table, { x: 100, y: 0, width: 50, height: 50 })).toBe(false)
		expect(isRouteInView(table, { x: -100, y: 0, width: 50, height: 50 })).toBe(false)
		expect(isRouteInView(table, { x: 0, y: 200, width: 50, height: 50 })).toBe(false)
		expect(isRouteInView(table, { x: 0, y: -100, width: 50, height: 50 })).toBe(false)
	})
})
