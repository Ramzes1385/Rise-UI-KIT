import { formatMessage } from '@/locales/state'
import { UI_FLOW_BPMN } from '@/locales/messages'
import { buildFlowGraph } from '../../model/data/flowGraph'
import { BPMN_RULES } from '../../model/notations/bpmn/bpmnRules'
import { guardConsole } from '../helpers/consoleGuard.test-utils'
import { triggerLabel } from '../../model/notations/bpmn/bpmnLabels'
import { BPMN_NODE_KINDS } from '../../model/notations/bpmn/bpmnKinds'
import { edge, group, mapOf, node } from '../helpers/flowFixtures.test-utils'
import type { FlowEdge, FlowGroup, FlowNode } from '../../types/data/flowData.types'

guardConsole()

const POOLS = [group('poolA', 'pool'), group('poolB', 'pool')]

function inPool(id: string, kind: string, ...rest: [pool?: string, props?: FlowNode['props']]): FlowNode {
	return node(id, kind, { group: rest[0] ?? 'poolA', props: rest[1] })
}

function check(kind: string, source: FlowNode, ...rest: [target: FlowNode, extra?: { edges?: FlowEdge[]; groups?: FlowGroup[] }]) {
	const [target, extra = {}] = rest
	const data = mapOf({ nodes: [source, target], edges: extra.edges, groups: extra.groups ?? POOLS })
	return BPMN_RULES.canConnect?.({ source, target, kind, data, graph: buildFlowGraph(data) })
}

function denied(code: string, message: string) {
	return { code, message }
}

describe('BPMN: поток управления (sequence)', () => {
	it.each([
		['start', 'task'],
		['task', 'exclusive'],
		['exclusive', 'end'],
		['task', 'intermediate'],
		['boundary', 'task'],
		['intermediate', 'end'],
		['subprocess', 'call-activity'],
		['transaction', 'parallel'],
		['complex', 'inclusive'],
		['parallel', 'event-based'],
	])('разрешено в одном пуле: %s → %s', (from, to) => {
		expect(check('sequence', inPool('a', from), inPool('b', to))).toBe(true)
	})

	it('разрешено и вне пулов: у обоих концов нет пула', () => {
		expect(check('sequence', node('a', 'task'), node('b', 'end'))).toBe(true)
	})

	it.each([
		['data-object', 'task', 'sequence-not-data', UI_FLOW_BPMN.RULE_SEQUENCE_NOT_DATA],
		['task', 'data-store', 'sequence-not-data', UI_FLOW_BPMN.RULE_SEQUENCE_NOT_DATA],
		['annotation', 'task', 'sequence-not-data', UI_FLOW_BPMN.RULE_SEQUENCE_NOT_DATA],
		['end', 'task', 'end-no-outgoing', UI_FLOW_BPMN.RULE_END_NO_OUTGOING],
		['task', 'start', 'start-no-incoming', UI_FLOW_BPMN.RULE_START_NO_INCOMING],
		['task', 'boundary', 'boundary-no-incoming', UI_FLOW_BPMN.RULE_BOUNDARY_NO_INCOMING],
	])('запрещено: %s → %s (%s)', (...row) => {
		const [from, to, code, message] = row
		expect(check('sequence', inPool('a', from), inPool('b', to))).toEqual(denied(code, message))
	})

	it('запрещено между разными пулами и между пулом и «без пула»', () => {
		const expected = denied('sequence-same-pool', UI_FLOW_BPMN.RULE_SEQUENCE_SAME_POOL)
		expect(check('sequence', inPool('a', 'task', 'poolA'), inPool('b', 'task', 'poolB'))).toEqual(expected)
		expect(check('sequence', inPool('a', 'task'), node('b', 'task'))).toEqual(expected)
	})

	it('пул определяется по предкам: задача в дорожке пула — в пуле', () => {
		const groups = [group('poolA', 'pool'), group('laneA', 'lane', { parent: 'poolA' })]
		expect(check('sequence', inPool('a', 'task', 'laneA'), inPool('b', 'task', 'poolA'), { groups })).toBe(true)
	})

	it('после событийного шлюза — только принимающие события и задача «получение»', () => {
		const expected = denied('event-based-target', UI_FLOW_BPMN.RULE_EVENT_BASED_TARGET)
		const gate = inPool('g', 'event-based')
		expect(check('sequence', gate, inPool('t', 'intermediate'))).toBe(true)
		expect(check('sequence', gate, inPool('r', 'task', 'poolA', { taskType: 'receive' }))).toBe(true)
		expect(check('sequence', gate, inPool('t', 'intermediate', 'poolA', { isThrowing: true }))).toEqual(expected)
		expect(check('sequence', gate, inPool('t', 'task'))).toEqual(expected)
		expect(check('sequence', gate, inPool('t', 'task', 'poolA', { taskType: 'user' }))).toEqual(expected)
		expect(check('sequence', gate, inPool('t', 'end'))).toEqual(expected)
	})

	it('у граничного события один исходящий поток: второй запрещён, другие виды связей не считаются', () => {
		const boundary = inPool('bd', 'boundary')
		const first = edge('f', 'bd', 'x')
		const second = check('sequence', boundary, inPool('y', 'task'), { edges: [first] })
		expect(second).toEqual(denied('boundary-one-outgoing', UI_FLOW_BPMN.RULE_BOUNDARY_ONE_OUTGOING))
		expect(check('sequence', boundary, inPool('y', 'task'), { edges: [edge('f', 'bd', 'x', { kind: 'sequence' })] })).toEqual(second)
		expect(check('sequence', boundary, inPool('y', 'task'), { edges: [edge('f', 'bd', 'x', { kind: 'association' })] })).toBe(true)
		expect(check('sequence', boundary, inPool('y', 'task'))).toBe(true)
		expect(check('sequence', inPool('t', 'task'), inPool('y', 'task'), { edges: [edge('f', 't', 'x')] })).toBe(true)
	})
})

