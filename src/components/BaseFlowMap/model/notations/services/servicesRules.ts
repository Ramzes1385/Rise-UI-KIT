import { UI_FLOW_SERVICES } from '@/locales/messages'
import type { FlowNode } from '../../../types/data/flowData.types'
import type { FlowGraph } from '../../../types/api/flowLayout.types'
import type { FlowMapData } from '../../../types/data/flowData.types'
import { SERVICES_EDGE_KINDS } from '../../../types/notations/architecture/services.types'
import type {
	FlowConnectContext,
	FlowConnectionRule,
	FlowDataIssue,
	FlowNotationRules,
	FlowRuleResult,
} from '../../../types/api/flowNotation.types'

const CLIENTS = ['user', 'client']
const ENTRY = ['gateway', 'balancer']
const STORES = ['database', 'cache', 'storage']
const CALLERS = ['gateway', 'balancer', 'service', 'function', 'external']
const EVENT_SOURCES = [...CALLERS, ...STORES]
const EVENT_TARGETS = ['service', 'function']
const TARGETS = ['gateway', 'balancer', 'service', 'function', 'database', 'cache', 'queue', 'storage', 'external', 'client', 'user']
const EDGES: readonly string[] = SERVICES_EDGE_KINDS

const CONNECTIONS: FlowConnectionRule[] = [
	...EDGES.map(edge => ({ edge, from: CLIENTS, to: ENTRY })),
	{ edge: 'call', from: ['user'], to: ['client'] },
	{ edge: 'call', from: CALLERS, to: TARGETS },
	{ edge: 'event', from: EVENT_SOURCES, to: TARGETS },
	{ edge: 'event', from: ['queue'], to: EVENT_TARGETS },
	{ edge: 'data', from: EVENT_SOURCES, to: TARGETS },
]

function deny(code: string, message: string): FlowRuleResult {
	return { code, message }
}

function checkClient(kind: string, source: FlowNode, target: FlowNode): FlowRuleResult {
	const isUserToClient = source.kind === 'user' && target.kind === 'client' && kind === 'call'
	return ENTRY.includes(target.kind) || isUserToClient ? true : deny('client-via-gateway', UI_FLOW_SERVICES.RULE_CLIENT_VIA_GATEWAY)
}

function checkSource(kind: string, source: FlowNode, target: FlowNode): FlowRuleResult {
	if (kind === 'call' && STORES.includes(source.kind)) {
		return deny('store-calls-nobody', UI_FLOW_SERVICES.RULE_STORE_CALLS_NOBODY)
	}
	const isQueueMisuse = source.kind === 'queue' && (kind !== 'event' || !EVENT_TARGETS.includes(target.kind))
	return isQueueMisuse ? deny('queue-events-only', UI_FLOW_SERVICES.RULE_QUEUE_EVENTS_ONLY) : true
}

function checkServicesConnection(kind: string, source: FlowNode, target: FlowNode): FlowRuleResult {
	if (source.kind === 'note' || target.kind === 'note') {
		return deny('note-no-edges', UI_FLOW_SERVICES.RULE_NOTE_NO_EDGES)
	}
	return CLIENTS.includes(source.kind) ? checkClient(kind, source, target) : checkSource(kind, source, target)
}

function canConnect(context: FlowConnectContext): FlowRuleResult {
	return checkServicesConnection(context.kind, context.source, context.target)
}

function validate(_data: FlowMapData, graph: FlowGraph): FlowDataIssue[] {
	return [...graph.edges.values()].flatMap((edge): FlowDataIssue[] => {
		const source = graph.nodes.get(edge.source)
		const target = graph.nodes.get(edge.target)
		const result = source && target ? checkServicesConnection(edge.kind ?? 'call', source, target) : true
		return result === true
			? []
			: [{ level: 'warning', code: `services-${result.code}`, message: result.message, target: { entity: 'edge', id: edge.id } }]
	})
}

export const SERVICES_RULES: FlowNotationRules = { connections: CONNECTIONS, canConnect, validate }
