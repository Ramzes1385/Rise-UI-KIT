import { formatMessage } from '@/locales/state'
import { UI_FLOW_IDEF } from '@/locales/messages'
import { edge, graphOf, mapData, node } from '../fixtures/idefData'
import type { FlowEdge, FlowNode } from '../../types/data/flowData.types'
import { idef3KindOf, idef3Rules, isFlowEdge } from '../../model/notations/idef3/idef3Rules'

function connect(source: FlowNode, target: FlowNode, kind: string) {
	const data = mapData([source, target], [])
	return idef3Rules.canConnect!({ source, target, kind, data, graph: graphOf(data.nodes, data.edges) })
}

function validate(nodes: FlowNode[], edges: FlowEdge[]) {
	return idef3Rules.validate!(mapData(nodes, edges), graphOf(nodes, edges))
}

const uob = (id: string): FlowNode => node(id, 'uob')
const junction = (id: string, kind = 'junction-and'): FlowNode => node(id, kind, id)
const referent = (id: string): FlowNode => node(id, 'referent')

describe('IDEF3: правила соединения', () => {
	it('idef3KindOf отбрасывает префикс нотации', () => {
		expect(idef3KindOf(node('a', 'idef3:uob'))).toBe('uob')
		expect(idef3KindOf(node('a', 'uob'))).toBe('uob')
	})

	it('isFlowEdge: связь без вида, предшествование и поток объекта — потоки; отношение — нет', () => {
		expect(isFlowEdge(edge('e', 'a>b'))).toBe(true)
		expect(isFlowEdge(edge('e', 'a>b', { kind: 'precedence' }))).toBe(true)
		expect(isFlowEdge(edge('e', 'a>b', { kind: 'object-flow' }))).toBe(true)
		expect(isFlowEdge(edge('e', 'a>b', { kind: 'relational' }))).toBe(false)
	})

	it('предшествование и поток объекта — между UOB и соединениями, отношение — между любыми узлами', () => {
		const flowNodes = ['uob', 'junction-and', 'junction-or', 'junction-xor']
		expect(idef3Rules.connections).toEqual([
			{ edge: 'precedence', from: flowNodes, to: flowNodes },
			{ edge: 'object-flow', from: flowNodes, to: flowNodes },
			{ edge: 'relational', from: ['*'], to: ['*'] },
		])
	})

	it('UOB соединяется с UOB и с соединением любой связью-потоком', () => {
		expect(connect(uob('a'), uob('b'), 'precedence')).toBe(true)
		expect(connect(uob('a'), junction('j', 'junction-xor'), 'object-flow')).toBe(true)
	})

	it('ссылка подключается только связью отношения — в любую сторону', () => {
		expect(connect(uob('a'), referent('r'), 'relational')).toBe(true)
		expect(connect(referent('r'), uob('a'), 'relational')).toBe(true)
		const denied = { code: 'idef3-referent-link', message: UI_FLOW_IDEF.RULE_REFERENT_RELATIONAL }
		expect(connect(uob('a'), referent('r'), 'precedence')).toEqual(denied)
		expect(connect(referent('r'), uob('a'), 'object-flow')).toEqual(denied)
	})
})

describe('IDEF3: проверка данных', () => {
	it('соединение, которое и разветвляет, и сливает, получает предупреждение с именем', () => {
		const nodes = [uob('a'), uob('b'), junction('j'), uob('c'), uob('d')]
		const edges = [edge('e1', 'a>j'), edge('e2', 'b>j'), edge('e3', 'j>c'), edge('e4', 'j>d')]
		expect(validate(nodes, edges)).toEqual([
			{
				level: 'warning',
				code: 'idef3-junction-mixed',
				message: formatMessage(UI_FLOW_IDEF.WARN_JUNCTION_MIXED, { name: 'j' }),
				target: { entity: 'node', id: 'j' },
			},
		])
	})

	it('без подписи в предупреждении называется id соединения', () => {
		const nodes = [uob('a'), uob('b'), node('j-1', 'junction-or', ''), uob('c'), uob('d')]
		const edges = [edge('e1', 'a>j-1'), edge('e2', 'b>j-1'), edge('e3', 'j-1>c'), edge('e4', 'j-1>d')]
		expect(validate(nodes, edges)[0]!.message).toBe(formatMessage(UI_FLOW_IDEF.WARN_JUNCTION_MIXED, { name: 'j-1' }))
	})

	it('разветвляющее и сливающее соединения по отдельности — без предупреждений', () => {
		const nodes = [uob('a'), junction('split'), uob('b'), uob('c'), junction('join'), uob('d')]
		const edges = [
			edge('e1', 'a>split'),
			edge('e2', 'split>b'),
			edge('e3', 'split>c'),
			edge('e4', 'b>join'),
			edge('e5', 'c>join'),
			edge('e6', 'join>d'),
		]
		expect(validate(nodes, edges)).toEqual([])
	})

	it('связи отношения при подсчёте не считаются', () => {
		const nodes = [uob('a'), uob('b'), junction('j'), uob('c'), uob('d')]
		const edges = [
			edge('e1', 'a>j'),
			edge('e2', 'b>j', { kind: 'relational' }),
			edge('e3', 'j>c'),
			edge('e4', 'j>d', { kind: 'relational' }),
		]
		expect(validate(nodes, edges)).toEqual([])
	})

	it('UOB с несколькими входами и выходами — не соединение, предупреждения нет', () => {
		const nodes = [uob('a'), uob('b'), uob('m'), uob('c'), uob('d')]
		const edges = [edge('e1', 'a>m'), edge('e2', 'b>m'), edge('e3', 'm>c'), edge('e4', 'm>d')]
		expect(validate(nodes, edges)).toEqual([])
	})
})