describe('BPMN: потоки сообщений (message)', () => {
	it.each([
		['task', 'task'],
		['subprocess', 'start'],
		['end', 'intermediate'],
		['intermediate-throw', 'task'],
		['task', 'intermediate'],
	])('разрешено между пулами: %s → %s', (from, to) => {
		const source = from === 'intermediate-throw' ? inPool('a', 'intermediate', 'poolA', { isThrowing: true }) : inPool('a', from)
		expect(check('message', source, inPool('b', to, 'poolB'))).toBe(true)
	})

	it('запрещено внутри одного пула и вне пулов', () => {
		const expected = denied('message-different-pools', UI_FLOW_BPMN.RULE_MESSAGE_DIFFERENT_POOLS)
		expect(check('message', inPool('a', 'task'), inPool('b', 'task'))).toEqual(expected)
		expect(check('message', node('a', 'task'), node('b', 'task'))).toEqual(expected)
	})

	it.each(['start', 'boundary', 'exclusive', 'data-object', 'annotation'])('нельзя слать сообщение из «%s»', from => {
		expect(check('message', inPool('a', from), inPool('b', 'task', 'poolB'))).toEqual(
			denied('message-source', UI_FLOW_BPMN.RULE_MESSAGE_SOURCE),
		)
	})

	it('нельзя слать сообщение из принимающего промежуточного события', () => {
		expect(check('message', inPool('a', 'intermediate'), inPool('b', 'task', 'poolB'))).toEqual(
			denied('message-source', UI_FLOW_BPMN.RULE_MESSAGE_SOURCE),
		)
	})

	it.each(['end', 'boundary', 'exclusive', 'data-store'])('нельзя принимать сообщение в «%s»', to => {
		expect(check('message', inPool('a', 'task'), inPool('b', to, 'poolB'))).toEqual(
			denied('message-target', UI_FLOW_BPMN.RULE_MESSAGE_TARGET),
		)
	})

	it('нельзя принимать сообщение в бросающее промежуточное событие', () => {
		const target = inPool('b', 'intermediate', 'poolB', { isThrowing: true })
		expect(check('message', inPool('a', 'task'), target)).toEqual(denied('message-target', UI_FLOW_BPMN.RULE_MESSAGE_TARGET))
	})
})

