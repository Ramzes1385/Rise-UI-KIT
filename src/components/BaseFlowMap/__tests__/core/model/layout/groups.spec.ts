import { edge, group, map, node } from '../fixtures/flowData'
import { runFlowLayout } from '../../../../model/layout/useFlowLayout'
import type { FlowDirection } from '../../../../types/data/flowData.types'
import { createScope, hasOverlaps, isInside, plainNotation } from '../fixtures/layoutScope'

function ys(rects: { y: number }[]): number[] {
	return [...new Set(rects.map(rect => rect.y))].sort((a, b) => a - b)
}

describe('группа без узлов', () => {
	it('карта из одной пустой дорожки раскладывается без ошибок', () => {
		const { nodes, groups } = runFlowLayout(createScope(map({ groups: [group('g', { kind: 'lane' })] }), { notation: plainNotation }))
		expect(nodes).toEqual({})
		expect(groups).toEqual({})
	})
})

describe('ярусы (tier)', () => {
	const tiers = map({
		groups: [group('t1', { kind: 'layer' }), group('t2', { kind: 'layer' })],
		nodes: [
			node('a', { group: 't1' }),
			node('b', { group: 't1' }),
			node('c', { group: 't2' }),
			node('d', { group: 't2' }),
			node('e', { group: 't2' }),
		],
		edges: [edge('1', ['a', 'c']), edge('2', ['b', 'd']), edge('3', ['c', 'd']), edge('4', ['d', 'e'])],
	})

	it('узлы яруса стоят в одном ряду, ярусы идут по порядку сверху вниз', () => {
		const { nodes, groups } = runFlowLayout(createScope(tiers, { layout: { direction: 'TB' } }))
		expect(nodes.a.y).toBe(nodes.b.y)
		expect(nodes.c.y).toBe(nodes.d.y)
		expect(nodes.d.y).toBe(nodes.e.y)
		expect(nodes.c.y).toBeGreaterThan(nodes.a.y)
		expect(groups.t2.y).toBeGreaterThan(groups.t1.y)
	})

	it('связи внутри яруса горизонтальны (концы на одной высоте), а ярус не распадается', () => {
		const { nodes } = runFlowLayout(createScope(tiers, { layout: { direction: 'TB' } }))
		expect(nodes.c.y).toBe(nodes.d.y)
		expect(nodes.d.y).toBe(nodes.e.y)
		expect(hasOverlaps([nodes.c, nodes.d, nodes.e])).toBe(false)
	})

	it('рамка яруса содержит свои узлы, рамки ярусов не пересекаются', () => {
		const { nodes, groups } = runFlowLayout(createScope(tiers, { layout: { direction: 'TB' } }))
		for (const id of ['a', 'b']) expect(isInside(nodes[id], groups.t1)).toBe(true)
		for (const id of ['c', 'd', 'e']) expect(isInside(nodes[id], groups.t2)).toBe(true)
		expect(hasOverlaps([groups.t1, groups.t2])).toBe(false)
	})

	it('в LR ярусы становятся колонками: узлы яруса на одном x', () => {
		const { nodes, groups } = runFlowLayout(createScope(tiers, { layout: { direction: 'LR' } }))
		expect(nodes.a.x).toBe(nodes.b.x)
		expect(nodes.c.x).toBe(nodes.d.x)
		expect(groups.t2.x).toBeGreaterThan(groups.t1.x)
	})

	it.each<{ direction: FlowDirection }>([{ direction: 'RL' }, { direction: 'BT' }])(
		'в направлении $direction порядок ярусов зеркален',
		({ direction }) => {
			const { groups } = runFlowLayout(createScope(tiers, { layout: { direction } }))
			if (direction === 'RL') expect(groups.t2.x).toBeLessThan(groups.t1.x)
			else expect(groups.t2.y).toBeLessThan(groups.t1.y)
		},
	)

	it('wrap переносит ряд яруса: не больше wrap узлов в ряду', () => {
		const wide = map({
			groups: [group('t', { kind: 'layer' })],
			nodes: Array.from({ length: 5 }, (_, index) => node(`n${index}`, { group: 't' })),
		})
		const { nodes, groups } = runFlowLayout(createScope(wide, { layout: { direction: 'TB', wrap: 2 } }))
		const rows = ys(Object.values(nodes))
		expect(rows).toHaveLength(3)
		for (const row of rows) expect(Object.values(nodes).filter(rect => rect.y === row).length).toBeLessThanOrEqual(2)
		expect(Object.values(nodes).every(rect => isInside(rect, groups.t))).toBe(true)
		const unwrapped = runFlowLayout(createScope(wide, { layout: { direction: 'TB' } })).nodes
		expect(ys(Object.values(unwrapped))).toHaveLength(1)
	})

	it('ярус без узлов получает рамку, неизвестная группа узла не ломает раскладку', () => {
		const data = map({
			groups: [group('t1', { kind: 'layer' }), group('empty', { kind: 'layer' })],
			nodes: [node('a', { group: 't1' }), node('b', { group: 'ghost' })],
		})
		const { groups, nodes } = runFlowLayout(createScope(data, { layout: { direction: 'TB' } }))
		expect(groups.empty).toBeDefined()
		expect(nodes.b).toBeDefined()
	})
})

