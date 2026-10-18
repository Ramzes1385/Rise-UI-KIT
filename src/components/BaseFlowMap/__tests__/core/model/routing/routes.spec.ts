import { edge, map, node } from '../fixtures/flowData'
import { placeLabels } from '../../../../model/routing/labels'
import { computeRoutes } from '../../../../model/layout/flowRoutes'
import { flowServices } from '../../../../model/notations/services'
import { runFlowLayout } from '../../../../model/layout/useFlowLayout'
import { estimateTextWidth } from '../../../../model/routing/textWidth'
import { createLayoutInput } from '../../../../model/layout/flowLayoutInput'
import type { FlowNotation } from '../../../../types/api/flowNotation.types'
import type { FlowLayoutResult } from '../../../../types/api/flowLayout.types'
import type { FlowLayoutScope } from '../../../../types/internal/core/flowLayoutScope.types'
import type { FlowMapData, FlowPoint, FlowRect } from '../../../../types/data/flowData.types'
import { createScope, hasOverlaps, isOverlapping, plainNotation } from '../fixtures/layoutScope'

function routesOf(scope: FlowLayoutScope, layout?: FlowLayoutResult) {
	const result = layout ?? runFlowLayout(scope)
	return { layout: result, routes: computeRoutes(scope, result, createLayoutInput(scope).edges) }
}

const EDGE_KIND = { label: () => 'c', stroke: 'solid' as const }

function bareNotation(layout?: FlowNotation['layout']): FlowNotation {
	return { ...plainNotation, id: 'bare', layout, edgeKinds: { call: EDGE_KIND } }
}

function shapedNotation(shape: 'diamond' | 'ellipse' | 'rect'): FlowNotation {
	const kind = { label: () => 'K', render: 'html' as const, shape: { shape }, size: { width: 120, height: 60 } }
	return {
		...plainNotation,
		id: `shaped-${shape}`,
		nodeKinds: { service: kind },
		edgeKinds: { call: { label: () => 'c', stroke: 'solid' } },
	}
}

const pair: FlowMapData = map({ nodes: [node('a'), node('b')], edges: [edge('1', ['a', 'b'])] })