describe('BPMN: ассоциации', () => {
	it.each([
		['annotation', 'task'],
		['task', 'annotation'],
		['exclusive', 'annotation'],
	])('association разрешена: %s → %s', (from, to) => {
		expect(check('association', inPool('a', from), inPool('b', to))).toBe(true)
	})

	it('association без примечания запрещена', () => {
		expect(check('association', inPool('a', 'task'), inPool('b', 'end'))).toEqual(
			denied('association-ends', UI_FLOW_BPMN.RULE_ASSOCIATION_ENDS),
		)
	})

	it.each([
		['task', 'data-object'],
		['data-store', 'start'],
		['subprocess', 'data-store'],
		['data-object', 'end'],
		['intermediate', 'data-object'],
	])('data-association разрешена: %s → %s', (from, to) => {
		expect(check('data-association', inPool('a', from), inPool('b', to))).toBe(true)
	})

	it.each([
		['task', 'task'],
		['data-object', 'data-store'],
		['data-object', 'exclusive'],
		['annotation', 'data-object'],
		['task', 'annotation'],
	])('data-association запрещена: %s → %s', (from, to) => {
		expect(check('data-association', inPool('a', from), inPool('b', to))).toEqual(
			denied('data-association-ends', UI_FLOW_BPMN.RULE_DATA_ASSOCIATION_ENDS),
		)
	})

	it('неизвестный вид связи правилами BPMN не ограничивается', () => {
		expect(check('whatever', inPool('a', 'end'), inPool('b', 'start'))).toBe(true)
	})
})

describe('BPMN: таблица допустимых соединений', () => {
	it('всё, что разрешает canConnect, перечислено в таблице (с учётом условия по пулам)', () => {
		const kinds = Object.keys(BPMN_NODE_KINDS)
		const rules = BPMN_RULES.connections ?? []
		const isListed = (cell: { kind: string; from: string; to: string; isDifferent: boolean }) =>
			rules.some(
				rule =>
					rule.edge === cell.kind &&
					(rule.from.includes(cell.from) || rule.from.includes('*')) &&
					(rule.to.includes(cell.to) || rule.to.includes('*')) &&
					(rule.pools === undefined || (rule.pools === 'different') === cell.isDifferent),
			)
		const cells = ['sequence', 'message', 'association', 'data-association'].flatMap(kind =>
			kinds.flatMap(from => kinds.flatMap(to => [false, true].map(isDifferent => ({ kind, from, to, isDifferent })))),
		)
		const stray = cells
			.filter(cell => check(cell.kind, inPool('a', cell.from), inPool('b', cell.to, cell.isDifferent ? 'poolB' : 'poolA')) === true)
			.filter(cell => !isListed(cell))
			.map(cell => `${cell.kind} ${cell.from} → ${cell.to}`)
		expect(stray).toEqual([])
	})

	it('в таблице sequence — в одном пуле, message — между пулами', () => {
		const rules = BPMN_RULES.connections ?? []
		expect(rules.find(rule => rule.edge === 'sequence')?.pools).toBe('same')
		expect(rules.find(rule => rule.edge === 'message')?.pools).toBe('different')
	})
})

