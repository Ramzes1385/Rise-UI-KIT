import { layoutInput, layoutNode } from '../fixtures/idefData'
import type { FlowPoint, FlowRect } from '../../types/data/flowData.types'
import { idef0Staircase } from '../../model/notations/idef0/idef0Staircase'
import type { FlowLayoutEdge, FlowLayoutNode } from '../../types/api/flowLayout.types'

function fnNode(id: string, code: string, extra: number | Partial<FlowLayoutNode>): FlowLayoutNode {
	return layoutNode(id, 'function', { props: { code }, ...(typeof extra === 'number' ? { order: extra } : extra) })
}

function boundaryNode(id: string, icom: string, extra: number | Partial<FlowLayoutNode>): FlowLayoutNode {
	return layoutNode(id, 'boundary', { props: { icom }, ...(typeof extra === 'number' ? { order: extra } : extra) })
}

function link(id: string, ends: string, targetSide?: FlowLayoutEdge['targetSide']): FlowLayoutEdge {
	const [source = '', target = ''] = ends.split('>')
	return { id, source, target, targetSide }
}

function overlaps(a: FlowRect, b: FlowRect): boolean {
	return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

function run(nodes: FlowLayoutNode[], edges: FlowLayoutEdge[] = [], settings = {}) {
	return idef0Staircase.run(layoutInput(nodes, edges, settings))
}

const threeFunctions = (): FlowLayoutNode[] => [fnNode('a1', 'A1', 0), fnNode('a2', 'A2', 1), fnNode('a3', 'A3', 2)]

describe('IDEF0: лесенка', () => {
	it('называется idef0-staircase', () => {
		expect(idef0Staircase.id).toBe('idef0-staircase')
	})

	it('пустой вход даёт пустую раскладку', () => {
		expect(run([])).toEqual({ nodes: {}, groups: {}, edges: {}, bounds: { x: 0, y: 0, width: 0, height: 0 } })
	})

	it('ставит функции по диагонали вправо и вниз, первая — в начале координат раскладки', () => {
		const { nodes } = run(threeFunctions())
		expect(nodes.a1).toMatchObject({ x: 180, y: 70, width: 170, height: 96 })
		expect(nodes.a2!.x).toBeGreaterThan(nodes.a1!.x + nodes.a1!.width)
		expect(nodes.a2!.y).toBeGreaterThan(nodes.a1!.y + nodes.a1!.height)
		expect(nodes.a3!.x).toBeGreaterThan(nodes.a2!.x + nodes.a2!.width)
		expect(nodes.a3!.y).toBeGreaterThan(nodes.a2!.y + nodes.a2!.height)
	})

	it('шаг лесенки не меньше минимального и растёт с настройками отступов', () => {
		const tight = run(threeFunctions(), [], { nodeGap: 0, rankGap: 0 }).nodes
		expect(tight.a2!.x - (tight.a1!.x + tight.a1!.width)).toBe(40)
		expect(tight.a2!.y - (tight.a1!.y + tight.a1!.height)).toBe(34)
		const wide = run(threeFunctions(), [], { nodeGap: 100, rankGap: 200 }).nodes
		expect(wide.a2!.x - (wide.a1!.x + wide.a1!.width)).toBe(200)
		expect(wide.a2!.y - (wide.a1!.y + wide.a1!.height)).toBe(100)
	})

	it('порядок лесенки — по номеру, а не по порядку данных; равные номера — по порядку в данных', () => {
		const { nodes } = run([fnNode('late', 'A3', 0), fnNode('first', 'A1', 1), fnNode('tie-b', 'A2', 3), fnNode('tie-a', 'A2', 2)])
		expect(nodes.first!.x).toBeLessThan(nodes['tie-a']!.x)
		expect(nodes['tie-a']!.x).toBeLessThan(nodes['tie-b']!.x)
		expect(nodes['tie-b']!.x).toBeLessThan(nodes.late!.x)
	})

	it('узел без номера идёт первым', () => {
		const { nodes } = run([fnNode('a2', 'A2', 0), layoutNode('plain', 'function', 1)])
		expect(nodes.plain!.x).toBeLessThan(nodes.a2!.x)
	})

	it('закреплённая функция остаётся на месте, следующие считаются от неё', () => {
		const { nodes } = run([fnNode('a1', 'A1', { order: 0, fixed: { x: 500, y: 300 } }), fnNode('a2', 'A2', 1)])
		expect(nodes.a1).toMatchObject({ x: 500, y: 300 })
		expect(nodes.a2!.x).toBeGreaterThan(500 + 170)
		expect(nodes.a2!.y).toBeGreaterThan(300 + 96)
	})

	it('результат одинаков при повторном запуске', () => {
		const input = layoutInput([...threeFunctions(), boundaryNode('i1', 'input', 3)], [link('e1', 'i1>a1'), link('e2', 'a3>a1', 'top')])
		expect(idef0Staircase.run(input)).toEqual(idef0Staircase.run(input))
	})

	describe('граничные стрелки', () => {
		const edges = [link('ei', 'i1>a2'), link('ec', 'c1>a2'), link('eo', 'a2>o1'), link('em', 'm1>a2')]
		const all = (): FlowLayoutNode[] => [
			...threeFunctions(),
			boundaryNode('i1', 'input', 3),
			boundaryNode('c1', 'control', 4),
			boundaryNode('o1', 'output', 5),
			boundaryNode('m1', 'mechanism', 6),
		]

		it('вход — слева от диаграммы, управление — сверху, выход — справа, механизм — снизу', () => {
			const { nodes } = run(all(), edges)
			const functions = [nodes.a1!, nodes.a2!, nodes.a3!]
			const left = Math.min(...functions.map(rect => rect.x))
			const top = Math.min(...functions.map(rect => rect.y))
			const right = Math.max(...functions.map(rect => rect.x + rect.width))
			const bottom = Math.max(...functions.map(rect => rect.y + rect.height))
			expect(nodes.i1!.x + nodes.i1!.width).toBeLessThanOrEqual(left)
			expect(nodes.c1!.y + nodes.c1!.height).toBeLessThanOrEqual(top)
			expect(nodes.o1!.x).toBeGreaterThanOrEqual(right)
			expect(nodes.m1!.y).toBeGreaterThanOrEqual(bottom)
		})

		it('стрелка ставится на уровне функции, к которой подключена', () => {
			const { nodes } = run(all(), edges)
			const centerY = (rect: FlowRect): number => rect.y + rect.height / 2
			const centerX = (rect: FlowRect): number => rect.x + rect.width / 2
			expect(centerY(nodes.i1!)).toBeCloseTo(centerY(nodes.a2!), 5)
			expect(centerY(nodes.o1!)).toBeCloseTo(centerY(nodes.a2!), 5)
			expect(centerX(nodes.c1!)).toBeCloseTo(centerX(nodes.a2!), 5)
			expect(centerX(nodes.m1!)).toBeCloseTo(centerX(nodes.a2!), 5)
		})

		it('ничто не накладывается друг на друга', () => {
			const rects = Object.entries(run(all(), edges).nodes)
			for (const [index, [idA, a]] of rects.entries()) {
				for (const [idB, b] of rects.slice(index + 1)) expect(overlaps(a, b), `${idA} и ${idB}`).toBe(false)
			}
		})

		it('несколько стрелок одной роли у одной функции расходятся без наложений', () => {
			const { nodes } = run(
				[...threeFunctions(), boundaryNode('i1', 'input', 3), boundaryNode('i2', 'input', 4), boundaryNode('i3', 'input', 5)],
				[link('e1', 'i1>a2'), link('e2', 'i2>a2'), link('e3', 'i3>a2')],
			)
			const inputs = [nodes.i1!, nodes.i2!, nodes.i3!].sort((a, b) => a.y - b.y)
			expect(overlaps(inputs[0]!, inputs[1]!)).toBe(false)
			expect(overlaps(inputs[1]!, inputs[2]!)).toBe(false)
		})

		it('стрелка с несколькими функциями встаёт по среднему их уровню', () => {
			const { nodes } = run([...threeFunctions(), boundaryNode('c1', 'control', 3)], [link('e1', 'c1>a1'), link('e2', 'c1>a3')])
			const centerX = (rect: FlowRect): number => rect.x + rect.width / 2
			expect(centerX(nodes.c1!)).toBeCloseTo((centerX(nodes.a1!) + centerX(nodes.a3!)) / 2, 5)
		})

		it('стрелка без связей встаёт в начало своей оси', () => {
			const { nodes } = run([...threeFunctions(), boundaryNode('i1', 'input', 3), boundaryNode('c1', 'control', 4)])
			expect(nodes.i1).toMatchObject({ x: 8, y: 56 })
			expect(nodes.c1).toMatchObject({ x: 105, y: 8 })
		})

		it('выходная стрелка берёт функции из источников связей', () => {
			const { nodes } = run([...threeFunctions(), boundaryNode('o1', 'output', 3)], [link('e1', 'a1>o1')])
			expect(nodes.o1!.y + nodes.o1!.height / 2).toBeCloseTo(nodes.a1!.y + nodes.a1!.height / 2, 5)
		})

		it('связь с неизвестной функцией не считается привязкой', () => {
			const { nodes } = run([...threeFunctions(), boundaryNode('i1', 'input', 3)], [link('e1', 'i1>ghost')])
			expect(nodes.i1!.y).toBe(56)
		})

		it('закреплённая граничная стрелка остаётся на месте', () => {
			const { nodes } = run(
				[...threeFunctions(), boundaryNode('i1', 'input', { order: 3, fixed: { x: 11, y: 22 } })],
				[link('e1', 'i1>a1')],
			)
			expect(nodes.i1).toMatchObject({ x: 11, y: 22 })
		})

		it('неизвестная роль считается входом', () => {
			const { nodes } = run([...threeFunctions(), boundaryNode('x', 'другое', 3)], [link('e1', 'x>a1')])
			expect(nodes.x!.x).toBe(8)
		})

		it('карта из одних граничных стрелок получает конечные координаты и границы', () => {
			const { nodes, bounds } = run([
				boundaryNode('i1', 'input', 0),
				boundaryNode('c1', 'control', 1),
				boundaryNode('o1', 'output', 2),
				boundaryNode('m1', 'mechanism', 3),
			])
			const values = [...Object.values(nodes).flatMap(rect => Object.values(rect)), ...Object.values(bounds)]
			expect(values.every(Number.isFinite)).toBe(true)
			expect(nodes.o1!.x).toBeGreaterThan(nodes.i1!.x)
			expect(nodes.m1!.y).toBeGreaterThan(nodes.c1!.y)
		})

		it('вход без функций ставится на левый край', () => {
			const { nodes, bounds } = run([boundaryNode('i1', 'input', 0)])
			expect(nodes.i1).toMatchObject({ x: 8, y: 56 })
			expect(bounds).toMatchObject({ x: 8, y: 56, width: 150, height: 28 })
		})
	})

	describe('петли обратной связи', () => {
		const route = (edgesList: FlowLayoutEdge[]): Record<string, FlowPoint[]> => run(threeFunctions(), edgesList).edges!

		it('прямые связи вперёд не получают собственного маршрута', () => {
			expect(route([link('e1', 'a1>a2'), link('e2', 'a2>a3')])).toEqual({})
		})

		it('связи с узлами вне лесенки (граничные стрелки) не считаются обратными', () => {
			const nodes = [...threeFunctions(), boundaryNode('i1', 'input', 3)]
			expect(run(nodes, [link('e1', 'i1>a1'), link('e2', 'a1>i1')]).edges).toEqual({})
		})

		it('обратная связь в управление идёт над диаграммой и входит сверху', () => {
			const { nodes, edges } = run(threeFunctions(), [link('back', 'a3>a1', 'top')])
			const points = edges!.back!
			const topOfAll = Math.min(...[nodes.a1!, nodes.a2!, nodes.a3!].map(rect => rect.y))
			expect(points[0]).toEqual({ x: nodes.a3!.x + nodes.a3!.width, y: nodes.a3!.y + nodes.a3!.height / 2 })
			expect(points.at(-1)).toEqual({ x: nodes.a1!.x + nodes.a1!.width / 2, y: nodes.a1!.y })
			expect(Math.min(...points.map(point => point.y))).toBeLessThan(topOfAll)
			expect(points).toHaveLength(5)
		})

		it('без стороны приёмника петля тоже идёт сверху', () => {
			const points = route([link('back', 'a2>a2')])['back']!
			expect(points).toHaveLength(5)
			expect(points.at(-1)!.y).toBe(run(threeFunctions()).nodes.a2!.y)
		})

		it('обратная связь в механизм идёт под диаграммой и входит снизу', () => {
			const { nodes, edges } = run(threeFunctions(), [link('back', 'a3>a1', 'bottom')])
			const points = edges!.back!
			const bottomOfAll = Math.max(...[nodes.a1!, nodes.a2!, nodes.a3!].map(rect => rect.y + rect.height))
			expect(Math.max(...points.map(point => point.y))).toBeGreaterThan(bottomOfAll)
			expect(points.at(-1)).toEqual({ x: nodes.a1!.x + nodes.a1!.width / 2, y: nodes.a1!.y + nodes.a1!.height })
			expect(points).toHaveLength(5)
		})

		it('обратная связь во вход идёт под диаграммой и входит слева', () => {
			const { nodes, edges } = run(threeFunctions(), [link('back', 'a3>a1', 'left')])
			const points = edges!.back!
			expect(points.at(-1)).toEqual({ x: nodes.a1!.x, y: nodes.a1!.y + nodes.a1!.height / 2 })
			expect(points).toHaveLength(6)
			expect(points.at(-2)!.x).toBeLessThan(nodes.a1!.x)
		})

		it('несколько петель идут по разным дорожкам и не совпадают', () => {
			const edges = route([
				link('b1', 'a3>a1', 'top'),
				link('b2', 'a2>a1', 'top'),
				link('b3', 'a3>a2', 'bottom'),
				link('b4', 'a3>a1', 'bottom'),
			])
			const lane = (id: string, pick: (...ys: number[]) => number): number => pick(...edges[id]!.map(point => point.y))
			expect(lane('b2', Math.min)).toBeLessThan(lane('b1', Math.min))
			expect(lane('b4', Math.max)).toBeGreaterThan(lane('b3', Math.max))
		})

		it('границы раскладки охватывают маршруты петель', () => {
			const { edges, bounds } = run(threeFunctions(), [link('back', 'a3>a1', 'top')])
			const ys = edges!.back!.map(point => point.y)
			expect(bounds.y).toBeLessThanOrEqual(Math.min(...ys))
			expect(bounds.y + bounds.height).toBeGreaterThanOrEqual(Math.max(...ys))
		})
	})
})
