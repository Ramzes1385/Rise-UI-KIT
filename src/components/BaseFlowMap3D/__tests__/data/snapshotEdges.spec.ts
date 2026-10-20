import { buildEdgeItems } from '../../model/data/snapshotEdges'
import { computeLevels } from '../../model/data/snapshotLevels'
import { buildNodeItems } from '../../model/data/snapshotNodes'
import { buildGroupItems } from '../../model/data/snapshotGroups'
import type { FlowMap3DLevels } from '../../types/internal/flowMap3dInternal.types'
import { edge, fakeModel, group, node, rect, route } from '../helpers/fakeModel.test-utils'

const PLAN = { unit: 40, origin: { x: 0, z: 0 } }
const PAIR = {
	nodes: [node('a'), node('b')],
	rects: { a: rect(0, 0, 80, 40), b: rect(400, 0, 80, 40) },
}

function build(parts: Parameters<typeof fakeModel>[0], options: { isLayered?: boolean; levels?: FlowMap3DLevels } = {}) {
	const model = fakeModel(parts)
	const levels = options.levels ?? computeLevels(model, { isLayered: options.isLayered ?? false, gap: 2 })
	const nodes = buildNodeItems(model, PLAN, levels)
	const groups = buildGroupItems(model, PLAN, levels)
	return buildEdgeItems(model, {
		nodes: new Map(nodes.map(item => [item.id, item])),
		groups: new Map(groups.map(item => [item.id, item])),
		levels,
		plan: PLAN,
		reach: 0.5,
	})
}

describe('buildEdgeItems: состав', () => {
	it('пропускает связи без маршрута, с одной точкой и с неизвестным концом', () => {
		const items = build({
			...PAIR,
			edges: [edge('none', 'a', 'b'), edge('short', 'a', 'b'), edge('ghost', 'a', 'z'), edge('ok', 'a', 'b')],
			routes: { short: route([0, 0]), ghost: route([0, 0], [40, 0]), ok: route([40, 20], [400, 20]) },
		})
		expect(items.map(item => item.id)).toEqual(['ok'])
	})

	it('берёт стиль из вида связи: без частиц у пунктира-точек, цвет и подпись', () => {
		const [solid] = build({ ...PAIR, edges: [edge('e', 'a', 'b', { label: 'Заказ' })], routes: { e: route([40, 20], [440, 20]) } })
		expect(solid).toMatchObject({ shape: 'ribbon', height: 1.5, stroke: 'solid', hasParticles: true, label: 'Заказ' })
		const [dotted] = build({
			...PAIR,
			edgeKind: { stroke: 'dotted', color: 'var(--x)' },
			edges: [edge('e', 'a', 'b')],
			routes: { e: route([40, 20], [440, 20]) },
		})
		expect(dotted).toMatchObject({ stroke: 'dotted', color: 'var(--x)', hasParticles: false, label: undefined, labelSpot: null })
	})

	it('подпись встаёт на самый длинный горизонтальный отрезок; у вертикального пути места нет', () => {
		const [long] = build({
			...PAIR,
			edges: [edge('e', 'a', 'b', { label: 'Заказ' })],
			routes: { e: route([40, 20], [40, 220], [440, 220], [440, 20]) },
		})
		expect(long.labelSpot).not.toBeNull()
		expect(long.labelSpot?.angle).toBeCloseTo(0)
		const [flat] = build({
			nodes: [node('a'), node('b')],
			rects: { a: rect(0, 0, 80, 40), b: rect(0, 0, 80, 40) },
			edges: [edge('e', 'a', 'b', { label: 'Заказ' })],
			routes: { e: route([40, 20], [40, 20]) },
		})
		expect(flat.labelSpot).toBeNull()
	})
})