describe('BPMN: проверка карты (validate)', () => {
	function issuesOf(parts: Parameters<typeof mapOf>[0]) {
		const data = mapOf(parts)
		return BPMN_RULES.validate?.(data, buildFlowGraph(data)) ?? []
	}

	it('нарушение правила соединения — предупреждение по связи с префиксом bpmn-', () => {
		const issues = issuesOf({
			nodes: [node('e', 'end'), node('t', 'task')],
			edges: [edge('bad', 'e', 't'), edge('msg', 't', 'e', { kind: 'message' })],
		})
		expect(issues).toEqual([
			{
				level: 'warning',
				code: 'bpmn-end-no-outgoing',
				message: UI_FLOW_BPMN.RULE_END_NO_OUTGOING,
				target: { entity: 'edge', id: 'bad' },
			},
			{
				level: 'warning',
				code: 'bpmn-message-different-pools',
				message: UI_FLOW_BPMN.RULE_MESSAGE_DIFFERENT_POOLS,
				target: { entity: 'edge', id: 'msg' },
			},
		])
	})

	it('связь на отсутствующий узел не порождает замечаний', () => {
		expect(issuesOf({ nodes: [node('t', 'task')], edges: [edge('x', 't', 'nowhere'), edge('y', 'nowhere', 't')] })).toEqual([])
	})

	it('граничное событие с несколькими исходящими потоками — замечание на узле', () => {
		const issues = issuesOf({
			nodes: [node('b', 'boundary'), node('x', 'task'), node('y', 'task'), node('n', 'annotation')],
			edges: [edge('1', 'b', 'x'), edge('2', 'b', 'y'), edge('3', 'b', 'n', { kind: 'association' })],
		})
		expect(issues.filter(issue => issue.code === 'bpmn-boundary-one-outgoing')).toEqual([
			{
				level: 'warning',
				code: 'bpmn-boundary-one-outgoing',
				message: UI_FLOW_BPMN.RULE_BOUNDARY_ONE_OUTGOING,
				target: { entity: 'node', id: 'b' },
			},
		])
	})

	it('один исходящий поток граничного события и ассоциация — без замечаний', () => {
		const issues = issuesOf({
			nodes: [node('b', 'boundary'), node('x', 'task'), node('n', 'annotation')],
			edges: [edge('1', 'b', 'x'), edge('3', 'b', 'n', { kind: 'association' })],
		})
		expect(issues).toEqual([])
	})

	it.each(['exclusive', 'inclusive', 'parallel', 'complex'])(
		'шлюз «%s» и с несколькими входами, и с несколькими выходами — смешанный',
		kind => {
			const issues = issuesOf({
				nodes: [node('a', 'task'), node('b', 'task'), node('g', kind, { label: 'Проверка' }), node('c', 'task'), node('d', 'task')],
				edges: [edge('1', 'a', 'g'), edge('2', 'b', 'g'), edge('3', 'g', 'c'), edge('4', 'g', 'd')],
			})
			expect(issues).toEqual([
				{
					level: 'warning',
					code: 'bpmn-gateway-mixed',
					message: formatMessage(UI_FLOW_BPMN.ISSUE_GATEWAY_MIXED, { label: 'Проверка' }),
					target: { entity: 'node', id: 'g' },
				},
			])
		},
	)

	it('шлюз-разветвитель, шлюз-слияние и событийный шлюз не смешанные', () => {
		const split = issuesOf({
			nodes: [node('g', 'exclusive'), node('c', 'task'), node('d', 'task'), node('a', 'task')],
			edges: [edge('1', 'a', 'g'), edge('3', 'g', 'c'), edge('4', 'g', 'd')],
		})
		const join = issuesOf({
			nodes: [node('g', 'exclusive'), node('c', 'task'), node('a', 'task'), node('b', 'task')],
			edges: [edge('1', 'a', 'g'), edge('2', 'b', 'g'), edge('3', 'g', 'c')],
		})
		const eventBased = issuesOf({
			nodes: [node('g', 'event-based'), node('a', 'task'), node('b', 'task'), node('c', 'intermediate'), node('d', 'intermediate')],
			edges: [edge('1', 'a', 'g'), edge('2', 'b', 'g'), edge('3', 'g', 'c'), edge('4', 'g', 'd')],
		})
		expect([split, join, eventBased]).toEqual([[], [], []])
	})

	it('потоки сообщений при подсчёте смешанного шлюза не считаются', () => {
		const issues = issuesOf({
			nodes: [node('g', 'exclusive'), node('a', 'task'), node('b', 'task'), node('c', 'task'), node('d', 'task')],
			edges: [edge('1', 'a', 'g'), edge('2', 'b', 'g', { kind: 'message' }), edge('3', 'g', 'c'), edge('4', 'g', 'd')],
		})
		expect(issues.filter(issue => issue.code === 'bpmn-gateway-mixed')).toEqual([])
	})

	it.each([
		['start', 'terminate', undefined],
		['start', 'error', undefined],
		['end', 'timer', undefined],
		['end', 'link', undefined],
		['boundary', 'none', undefined],
		['boundary', 'terminate', undefined],
		['intermediate', 'terminate', undefined],
		['intermediate', 'error', undefined],
		['intermediate', 'conditional', true],
		['intermediate', 'timer', true],
	])('событие «%s» не допускает запуск «%s» (isThrowing: %s)', (kind, trigger, isThrowing) => {
		const issues = issuesOf({ nodes: [node('ev', kind, { label: 'Событие', props: { trigger, isThrowing: isThrowing ?? false } })] })
		expect(issues).toEqual([
			{
				level: 'warning',
				code: 'bpmn-trigger-invalid',
				message: formatMessage(UI_FLOW_BPMN.ISSUE_TRIGGER_INVALID, { label: 'Событие', trigger: triggerLabel(trigger as 'none') }),
				target: { entity: 'node', id: 'ev' },
			},
		])
	})

	it.each([
		['start', 'timer', undefined],
		['start', 'none', undefined],
		['end', 'terminate', undefined],
		['boundary', 'timer', undefined],
		['intermediate', 'timer', false],
		['intermediate', 'escalation', true],
		['intermediate', 'link', true],
	])('событие «%s» с запуском «%s» (isThrowing: %s) допустимо', (kind, trigger, isThrowing) => {
		expect(issuesOf({ nodes: [node('ev', kind, { props: { trigger, isThrowing: isThrowing ?? false } })] })).toEqual([])
	})

	it('событие без запуска, не событие с любыми свойствами — без замечаний о запуске', () => {
		expect(
			issuesOf({
				nodes: [node('a', 'start'), node('b', 'start', { props: {} }), node('t', 'task', { props: { trigger: 'terminate' } })],
			}),
		).toEqual([])
	})

	it('дорожка вне пула — замечание; в пуле, во вложенных группах и пул/группа — нет', () => {
		const issues = issuesOf({
			nodes: [],
			groups: [
				group('lone', 'lane', { label: 'Склад' }),
				group('pool', 'pool'),
				group('inPool', 'lane', { parent: 'pool' }),
				group('nested', 'lane', { parent: 'inPool' }),
				group('box', 'group'),
				group('cycleA', 'lane', { parent: 'cycleB' }),
				group('cycleB', 'lane', { parent: 'cycleA' }),
				group('orphan', 'lane', { parent: 'missing' }),
			],
		})
		const lanes = issues.filter(issue => issue.code === 'bpmn-lane-outside-pool').map(issue => issue.target?.id)
		expect(lanes).toEqual(['lone', 'cycleA', 'cycleB', 'orphan'])
		expect(issues[0]).toEqual({
			level: 'warning',
			code: 'bpmn-lane-outside-pool',
			message: formatMessage(UI_FLOW_BPMN.ISSUE_LANE_OUTSIDE_POOL, { label: 'Склад' }),
			target: { entity: 'group', id: 'lone' },
		})
	})

	it('чистая карта — без замечаний', () => {
		const issues = issuesOf({
			nodes: [inPool('s', 'start'), inPool('t', 'task'), inPool('e', 'end')],
			edges: [edge('1', 's', 't'), edge('2', 't', 'e')],
			groups: [group('poolA', 'pool'), group('lane', 'lane', { parent: 'poolA' })],
		})
		expect(issues).toEqual([])
	})
})