describe('полосы (band)', () => {
	const lanes = map({
		groups: [group('l1', { kind: 'lane', order: 0 }), group('l2', { kind: 'lane', order: 1 })],
		nodes: [node('a', { group: 'l1' }), node('b', { group: 'l2' }), node('c', { group: 'l1' })],
		edges: [edge('1', ['a', 'b']), edge('2', ['b', 'c'])],
	})
	const options = { notation: plainNotation, layout: { direction: 'LR' as const } }

	it('узлы лежат внутри полос своих рамок, полосы идут друг за другом без наложений', () => {
		const { nodes, groups } = runFlowLayout(createScope(lanes, options))
		expect(isInside(nodes.a, groups.l1)).toBe(true)
		expect(isInside(nodes.c, groups.l1)).toBe(true)
		expect(isInside(nodes.b, groups.l2)).toBe(true)
		expect(hasOverlaps([groups.l1, groups.l2])).toBe(false)
		expect(groups.l2.y).toBeGreaterThan(groups.l1.y)
	})

	it('в TB полосы становятся колонками', () => {
		const { nodes, groups } = runFlowLayout(createScope(lanes, { ...options, layout: { direction: 'TB' } }))
		expect(isInside(nodes.b, groups.l2)).toBe(true)
		expect(groups.l2.x).toBeGreaterThan(groups.l1.x)
	})

	it('порядок полос задаёт order, а не порядок в списке', () => {
		const swapped = map({ ...lanes, groups: [group('l1', { kind: 'lane', order: 5 }), group('l2', { kind: 'lane', order: 1 })] })
		const { groups } = runFlowLayout(createScope(swapped, options))
		expect(groups.l2.y).toBeLessThan(groups.l1.y)
	})

	it('byLanes: false игнорирует полосы: рамок нет, узлы не привязаны к полосам', () => {
		const { groups, nodes } = runFlowLayout(createScope(lanes, { ...options, layout: { direction: 'LR', byLanes: false } }))
		expect(groups).toEqual({})
		expect(Object.keys(nodes)).toEqual(['a', 'b', 'c'])
	})

	it('вложенные полосы: рамка пула содержит рамки своих дорожек', () => {
		const nested = map({
			groups: [
				group('pool', { kind: 'pool' }),
				group('l1', { kind: 'lane', parent: 'pool' }),
				group('l2', { kind: 'lane', parent: 'pool' }),
			],
			nodes: [node('a', { group: 'l1' }), node('b', { group: 'l2' }), node('p', { group: 'pool' })],
			edges: [edge('1', ['a', 'b'])],
		})
		const { groups, nodes } = runFlowLayout(createScope(nested, options))
		expect(isInside(groups.l1, groups.pool)).toBe(true)
		expect(isInside(groups.l2, groups.pool)).toBe(true)
		expect(isInside(nodes.a, groups.l1)).toBe(true)
		expect(isInside(nodes.b, groups.l2)).toBe(true)
		expect(nodes.p).toBeDefined()
	})

	it('полоса без узлов получает рамку', () => {
		const data = map({ groups: [group('l1', { kind: 'lane' }), group('l2', { kind: 'lane' })], nodes: [node('a', { group: 'l1' })] })
		const { groups } = runFlowLayout(createScope(data, options))
		expect(groups.l2.height).toBeGreaterThan(0)
		expect(groups.l2.y).toBeGreaterThanOrEqual(groups.l1.y + groups.l1.height)
	})

	it('полоса с отсутствующим родителем обрабатывается как корневая', () => {
		const data = map({ groups: [group('orphan', { kind: 'lane', parent: 'gone' })], nodes: [node('a', { group: 'orphan' })] })
		const { groups, nodes } = runFlowLayout(createScope(data, options))
		expect(isInside(nodes.a, groups.orphan)).toBe(true)
	})
})

