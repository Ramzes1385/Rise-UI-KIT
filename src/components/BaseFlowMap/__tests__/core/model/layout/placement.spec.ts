import type { FlowRect } from '../../../../types/data/flowData.types'
import { applyFixed, snapToGrid } from '../../../../model/layout/placement'
import type { FlowLayoutGroup, FlowLayoutInput, FlowLayoutNode, FlowLayoutResult } from '../../../../types/api/flowLayout.types'

const size = { width: 100, height: 40 }

function node(id: string, extra: Partial<FlowLayoutNode> = {}): FlowLayoutNode {
	return { id, kind: 'service', size, order: 0, ...extra }
}

function group(id: string, layout: FlowLayoutGroup['layout'], parent?: string): FlowLayoutGroup {
	return { id, kind: 'zone', layout, parent, order: 0, header: { width: 0, height: 24 } }
}

function input(nodes: FlowLayoutNode[], groups: FlowLayoutGroup[] = [], direction = 'TB'): FlowLayoutInput {
	return { nodes, edges: [], groups, settings: { direction, nodeGap: 24, rankGap: 48, gridSize: 8 } } as FlowLayoutInput
}

function result(nodes: Record<string, FlowRect>, groups: Record<string, FlowRect> = {}): FlowLayoutResult {
	return { nodes, groups, bounds: { x: 0, y: 0, width: 0, height: 0 } } as unknown as FlowLayoutResult
}

const rect = (x: number, y: number, extra: Partial<FlowRect> = {}): FlowRect => ({ x, y, width: 100, height: 40, ...extra })

describe('applyFixed: закреплённые узлы и рамки групп', () => {
	it('без закреплённых узлов возвращает тот же объект', () => {
		const base = result({ a: rect(0, 0) })
		expect(applyFixed(input([node('a')]), base)).toBe(base)
	})

	it('закреплённый узел занимает свою позицию, размер берёт из узла', () => {
		const next = applyFixed(input([node('a', { fixed: { x: 50, y: 70 } })]), result({ a: rect(0, 0, { width: 10, height: 10 }) }))
		expect(next.nodes.a).toEqual({ x: 50, y: 70, width: 100, height: 40 })
	})

	it('закреплённый узел вне рамки: рамка растёт и охватывает его', () => {
		const next = applyFixed(
			input([node('a', { group: 'z', fixed: { x: 400, y: 300 } })], [group('z', 'box')]),
			result({ a: rect(0, 0) }, { z: rect(0, 0, { width: 200, height: 100 }) }),
		)
		expect(next.groups.z).toEqual({ x: 0, y: 0, width: 500, height: 340 })
		expect(next.bounds).toEqual({ x: 0, y: 0, width: 500, height: 340 })
	})

	it('закреплённый узел левее и выше рамки: рамка растёт в обе стороны', () => {
		const next = applyFixed(
			input([node('a', { group: 'z', fixed: { x: -50, y: -30 } })], [group('z', 'box')]),
			result({ a: rect(0, 0) }, { z: rect(0, 0, { width: 200, height: 100 }) }),
		)
		expect(next.groups.z).toEqual({ x: -50, y: -30, width: 250, height: 130 })
	})

	it('вложенные рамки: растут и дочерняя, и родительская', () => {
		const next = applyFixed(
			input([node('a', { group: 'inner', fixed: { x: 600, y: 0 } })], [group('inner', 'box', 'outer'), group('outer', 'box')]),
			result({ a: rect(0, 0) }, { inner: rect(0, 0, { width: 200, height: 100 }), outer: rect(0, 0, { width: 300, height: 150 }) }),
		)
		expect(next.groups.inner).toEqual({ x: 0, y: 0, width: 700, height: 100 })
		expect(next.groups.outer).toEqual({ x: 0, y: 0, width: 700, height: 150 })
	})

	it('рамка внутри полосы: растёт только рамка, полоса не меняется', () => {
		const next = applyFixed(
			input([node('a', { group: 'frame', fixed: { x: 600, y: 0 } })], [group('frame', 'box', 'lane'), group('lane', 'band')]),
			result({ a: rect(0, 0) }, { frame: rect(0, 0, { width: 200, height: 100 }), lane: rect(0, 0, { width: 300, height: 150 }) }),
		)
		expect(next.groups.frame).toEqual({ x: 0, y: 0, width: 700, height: 100 })
		expect(next.groups.lane).toEqual(rect(0, 0, { width: 300, height: 150 }))
	})

	it('цепочка родителей пропускает полосу и растит рамку выше неё', () => {
		const next = applyFixed(
			input(
				[node('a', { group: 'frame', fixed: { x: 600, y: 0 } })],
				[group('frame', 'box', 'lane'), group('lane', 'band', 'outer'), group('outer', 'box')],
			),
			result(
				{ a: rect(0, 0) },
				{
					frame: rect(0, 0, { width: 200, height: 100 }),
					lane: rect(0, 0, { width: 300, height: 150 }),
					outer: rect(0, 0, { width: 400, height: 200 }),
				},
			),
		)
		expect(next.groups.lane).toEqual(rect(0, 0, { width: 300, height: 150 }))
		expect(next.groups.outer).toEqual({ x: 0, y: 0, width: 700, height: 200 })
	})

	it.each(['band', 'tier'] as const)('узел в группе «%s»: группы не меняются', layout => {
		const groups = { z: rect(0, 0, { width: 200, height: 100 }) }
		const next = applyFixed(
			input([node('a', { group: 'z', fixed: { x: 600, y: 0 } })], [group('z', layout)]),
			result({ a: rect(0, 0) }, groups),
		)
		expect(next.groups.z).toEqual(groups.z)
	})

	it('узел без группы и с неизвестной группой: группы не меняются, границы учитывают узел', () => {
		const groups = { z: rect(0, 0, { width: 200, height: 100 }) }
		const base = result({ a: rect(0, 0), b: rect(0, 0) }, groups)
		const next = applyFixed(
			input([node('a', { fixed: { x: 500, y: 0 } }), node('b', { group: 'нет', fixed: { x: 0, y: 400 } })], [group('z', 'box')]),
			base,
		)
		expect(next.groups.z).toEqual(groups.z)
		expect(next.bounds).toEqual({ x: 0, y: 0, width: 600, height: 440 })
	})

	it('несколько закреплённых в одной рамке: итог равен объединению', () => {
		const next = applyFixed(
			input(
				[node('a', { group: 'z', fixed: { x: 400, y: 0 } }), node('b', { group: 'z', fixed: { x: 0, y: 300 } })],
				[group('z', 'box')],
			),
			result({ a: rect(0, 0), b: rect(0, 0) }, { z: rect(0, 0, { width: 200, height: 100 }) }),
		)
		expect(next.groups.z).toEqual({ x: 0, y: 0, width: 500, height: 340 })
	})

	it('закреплённый узел уже внутри рамки: рамка не меняется', () => {
		const next = applyFixed(
			input([node('a', { group: 'z', fixed: { x: 10, y: 10 } })], [group('z', 'box')]),
			result({ a: rect(0, 0) }, { z: rect(0, 0, { width: 200, height: 100 }) }),
		)
		expect(next.groups.z).toEqual(rect(0, 0, { width: 200, height: 100 }))
	})

	it('рамка группы, которой нет в результате, не создаётся', () => {
		const next = applyFixed(input([node('a', { group: 'z', fixed: { x: 10, y: 10 } })], [group('z', 'box')]), result({ a: rect(0, 0) }))
		expect(next.groups).toEqual({})
	})
})