describe('computeRoutes', () => {
	it('для каждой связи есть путь, точки и подпись (если есть label)', () => {
		const data = map({ nodes: [node('a'), node('b')], edges: [edge('1', ['a', 'b'], { label: 'GET' }), edge('2', ['b', 'a'])] })
		const { routes } = routesOf(createScope(data, { layout: { direction: 'LR' } }))
		expect(Object.keys(routes)).toEqual(['1', '2'])
		expect(routes['1'].path.startsWith('M')).toBe(true)
		expect(routes['1'].points.length).toBeGreaterThanOrEqual(2)
		expect(routes['1'].label).not.toBeNull()
		expect(routes['2'].label).toBeNull()
	})

	it('концы маршрута лежат на контуре фигур узлов (ромб, эллипс, прямоугольник)', () => {
		const diamond = routesOf(
			createScope(pair, { notation: shapedNotation('diamond'), layout: { direction: 'LR', routing: 'straight' } }),
		)
		const [first, last] = [diamond.routes['1'].points[0], diamond.routes['1'].points.at(-1) as FlowPoint]
		const a = diamond.layout.nodes.a
		const dx = Math.abs(first.x - (a.x + a.width / 2)) / (a.width / 2)
		const dy = Math.abs(first.y - (a.y + a.height / 2)) / (a.height / 2)
		expect(dx + dy).toBeCloseTo(1, 6)
		const b = diamond.layout.nodes.b
		expect(
			Math.abs(last.x - (b.x + b.width / 2)) / (b.width / 2) + Math.abs(last.y - (b.y + b.height / 2)) / (b.height / 2),
		).toBeCloseTo(1, 6)
		const ellipse = routesOf(
			createScope(pair, { notation: shapedNotation('ellipse'), layout: { direction: 'LR', routing: 'straight' } }),
		)
		const e = ellipse.layout.nodes.a
		const start = ellipse.routes['1'].points[0]
		expect(
			((start.x - (e.x + e.width / 2)) / (e.width / 2)) ** 2 + ((start.y - (e.y + e.height / 2)) / (e.height / 2)) ** 2,
		).toBeCloseTo(1, 6)
	})

	it('ортогональная связь: все отрезки осевые, углы скруглены (Q в пути)', () => {
		const data = map({
			nodes: [node('a'), node('b', { position: { x: 400, y: 200 }, isPinned: true })],
			edges: [edge('1', ['a', 'b'], { routing: 'orthogonal' })],
		})
		const { routes } = routesOf(createScope(data, { layout: { direction: 'LR' } }))
		const { points, path } = routes['1']
		expect(points.every((point, index) => index === 0 || point.x === points[index - 1].x || point.y === points[index - 1].y)).toBe(true)
		expect(path).toContain('Q')
	})

	it('ортогональная связь без излома — прямая линия без скруглений', () => {
		const data = map({ nodes: [node('a'), node('b')], edges: [edge('1', ['a', 'b'], { routing: 'orthogonal' })] })
		const { routes } = routesOf(createScope(data, { layout: { direction: 'LR' } }))
		expect(routes['1'].path).not.toContain('Q')
	})

	it('вид связи и настройки задают способ: kind.routing, layout.routing, неизвестный — curved', () => {
		const kindNotation: FlowNotation = {
			...plainNotation,
			edgeKinds: { call: { label: () => 'c', stroke: 'solid', routing: 'straight' } },
			layout: undefined,
		}
		const byKind = routesOf(createScope(pair, { notation: kindNotation, layout: { direction: 'LR' } }))
		expect(byKind.routes['1'].points).toHaveLength(2)
		const byLayout = routesOf(createScope(pair, { notation: bareNotation(), layout: { direction: 'LR', routing: 'straight' } }))
		expect(byLayout.routes['1'].points).toHaveLength(2)
		const byNotation = routesOf(createScope(pair, { notation: bareNotation({ routing: 'straight' }), layout: { direction: 'LR' } }))
		expect(byNotation.routes['1'].points.length).toBeGreaterThanOrEqual(2)
		const unknown = routesOf(
			createScope(map({ nodes: pair.nodes, edges: [edge('1', ['a', 'b'], { routing: 'weird' as never })] }), {
				layout: { direction: 'LR' },
			}),
		)
		expect(unknown.routes['1'].points.length).toBeGreaterThan(10)
		const overridden = routesOf(
			createScope(pair, {
				notation: bareNotation(),
				overrides: { routing: 'straight' },
				layout: { direction: 'LR', routing: undefined },
			}),
		)
		expect(overridden.routes['1'].points).toHaveLength(2)
	})

	it('своя маршрутизация плагина по id', () => {
		const mine = [
			{ x: 0, y: 0 },
			{ x: 10, y: 10 },
			{ x: 20, y: 0 },
		]
		const route = vi.fn(() => mine)
		const data = map({ nodes: pair.nodes, edges: [edge('1', ['a', 'b'], { routing: 'mine' as never })] })
		const { routes } = routesOf(createScope(data, { routers: [{ id: 'mine', route }] }))
		expect(route).toHaveBeenCalledTimes(1)
		expect(routes['1'].points).toEqual(mine)
	})

	it('петля: путь из пяти точек над правым верхним углом узла', () => {
		const data = map({ nodes: [node('a')], edges: [edge('1', ['a', 'a'])] })
		const { routes, layout } = routesOf(createScope(data))
		expect(routes['1'].points).toHaveLength(5)
		expect(Math.min(...routes['1'].points.map(point => point.y))).toBeLessThan(layout.nodes.a.y)
	})

	it('точки, заданные в связи, используются в маршруте', () => {
		const via = { x: 77, y: 88 }
		const data = map({ nodes: pair.nodes, edges: [edge('1', ['a', 'b'], { points: [via], routing: 'straight' })] })
		const { routes } = routesOf(createScope(data, { layout: { direction: 'LR' } }))
		expect(routes['1'].points).toContainEqual(via)
	})

	it('маршрут из раскладки (layout.edges) принимается как есть, путь — ломаная', () => {
		const scope = createScope(pair, { layout: { direction: 'LR' } })
		const layout: FlowLayoutResult = {
			...runFlowLayout(scope),
			edges: {
				'1': [
					{ x: 0, y: 0 },
					{ x: 5, y: 5 },
					{ x: 9, y: 0 },
				],
			},
		}
		const { routes } = routesOf(scope, layout)
		expect(routes['1'].points).toHaveLength(3)
		expect(routes['1'].path).toBe('M0 0 L5 5 L9 0')
	})

	it('связь без прямоугольника узла маршрута не имеет; нет маршрутизатора — тоже', () => {
		const scope = createScope(pair, { layout: { direction: 'LR' } })
		const layout = runFlowLayout(scope)
		const partial: FlowLayoutResult = { ...layout, nodes: { a: layout.nodes.a } }
		expect(routesOf(scope, partial).routes).toEqual({})
		const none = { ...scope, routers: new Map() }
		expect(routesOf(none, layout).routes).toEqual({})
	})

	it('связи, которых нет в раскладке (неизвестные узлы), пропускаются', () => {
		const data = map({ nodes: [node('a')], edges: [edge('1', ['a', 'ghost'])] })
		expect(routesOf(createScope(data)).routes).toEqual({})
	})

	it('параллельные связи из одной стороны получают разные каналы', () => {
		const data = map({
			nodes: [node('a'), node('b'), node('c')],
			edges: [edge('1', ['a', 'b'], { routing: 'orthogonal' }), edge('2', ['a', 'c'], { routing: 'orthogonal' })],
		})
		const { routes } = routesOf(createScope(data, { layout: { direction: 'LR' } }))
		expect(routes['1'].points).not.toEqual(routes['2'].points)
	})

	it('число после запятой в пути округляется до сотых', () => {
		const scope = createScope(pair, { layout: { direction: 'LR', routing: 'curved' } })
		const { routes } = routesOf(scope)
		expect(routes['1'].path).not.toMatch(/\.\d{3,}/)
	})
})

