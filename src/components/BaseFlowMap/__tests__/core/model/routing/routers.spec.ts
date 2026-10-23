import { curvedRouter } from '../../../../model/routing/curved'
import { straightRouter } from '../../../../model/routing/straight'
import { orthogonalRouter } from '../../../../model/routing/orthogonal'
import { createRouterRegistry } from '../../../../model/routing/registry'
import type { FlowLayoutEdge } from '../../../../types/api/flowLayout.types'
import type { FlowPoint, FlowRect } from '../../../../types/data/flowData.types'

const edge: FlowLayoutEdge = { id: 'e', kind: 'default', source: 'a', target: 'b' }
const box = (x: number, y: number): FlowRect => ({ x, y, width: 100, height: 50 })
const source = box(0, 0)

function isAxial(points: readonly FlowPoint[]): boolean {
	return points.every((point, index) => index === 0 || point.x === points[index - 1].x || point.y === points[index - 1].y)
}

function isDistinct(points: readonly FlowPoint[]): boolean {
	return points.every((point, index) => index === 0 || point.x !== points[index - 1].x || point.y !== points[index - 1].y)
}

describe('orthogonal', () => {
	const targets: Record<string, FlowRect> = {
		справа: box(300, 0),
		'справа и ниже': box(300, 200),
		слева: box(-300, 0),
		ниже: box(0, 300),
		выше: box(0, -300),
		'вплотную справа': box(110, 0),
		'вплотную снизу': box(0, 60),
		'наискосок вверх': box(-250, -250),
	}

	it.each(Object.entries(targets).map(([name, target]) => ({ name, target })))('отрезки осевые: цель $name', ({ target }) => {
		const points = orthogonalRouter.route(edge, { source, target, obstacles: [] })
		expect(isAxial(points)).toBe(true)
		expect(isDistinct(points)).toBe(true)
		expect(points.length).toBeGreaterThanOrEqual(2)
	})

	it.each([
		{ out: 'top', into: 'top' },
		{ out: 'bottom', into: 'bottom' },
		{ out: 'left', into: 'left' },
		{ out: 'right', into: 'right' },
		{ out: 'top', into: 'left' },
		{ out: 'right', into: 'bottom' },
		{ out: 'left', into: 'top' },
		{ out: 'bottom', into: 'right' },
		{ out: 'right', into: 'left' },
		{ out: 'left', into: 'right' },
		{ out: 'top', into: 'bottom' },
		{ out: 'bottom', into: 'top' },
	] as const)('осевые отрезки при сторонах $out → $into', ({ out, into }) => {
		for (const target of [box(300, 200), box(-300, -200), box(300, -200), box(-300, 200), box(0, 120)]) {
			const points = orthogonalRouter.route({ ...edge, sourceSide: out, targetSide: into }, { source, target, obstacles: [] })
			expect(isAxial(points), `${out}→${into}`).toBe(true)
		}
	})

	it('начало и конец — на сторонах узлов', () => {
		const target = box(300, 0)
		const points = orthogonalRouter.route(edge, { source, target, obstacles: [] })
		expect(points[0]).toEqual({ x: 100, y: 25 })
		expect(points[points.length - 1]).toEqual({ x: 300, y: 25 })
		expect(points).toHaveLength(2)
	})

	it('каналы раздвигают параллельные связи', () => {
		const target = box(300, 200)
		const mid = orthogonalRouter.route(edge, { source, target, obstacles: [], channel: 0 } as never)
		const shifted = orthogonalRouter.route(edge, { source, target, obstacles: [], channel: 2 } as never)
		expect(shifted).not.toEqual(mid)
		expect(isAxial(shifted)).toBe(true)
	})

	it('заданные точки используются как есть, лишние точки на прямой убираются', () => {
		const points = orthogonalRouter.route(edge, {
			source,
			target: box(300, 0),
			obstacles: [],
			points: [
				{ x: 150, y: 25 },
				{ x: 200, y: 25 },
			],
		})
		expect(points).toEqual([
			{ x: 100, y: 25 },
			{ x: 300, y: 25 },
		])
		expect(orthogonalRouter.route(edge, { source, target: box(300, 0), obstacles: [], points: [] })).toHaveLength(2)
	})
})

describe('straight', () => {
	it('прямая между узлами по границам; с точками — через них', () => {
		const direct = straightRouter.route(edge, { source, target: box(300, 0), obstacles: [] })
		expect(direct).toEqual([
			{ x: 100, y: 25 },
			{ x: 300, y: 25 },
		])
		const through = straightRouter.route(edge, { source, target: box(300, 0), obstacles: [], points: [{ x: 200, y: 200 }] })
		expect(through).toHaveLength(3)
		expect(through[1]).toEqual({ x: 200, y: 200 })
	})
})

describe('curved', () => {
	it('кривая начинается у источника и заканчивается у цели', () => {
		const points = curvedRouter.route(edge, { source, target: box(300, 100), obstacles: [] })
		expect(points[0]).toEqual({ x: 100, y: 25 })
		expect(points[points.length - 1]).toEqual({ x: 300, y: 125 })
		expect(points.length).toBeGreaterThan(10)
	})

	it('перед узлом на пути кривая уходит аркой вниз', () => {
		const blocker = box(150, 0)
		const arch = curvedRouter.route(edge, { source, target: box(400, 0), obstacles: [blocker] })
		expect(Math.max(...arch.map(point => point.y))).toBeGreaterThan(50)
		const direct = curvedRouter.route(edge, { source, target: box(400, 0), obstacles: [] })
		expect(Math.max(...direct.map(point => point.y))).toBeLessThan(26)
	})

	it('заданные стороны отключают арку; без obstacles арки нет', () => {
		const blocker = box(150, 0)
		const fixed = curvedRouter.route({ ...edge, sourceSide: 'right' }, { source, target: box(400, 0), obstacles: [blocker] })
		expect(Math.max(...fixed.map(point => point.y))).toBeLessThan(26)
		const noList = curvedRouter.route(edge, { source, target: box(400, 0) } as never)
		expect(noList[0]).toEqual({ x: 100, y: 25 })
		const vertical = curvedRouter.route(edge, { source, target: box(0, 400), obstacles: [box(0, 150)] })
		expect(Math.max(...vertical.map(point => point.x))).toBeLessThan(101)
	})

	it('заданные точки сглаживаются сплайном через них', () => {
		const via = { x: 200, y: 200 }
		const points = curvedRouter.route(edge, { source, target: box(300, 0), obstacles: [], points: [via] })
		expect(points[0]).toEqual({ x: 100, y: 25 })
		expect(points.some(point => Math.abs(point.x - via.x) < 1e-6 && Math.abs(point.y - via.y) < 1e-6)).toBe(true)
		const two = curvedRouter.route(edge, { source, target: box(300, 0), obstacles: [], points: [via, { x: 250, y: 150 }] })
		expect(two.length).toBeGreaterThan(points.length)
	})
})

describe('реестр маршрутизаторов', () => {
	it('встроенные straight, curved, orthogonal; свои добавляются, повтор id предупреждает', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const mine = { id: 'mine', route: () => [] }
		const registry = createRouterRegistry([mine])
		expect([...registry.keys()]).toEqual(['straight', 'curved', 'orthogonal', 'mine'])
		expect(warn).not.toHaveBeenCalled()
		createRouterRegistry([{ id: 'curved', route: () => [] }])
		expect(warn).toHaveBeenCalledTimes(1)
		warn.mockRestore()
	})
})