describe('applyFixed: свободные узлы обходят закреплённые', () => {
	it.each([
		['LR', { x: 116 }],
		['RL', { x: -116 }],
		['BT', { y: -56 }],
		['TB', { y: 56 }],
	])('направление %s: наложившийся узел отодвигается за закреплённый', (direction, expected) => {
		const next = applyFixed(
			input([node('fix', { fixed: { x: 0, y: 0 } }), node('free')], [], direction),
			result({ fix: rect(0, 0), free: rect(0, 0) }),
		)
		expect(next.nodes.free).toMatchObject(expected)
	})

	it('узлы без наложения остаются на месте', () => {
		const next = applyFixed(
			input([node('fix', { fixed: { x: 0, y: 0 } }), node('free')]),
			result({ fix: rect(0, 0), free: rect(500, 500) }),
		)
		expect(next.nodes.free).toEqual(rect(500, 500))
	})

	it('длинная цепочка закреплённых: сдвиг останавливается после предельного числа кругов', () => {
		const fixed = Array.from({ length: 60 }, (_, index) =>
			node(`f${index}`, { fixed: { x: index * 20, y: 0 }, size: { width: 30, height: 40 } }),
		)
		const placed = Object.fromEntries(fixed.map((item, index) => [item.id, rect(index * 20, 0, { width: 30, height: 40 })]))
		const next = applyFixed(
			input([...fixed, node('free', { size: { width: 10, height: 40 } })], [], 'LR'),
			result({ ...placed, free: rect(0, 0, { width: 10, height: 40 }) }),
		)
		expect(next.nodes.free.x).toBeGreaterThan(0)
	})
})

describe('snapToGrid', () => {
	it('сетка 0 возвращает тот же объект', () => {
		const base = result({ a: rect(3, 5) })
		const withoutGrid = { ...input([node('a')]), settings: { ...input([]).settings, gridSize: 0 } }
		expect(snapToGrid(withoutGrid, base)).toBe(base)
	})

	it('свободные узлы привязываются к сетке, закреплённые остаются как есть', () => {
		const next = snapToGrid(input([node('a'), node('b', { fixed: { x: 3, y: 5 } })]), result({ a: rect(11, 13), b: rect(3, 5) }))
		expect(next.nodes.a).toMatchObject({ x: 8, y: 16 })
		expect(next.nodes.b).toEqual(rect(3, 5))
	})
})