describe('подписи связей', () => {
	const obstacle = (x: number, y: number): FlowRect => ({ x, y, width: 60, height: 30 })

	it('подписи не пересекают узлы и друг друга', () => {
		const data = map({
			nodes: [node('a'), node('b'), node('c')],
			edges: [
				edge('1', ['a', 'b'], { label: 'первая связь' }),
				edge('2', ['a', 'c'], { label: 'вторая связь' }),
				edge('3', ['b', 'c'], { label: 'третья' }),
			],
		})
		const { routes, layout } = routesOf(createScope(data, { layout: { direction: 'LR' } }))
		const placed = Object.entries(routes).flatMap(([id, route]) => {
			if (!route.label) return []
			const label = data.edges.find(item => item.id === id)?.label ?? ''
			const width = estimateTextWidth(label, 12) + 12
			return [{ x: route.label.point.x - width / 2, y: route.label.point.y - 10, width, height: 20 }]
		})
		expect(placed.length).toBeGreaterThanOrEqual(2)
		expect(hasOverlaps(placed)).toBe(false)
		for (const box of placed) expect(Object.values(layout.nodes).some(rect => isOverlapping(box, rect))).toBe(false)
	})

	it('для длинной подписи ширина учитывает текст', () => {
		const requests = [
			{
				id: 'x',
				points: [
					{ x: 0, y: 0 },
					{ x: 400, y: 0 },
				],
				width: 80,
				height: 20,
			},
		]
		const result = placeLabels(requests, [])
		expect(result.x).toEqual({ point: { x: 200, y: 0 }, angle: 0 })
	})

	it('занята середина — подпись сдвигается вдоль линии или в сторону', () => {
		const requests = [
			{
				id: 'x',
				points: [
					{ x: 0, y: 0 },
					{ x: 400, y: 0 },
				],
				width: 80,
				height: 20,
			},
		]
		const result = placeLabels(requests, [{ x: 150, y: -15, width: 100, height: 30 }])
		const label = result.x as { point: FlowPoint }
		expect(label.point.x === 200 && label.point.y === 0).toBe(false)
		const box = { x: label.point.x - 40, y: label.point.y - 10, width: 80, height: 20 }
		expect(isOverlapping(box, { x: 150, y: -15, width: 100, height: 30 })).toBe(false)
	})

	it('негде разместить — null', () => {
		const requests = [
			{
				id: 'x',
				points: [
					{ x: 0, y: 0 },
					{ x: 100, y: 0 },
				],
				width: 80,
				height: 20,
			},
		]
		const blocked = [obstacle(-100, -100), { x: -200, y: -200, width: 600, height: 400 }]
		expect(placeLabels(requests, blocked)).toEqual({ x: null })
	})

	it('вторая подпись обходит первую', () => {
		const line = [
			{ x: 0, y: 0 },
			{ x: 400, y: 0 },
		]
		const result = placeLabels(
			[
				{ id: 'one', points: line, width: 80, height: 20 },
				{ id: 'two', points: line, width: 80, height: 20 },
			],
			[],
		)
		const [one, two] = [result.one as { point: FlowPoint }, result.two as { point: FlowPoint }]
		expect(
			isOverlapping(
				{ x: one.point.x - 40, y: one.point.y - 10, width: 80, height: 20 },
				{ x: two.point.x - 40, y: two.point.y - 10, width: 80, height: 20 },
			),
		).toBe(false)
	})

	it('вырожденная линия из одной точки и из нулевых отрезков не ломает размещение', () => {
		const result = placeLabels(
			[
				{
					id: 'dot',
					points: [
						{ x: 5, y: 5 },
						{ x: 5, y: 5 },
					],
					width: 20,
					height: 10,
				},
				{ id: 'single', points: [{ x: 50, y: 50 }], width: 20, height: 10 },
			],
			[],
		)
		expect(result.dot).not.toBeNull()
		expect(result.single).not.toBeNull()
	})

	it('подпись вертикальной линии сдвигается по нормали', () => {
		const result = placeLabels(
			[
				{
					id: 'v',
					points: [
						{ x: 0, y: 0 },
						{ x: 0, y: 300 },
					],
					width: 40,
					height: 20,
				},
			],
			[{ x: -20, y: 130, width: 40, height: 40 }],
		)
		const label = result.v as { point: FlowPoint }
		expect(label).not.toBeNull()
	})

	it('flowServices — нотация по умолчанию для проверочных данных', () => {
		expect(flowServices.id).toBe('services')
	})
})
