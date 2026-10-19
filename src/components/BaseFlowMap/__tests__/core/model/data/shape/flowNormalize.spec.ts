import { edge, group, map, node } from '../../fixtures/flowData'
import { normalizeFlowData } from '../../../../../model/data/flowNormalize'
import type { FlowNotation } from '../../../../../types/api/flowNotation.types'

const notation: FlowNotation = {
	id: 'test',
	label: () => 'Test',
	nodeKinds: {
		service: { label: () => 'Service', render: 'html', shape: { shape: 'rect' }, size: { width: 10, height: 10 } },
		actor: { label: () => 'Actor', render: 'html', shape: { shape: 'person' }, size: { width: 10, height: 10 }, isExternal: true },
	},
	edgeKinds: { flow: { label: () => 'Flow', stroke: 'solid' } },
	defaultNodeKind: 'service',
	defaultEdgeKind: 'flow',
}
const registry = new Map([[notation.id, notation]])

describe('normalizeFlowData', () => {
	it('внешний вид из нотации проставляется узлу, если не задан', () => {
		const result = normalizeFlowData(map({ nodes: [node('a', { kind: 'actor' })] }), notation, registry)
		expect(result.nodes[0].isExternal).toBe(true)
	})

	it('явное isExternal не перезаписывается', () => {
		const data = map({ nodes: [node('a', { kind: 'actor', isExternal: false })] })
		expect(normalizeFlowData(data, notation, registry)).toBe(data)
	})

	it('вид без isExternal и неизвестный вид узел не меняют', () => {
		const data = map({ nodes: [node('a'), node('b', { kind: 'unknown' })] })
		expect(normalizeFlowData(data, notation, registry).nodes).toBe(data.nodes)
	})

	it('связи без вида получают вид по умолчанию', () => {
		const result = normalizeFlowData(map({ nodes: [node('a')], edges: [edge('e', ['a', 'a'])] }), notation, registry)
		expect(result.edges[0].kind).toBe('flow')
	})

	it('группы упорядочиваются по order, без order — по месту, равные — стабильно', () => {
		const data = map({ groups: [group('c', { order: 2 }), group('a'), group('b', { order: 0 }), group('d', { order: 1 })] })
		const ids = normalizeFlowData(data, notation, registry).groups?.map(item => item.id)
		expect(ids).toEqual(['b', 'a', 'd', 'c'])
		const ties = normalizeFlowData(map({ groups: [group('x', { order: 1 }), group('y', { order: 1 })] }), notation, registry)
		expect(ties.groups?.map(item => item.id)).toEqual(['x', 'y'])
	})

	it('нормальные данные возвращаются тем же объектом', () => {
		const data = map({
			nodes: [node('a')],
			edges: [edge('e', ['a', 'a'], { kind: 'flow' })],
			groups: [group('g', { order: 0 }), group('h', { order: 1 })],
		})
		expect(normalizeFlowData(data, notation, registry)).toBe(data)
		const plain = map({ nodes: [node('a')] })
		expect(normalizeFlowData(plain, notation, registry)).toBe(plain)
	})

	it('исходные данные не изменяются', () => {
		const data = map({
			nodes: [node('a', { kind: 'actor' })],
			edges: [edge('e', ['a', 'a'])],
			groups: [group('b', { order: 2 }), group('a', { order: 1 })],
		})
		const snapshot = structuredClone(data)
		normalizeFlowData(data, notation, registry)
		expect(data).toEqual(snapshot)
	})
})
