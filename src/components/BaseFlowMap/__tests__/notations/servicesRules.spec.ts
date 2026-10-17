import { UI_FLOW_SERVICES } from '@/locales/messages'
import { guardConsole } from '../helpers/consoleGuard.test-utils'
import type { FlowRuleResult } from '../../types/api/flowNotation.types'
import { edge, graphOf, node } from '../helpers/flowFixtures.test-utils'
import { SERVICES_RULES } from '../../model/notations/services/servicesRules'
import { SERVICES_EDGE_KINDS, SERVICES_NODE_KINDS } from '../../types/notations/architecture/services.types'

guardConsole()

function check(kind: string, from: string, to: string): FlowRuleResult {
	const nodes = [node('s', from), node('t', to)]
	const data = { version: 1, nodes, edges: [] }
	return SERVICES_RULES.canConnect?.({ source: nodes[0], target: nodes[1], kind, data, graph: graphOf(nodes, []) }) ?? true
}

describe('карта сервисов: правила соединений', () => {
	it.each([
		['call', 'user', 'client'],
		['call', 'user', 'gateway'],
		['call', 'client', 'gateway'],
		['event', 'client', 'balancer'],
		['data', 'client', 'gateway'],
		['call', 'gateway', 'service'],
		['call', 'balancer', 'function'],
		['call', 'service', 'database'],
		['call', 'service', 'cache'],
		['call', 'function', 'queue'],
		['call', 'service', 'external'],
		['call', 'external', 'service'],
		['event', 'service', 'queue'],
		['event', 'queue', 'service'],
		['event', 'queue', 'function'],
		['event', 'database', 'service'],
		['data', 'cache', 'service'],
		['data', 'storage', 'function'],
	])('разрешено: %s %s → %s', (kind, from, to) => {
		expect(check(kind, from, to)).toBe(true)
	})

	it.each([
		['call', 'client', 'service', 'client-via-gateway', UI_FLOW_SERVICES.RULE_CLIENT_VIA_GATEWAY],
		['call', 'user', 'database', 'client-via-gateway', UI_FLOW_SERVICES.RULE_CLIENT_VIA_GATEWAY],
		['event', 'user', 'client', 'client-via-gateway', UI_FLOW_SERVICES.RULE_CLIENT_VIA_GATEWAY],
		['call', 'client', 'client', 'client-via-gateway', UI_FLOW_SERVICES.RULE_CLIENT_VIA_GATEWAY],
		['call', 'database', 'service', 'store-calls-nobody', UI_FLOW_SERVICES.RULE_STORE_CALLS_NOBODY],
		['call', 'cache', 'database', 'store-calls-nobody', UI_FLOW_SERVICES.RULE_STORE_CALLS_NOBODY],
		['call', 'storage', 'external', 'store-calls-nobody', UI_FLOW_SERVICES.RULE_STORE_CALLS_NOBODY],
		['call', 'queue', 'service', 'queue-events-only', UI_FLOW_SERVICES.RULE_QUEUE_EVENTS_ONLY],
		['data', 'queue', 'service', 'queue-events-only', UI_FLOW_SERVICES.RULE_QUEUE_EVENTS_ONLY],
		['event', 'queue', 'database', 'queue-events-only', UI_FLOW_SERVICES.RULE_QUEUE_EVENTS_ONLY],
		['event', 'queue', 'gateway', 'queue-events-only', UI_FLOW_SERVICES.RULE_QUEUE_EVENTS_ONLY],
		['call', 'note', 'service', 'note-no-edges', UI_FLOW_SERVICES.RULE_NOTE_NO_EDGES],
		['data', 'service', 'note', 'note-no-edges', UI_FLOW_SERVICES.RULE_NOTE_NO_EDGES],
		['call', 'note', 'note', 'note-no-edges', UI_FLOW_SERVICES.RULE_NOTE_NO_EDGES],
	])('запрещено: %s %s → %s (%s)', (...row) => {
		const [kind, from, to, code, message] = row
		expect(check(kind, from, to)).toEqual({ code, message })
	})

	it('таблица соединений и canConnect согласованы на всех сочетаниях видов', () => {
		const declared = new Set(
			(SERVICES_RULES.connections ?? []).flatMap(rule => rule.from.flatMap(from => rule.to.map(to => `${rule.edge}|${from}|${to}`))),
		)
		const triples = SERVICES_EDGE_KINDS.flatMap(kind =>
			SERVICES_NODE_KINDS.flatMap(from => SERVICES_NODE_KINDS.map(to => ({ kind, from, to }))),
		)
		const mismatches = triples
			.filter(({ kind, from, to }) => (check(kind, from, to) === true) !== declared.has(`${kind}|${from}|${to}`))
			.map(({ kind, from, to }) => `${kind} ${from} → ${to}`)
		expect(mismatches).toEqual([])
	})
})

describe('карта сервисов: проверка данных', () => {
	const nodes = [node('user', 'user'), node('db', 'database'), node('svc', 'service'), node('note', 'note')]

	it('нарушения — предупреждения по связи с кодом нотации и причиной', () => {
		const edges = [
			edge('e1', 'user', 'db'),
			edge('e2', 'db', 'svc', { kind: 'call' }),
			edge('e3', 'svc', 'note', { kind: 'data' }),
			edge('ok', 'svc', 'db'),
			edge('ok2', 'db', 'svc', { kind: 'event' }),
		]
		const graph = graphOf(nodes, edges)
		const issues = SERVICES_RULES.validate?.({ version: 1, nodes, edges }, graph)
		expect(issues).toEqual([
			{
				level: 'warning',
				code: 'services-client-via-gateway',
				message: UI_FLOW_SERVICES.RULE_CLIENT_VIA_GATEWAY,
				target: { entity: 'edge', id: 'e1' },
			},
			{
				level: 'warning',
				code: 'services-store-calls-nobody',
				message: UI_FLOW_SERVICES.RULE_STORE_CALLS_NOBODY,
				target: { entity: 'edge', id: 'e2' },
			},
			{
				level: 'warning',
				code: 'services-note-no-edges',
				message: UI_FLOW_SERVICES.RULE_NOTE_NO_EDGES,
				target: { entity: 'edge', id: 'e3' },
			},
		])
	})

	it('связь без вида проверяется как вызов; связь на отсутствующий узел не порождает замечаний', () => {
		const edges = [edge('e1', 'db', 'svc'), edge('ghost', 'svc', 'nowhere'), edge('ghost2', 'nowhere', 'svc')]
		const graph = graphOf(nodes, edges)
		const issues = SERVICES_RULES.validate?.({ version: 1, nodes, edges }, graph) ?? []
		expect(issues.map(issue => issue.target?.id)).toEqual(['e1'])
	})

	it('чистая карта — без замечаний', () => {
		const graph = graphOf(nodes, [edge('e', 'svc', 'db')])
		expect(SERVICES_RULES.validate?.({ version: 1, nodes, edges: [] }, graph)).toEqual([])
	})
})
