import { edge, group, map, node } from '../../fixtures/flowData'
import { buildFlowGraph } from '../../../../../model/data/flowGraph'

const data = map({
	groups: [
		group('g-outer'),
		group('g-inner', { parent: 'g-outer' }),
		group('g-loop-a', { parent: 'g-loop-b' }),
		group('g-loop-b', { parent: 'g-loop-a' }),
	],
	nodes: [
		node('a', { group: 'g-inner' }),
		node('b'),
		node('c'),
		node('d'),
		node('lonely'),
		node('ghost-group', { group: 'nope' }),
		node('in-loop', { group: 'g-loop-a' }),
	],
	edges: [edge('e1', ['a', 'b']), edge('e2', ['b', 'c']), edge('e3', ['a', 'c']), edge('e4', ['c', 'd']), edge('e5', ['d', 'a'])],
})

describe('buildFlowGraph', () => {
	const graph = buildFlowGraph(data)

	it('индексирует узлы, связи и группы по id', () => {
		expect(graph.nodes.get('a')?.label).toBe('a')
		expect(graph.edges.get('e2')?.target).toBe('c')
		expect(graph.groups.get('g-inner')?.parent).toBe('g-outer')
		expect(buildFlowGraph(map()).groups.size).toBe(0)
	})

	it('исходящие и входящие связи узла в порядке данных', () => {
		expect(graph.outgoing('a').map(item => item.id)).toEqual(['e1', 'e3'])
		expect(graph.incoming('c').map(item => item.id)).toEqual(['e2', 'e3'])
		expect(graph.outgoing('lonely')).toEqual([])
		expect(graph.incoming('lonely')).toEqual([])
		expect(graph.outgoing('unknown')).toEqual([])
	})

	it('цепочка групп — от ближней к корню', () => {
		expect(graph.ancestry('a').map(item => item.id)).toEqual(['g-inner', 'g-outer'])
		expect(graph.ancestry('b')).toEqual([])
		expect(graph.ancestry('missing')).toEqual([])
		expect(graph.ancestry('ghost-group')).toEqual([])
	})

	it('цепочка групп обрывается на цикле', () => {
		expect(graph.ancestry('in-loop').map(item => item.id)).toEqual(['g-loop-a', 'g-loop-b'])
	})

	it('путь — кратчайший по числу связей, в направлении связей', () => {
		expect(graph.path('a', 'c')).toEqual(['e3'])
		expect(graph.path('a', 'd')).toEqual(['e3', 'e4'])
		expect(graph.path('c', 'b')).toEqual(['e4', 'e5', 'e1'])
	})

	it('пути нет — пусто; путь в себя — пусто', () => {
		expect(graph.path('lonely', 'a')).toEqual([])
		expect(graph.path('a', 'lonely')).toEqual([])
		expect(graph.path('a', 'a')).toEqual([])
	})

	it('обход не зацикливается на цикле связей', () => {
		const cyc = buildFlowGraph(
			map({ nodes: [node('x'), node('y'), node('z')], edges: [edge('1', ['x', 'y']), edge('2', ['y', 'x']), edge('3', ['y', 'y'])] }),
		)
		expect(cyc.path('x', 'z')).toEqual([])
		expect(cyc.path('x', 'y')).toEqual(['1'])
	})
})