describe('buildEdgeItems: путь', () => {
	it('достраивает хвосты от центров узлов, если маршрут начинается дальше охвата, и не трогает близкие концы', () => {
		const [far] = build({ ...PAIR, edges: [edge('e', 'a', 'b')], routes: { e: route([120, 20], [360, 20]) } })
		expect(far.points).toHaveLength(4)
		const [near] = build({ ...PAIR, edges: [edge('e', 'a', 'b')], routes: { e: route([40, 20], [440, 20]) } })
		expect(near.points).toHaveLength(2)
		const [onCenter] = build({ ...PAIR, edges: [edge('e', 'a', 'b')], routes: { e: route([40, 20], [440, 20]) } })
		expect(onCenter.points[0].x).toBeCloseTo(1)
	})

	it('скругляет углы ломаной от трёх до восьми точек и не трогает длинные', () => {
		const three = build({ ...PAIR, edges: [edge('e', 'a', 'b')], routes: { e: route([40, 20], [240, 20], [240, 220]) } })[0]
		expect(three.points.length).toBeGreaterThan(3)
		const flat = Array.from({ length: 9 }, (_, index): [number, number] => [40 + index * 50, 20 + (index % 2) * 40])
		const nine = build({ ...PAIR, edges: [edge('e', 'a', 'b')], routes: { e: route(...flat) } })[0]
		expect(nine.points).toHaveLength(9)
	})

	it('совпавшие соседние точки не ломают скругление', () => {
		const [item] = build({
			...PAIR,
			edges: [edge('e', 'a', 'b')],
			routes: { e: route([40, 20], [240, 20], [240, 20], [440, 20]) },
		})
		expect(item.points.every(point => Number.isFinite(point.x) && Number.isFinite(point.z))).toBe(true)
	})

	it('дуга идёт над землёй с высотой связи или по умолчанию', () => {
		const make = (model3d: { shape: 'arc'; height?: number }) =>
			build({ ...PAIR, edges: [edge('e', 'a', 'b', { model3d })], routes: { e: route([40, 20], [440, 20]) } })[0]
		const own = make({ shape: 'arc', height: 3 })
		expect(own.shape).toBe('arc')
		expect(own.points).toHaveLength(25)
		expect(Math.max(...own.points.map(point => point.y))).toBeCloseTo(3 + 0.03, 1)
		expect(make({ shape: 'arc' }).height).toBe(1.5)
		expect(Math.max(...make({ shape: 'arc' }).points.map(point => point.y))).toBeCloseTo(1.5 + 0.03, 1)
	})

	it('труба идёт выше ленты', () => {
		const lift = (shape: 'tube' | 'ribbon') =>
			build({ ...PAIR, edges: [edge('e', 'a', 'b', { model3d: { shape } })], routes: { e: route([40, 20], [440, 20]) } })[0].points[0]
				.y
		expect(lift('tube')).toBeGreaterThan(lift('ribbon'))
	})
})