describe('рамки (box)', () => {
	const boxed = map({
		groups: [group('outer', { kind: 'zone' }), group('inner', { kind: 'zone', parent: 'outer' }), group('empty', { kind: 'zone' })],
		nodes: [node('a', { group: 'inner' }), node('b', { group: 'outer' }), node('c'), node('d', { group: 'inner' })],
		edges: [edge('1', ['a', 'b']), edge('2', ['b', 'c']), edge('3', ['a', 'd']), edge('4', ['c', 'c'])],
	})

	it('рамка содержит детей, вложенная рамка лежит внутри внешней', () => {
		const { groups, nodes } = runFlowLayout(createScope(boxed, { layout: { direction: 'LR' } }))
		expect(isInside(nodes.a, groups.inner)).toBe(true)
		expect(isInside(nodes.d, groups.inner)).toBe(true)
		expect(isInside(groups.inner, groups.outer)).toBe(true)
		expect(isInside(nodes.b, groups.outer)).toBe(true)
		expect(hasOverlaps([groups.outer, nodes.c])).toBe(false)
		expect(groups.empty.width).toBeGreaterThan(0)
	})

	it('заголовок рамки добавляет высоту сверху', () => {
		const single = map({ groups: [group('z', { kind: 'zone' })], nodes: [node('a', { group: 'z' })] })
		const { groups, nodes } = runFlowLayout(createScope(single, { layout: { direction: 'LR' } }))
		expect(nodes.a.y - groups.z.y).toBeGreaterThanOrEqual(32)
	})

	it('рамка внутри полосы остаётся внутри полосы', () => {
		const data = map({
			groups: [group('l1', { kind: 'lane' }), group('l2', { kind: 'lane' }), group('z', { kind: 'zone', parent: 'l1' })],
			nodes: [node('a', { group: 'z' }), node('b', { group: 'l2' })],
			edges: [edge('1', ['a', 'b'])],
		})
		const { groups, nodes } = runFlowLayout(createScope(data, { notation: plainNotation, layout: { direction: 'LR' } }))
		expect(isInside(groups.z, groups.l1)).toBe(true)
		expect(isInside(nodes.a, groups.z)).toBe(true)
		expect(isInside(nodes.b, groups.l2)).toBe(true)
	})

	it('цикл групп (невалидные данные) не вешает раскладку', () => {
		const data = map({
			groups: [group('x', { kind: 'zone', parent: 'y' }), group('y', { kind: 'zone', parent: 'x' })],
			nodes: [node('a', { group: 'x' }), node('b')],
		})
		const input = JSON.stringify(data)
		const { nodes } = runFlowLayout(createScope(data))
		expect(Object.keys(nodes).sort()).toEqual(['a', 'b'])
		expect(nodes.a.width).toBeGreaterThan(0)
		expect(JSON.stringify(data)).toBe(input)
	})

	it.each(['LR', 'RL', 'TB', 'BT'] as const)('узел остаётся в своей дорожке при пустой дорожке между (%s)', direction => {
		const data = map({
			groups: [group('g0', { kind: 'lane' }), group('g1', { kind: 'lane' }), group('g2', { kind: 'lane' })],
			nodes: [node('n1', { group: 'g2' }), node('n4')],
			edges: [edge('e', ['n4', 'n1'])],
		})
		const { nodes, groups } = runFlowLayout(createScope(data, { notation: plainNotation, layout: { direction } }))
		expect(isInside(nodes.n1, groups.g2)).toBe(true)
	})
})

describe('полосы и ярусы вместе', () => {
	const mixed = map({
		groups: [
			group('l1', { kind: 'lane', order: 0 }),
			group('l2', { kind: 'lane', order: 1 }),
			group('top', { kind: 'layer', parent: 'l2' }),
		],
		nodes: [node('a', { group: 'l1' }), node('b', { group: 'top' })],
		edges: [edge('1', ['a', 'b'])],
	})

	it('связь между узлами одного яруса, но разных полос: узлы остаются в своих полосах и не накладываются', () => {
		const { nodes, groups } = runFlowLayout(createScope(mixed, { notation: plainNotation, layout: { direction: 'LR' } }))
		expect(isInside(nodes.a, groups.l1)).toBe(true)
		expect(isInside(nodes.b, groups.l2)).toBe(true)
		expect(groups.l2.y).toBeGreaterThan(groups.l1.y)
		expect(hasOverlaps(Object.values(nodes))).toBe(false)
	})
})

describe('полосы с рамкой-коробкой и сеткой', () => {
	const withBox = map({
		groups: [
			group('l1', { kind: 'lane', order: 0 }),
			group('l2', { kind: 'lane', order: 1 }),
			group('box', { kind: 'zone', parent: 'l1' }),
		],
		nodes: [node('a', { group: 'box' }), node('b', { group: 'l2' })],
		edges: [edge('1', ['a', 'b'])],
	})

	it('коробка внутри полосы получает рамку по узлам, полосы тянутся на всю ширину', () => {
		const { nodes, groups } = runFlowLayout(createScope(withBox, { notation: plainNotation, layout: { direction: 'LR' } }))
		expect(isInside(nodes.a, groups.box)).toBe(true)
		expect(isInside(groups.box, groups.l1)).toBe(true)
		expect(isInside(nodes.b, groups.l2)).toBe(true)
	})

	it('с сеткой 8 рамки полос стоят на узлах сетки', () => {
		const { groups } = runFlowLayout(createScope(withBox, { notation: plainNotation, layout: { direction: 'LR', gridSize: 8 } }))
		for (const id of ['l1', 'l2']) {
			expect(groups[id].x % 8).toBe(0)
			expect(groups[id].y % 8).toBe(0)
		}
	})
})