describe('buildEdgeItems: ярусы', () => {
	const groups = [group('g0'), group('g1')]
	const layered = {
		groups,
		groupRects: { g0: rect(0, 0, 200, 100), g1: rect(300, 0, 300, 100) },
		nodes: [node('a', { group: 'g0' }), node('b', { group: 'g1' })],
		rects: { a: rect(40, 20, 80, 40), b: rect(400, 20, 80, 40) },
		edges: [edge('e', 'a', 'b')],
	}

	it('на одном ярусе путь не ступенчатый', () => {
		const items = build({ ...layered, routes: { e: route([80, 40], [440, 40]) } })
		expect(items[0].points.every(point => point.y === items[0].points[0].y)).toBe(true)
	})

	it('между ярусами путь делает ступеньку у края группы источника', () => {
		const [item] = build({ ...layered, routes: { e: route([80, 40], [440, 40]) } }, { isLayered: true })
		const ys = item.points.map(point => point.y)
		expect(ys[0]).toBeLessThan(ys[ys.length - 1])
		expect(new Set(ys).size).toBe(2)
	})

	it('если путь целиком в рамке группы источника, ступенька — на середине последнего отрезка', () => {
		const [item] = build(
			{ ...layered, groupRects: { g0: rect(0, 0, 800, 100), g1: rect(300, 0, 300, 100) }, routes: { e: route([80, 40], [440, 40]) } },
			{ isLayered: true },
		)
		expect(new Set(item.points.map(point => point.y)).size).toBe(2)
	})

	it('без группы у источника ступенька — на середине по длине пути, в том числе при нулевой длине', () => {
		const model = {
			groups,
			groupRects: { g1: rect(300, 0, 300, 100) },
			nodes: [node('a'), node('b', { group: 'g1' })],
			rects: { a: rect(40, 20, 80, 40), b: rect(400, 20, 80, 40) },
			edges: [edge('e', 'a', 'b')],
		}
		const [mid] = build({ ...model, routes: { e: route([80, 40], [240, 40], [440, 40]) } }, { isLayered: true })
		expect(new Set(mid.points.map(point => point.y)).size).toBe(2)
		const [zero] = build({ ...model, routes: { e: route([80, 40], [80, 40]) } }, { isLayered: true })
		expect(zero.points.length).toBeGreaterThanOrEqual(2)
		const [broken] = build({ ...model, routes: { e: route([80, 40], [Number.NaN, 40]) } }, { isLayered: true })
		expect(broken.points.length).toBeGreaterThanOrEqual(2)
	})

	it('путь налево и вверх от группы источника тоже ступеньчатый', () => {
		const [item] = build(
			{
				groups,
				groupRects: { g0: rect(300, 100, 200, 100), g1: rect(0, 0, 200, 100) },
				nodes: [node('a', { group: 'g0' }), node('b', { group: 'g1' })],
				rects: { a: rect(340, 120, 80, 40), b: rect(40, 20, 80, 40) },
				edges: [edge('e', 'a', 'b')],
				routes: { e: route([380, 140], [80, 40]) },
			},
			{ isLayered: true },
		)
		expect(new Set(item.points.map(point => point.y)).size).toBe(2)
	})

	it('совпавшие концы пути на разных ярусах дают нулевую длину и не ломают ступеньку', () => {
		const [item] = build(
			{
				groups,
				groupRects: { g1: rect(0, 0, 300, 100) },
				nodes: [node('a'), node('b', { group: 'g1' })],
				rects: { a: rect(40, 20, 80, 40), b: rect(40, 20, 80, 40) },
				edges: [edge('e', 'a', 'b')],
				routes: { e: route([80, 40], [80, 40]) },
			},
			{ isLayered: true },
		)
		expect(item.points.length).toBeGreaterThanOrEqual(2)
	})

	it('родитель источника ищется по цепочке; обрыв и цикл цепочки не мешают', () => {
		const nested = {
			groups: [group('top'), group('inner', { parent: 'top' }), group('far', { parent: 'ghost' }), group('g1')],
			groupRects: {
				top: rect(0, 0, 200, 100),
				inner: rect(10, 10, 50, 50),
				far: rect(0, 0, 200, 100),
				g1: rect(300, 0, 300, 100),
			},
			nodes: [node('a', { group: 'inner' }), node('b', { group: 'g1' })],
			rects: { a: rect(40, 20, 80, 40), b: rect(400, 20, 80, 40) },
			edges: [edge('e', 'a', 'b')],
			routes: { e: route([80, 40], [440, 40]) },
		}
		expect(build(nested, { isLayered: true })[0].points.length).toBeGreaterThan(2)
		expect(
			build({ ...nested, nodes: [node('a', { group: 'far' }), node('b', { group: 'g1' })] }, { isLayered: true })[0].points.length,
		).toBeGreaterThan(2)
		const loop = {
			...nested,
			groups: [group('l1', { parent: 'l2' }), group('l2', { parent: 'l1' }), group('g1')],
			nodes: [node('a', { group: 'l1' }), node('b', { group: 'g1' })],
			groupRects: { l1: rect(0, 0, 200, 100), l2: rect(0, 0, 200, 100), g1: rect(300, 0, 300, 100) },
		}
		expect(build(loop, { isLayered: true })[0].points.length).toBeGreaterThan(2)
	})

	it('узлы вне таблицы ярусов считаются стоящими на земле', () => {
		const empty: FlowMap3DLevels = { nodes: new Map(), groups: new Map(), top: 0, isLayered: false }
		const [item] = build({ ...PAIR, edges: [edge('e', 'a', 'b')], routes: { e: route([40, 20], [440, 20]) } }, { levels: empty })
		expect(item.points[0].y).toBeCloseTo(0.03)
	})
})
