import { triggerLabel } from './bpmnLabels'
import { formatMessage } from '@/locales/state'
import { UI_FLOW_BPMN } from '@/locales/messages'
import type { FlowGraph } from '../../../types/api/flowLayout.types'
import type { FlowEdge, FlowGroup, FlowMapData, FlowNode } from '../../../types/data/flowData.types'
import type { BpmnActivityProps, BpmnEventProps, BpmnEventTrigger } from '../../../types/notations/process/bpmn.types'
import {
	BPMN_ACTIVITY_KINDS,
	BPMN_EVENT_KINDS,
	BPMN_GATEWAY_KINDS,
	BPMN_TRIGGERS_BY_KIND,
} from '../../../types/notations/process/bpmn.types'
import type {
	FlowConnectContext,
	FlowConnectionRule,
	FlowDataIssue,
	FlowNotationRules,
	FlowRuleResult,
} from '../../../types/api/flowNotation.types'

const ARTIFACTS = ['data-object', 'data-store', 'annotation']
const ACTIVITIES: readonly string[] = BPMN_ACTIVITY_KINDS
const GATEWAYS: readonly string[] = BPMN_GATEWAY_KINDS
const EVENTS: readonly string[] = BPMN_EVENT_KINDS
const DATA = ['data-object', 'data-store']
const FLOW_SOURCES = ['start', 'intermediate', 'boundary', ...ACTIVITIES, ...GATEWAYS]
const FLOW_TARGETS = ['intermediate', 'end', ...ACTIVITIES, ...GATEWAYS]
const MESSAGE_SOURCES = ['intermediate', 'end', ...ACTIVITIES]
const MESSAGE_TARGETS = ['start', 'intermediate', ...ACTIVITIES]
const GATEWAYS_WITH_MIXED_CHECK = ['exclusive', 'inclusive', 'parallel', 'complex']

const CONNECTIONS: FlowConnectionRule[] = [
	{ edge: 'sequence', from: FLOW_SOURCES, to: FLOW_TARGETS, pools: 'same' },
	{ edge: 'message', from: MESSAGE_SOURCES, to: MESSAGE_TARGETS, pools: 'different' },
	{ edge: 'association', from: ['*'], to: ['annotation'] },
	{ edge: 'association', from: ['annotation'], to: ['*'] },
	{ edge: 'data-association', from: [...ACTIVITIES, ...EVENTS], to: DATA },
	{ edge: 'data-association', from: DATA, to: [...ACTIVITIES, ...EVENTS] },
]

function deny(code: string, message: string): FlowRuleResult {
	return { code, message }
}

function poolOf(graph: FlowGraph, node: FlowNode): string | null {
	return graph.ancestry(node.id).find(group => group.kind === 'pool')?.id ?? null
}

function isThrowing(node: FlowNode): boolean {
	return node.kind === 'end' || (node.kind === 'intermediate' && (node.props as BpmnEventProps | undefined)?.isThrowing === true)
}

function isCatching(node: FlowNode): boolean {
	const props = (node.props ?? {}) as BpmnEventProps & BpmnActivityProps
	return (node.kind === 'intermediate' && !isThrowing(node)) || (node.kind === 'task' && props.taskType === 'receive')
}

function checkSequence(source: FlowNode, target: FlowNode, graph: FlowGraph): FlowRuleResult {
	if (ARTIFACTS.includes(source.kind) || ARTIFACTS.includes(target.kind)) {
		return deny('sequence-not-data', UI_FLOW_BPMN.RULE_SEQUENCE_NOT_DATA)
	}
	if (source.kind === 'end') {
		return deny('end-no-outgoing', UI_FLOW_BPMN.RULE_END_NO_OUTGOING)
	}
	if (target.kind === 'start') {
		return deny('start-no-incoming', UI_FLOW_BPMN.RULE_START_NO_INCOMING)
	}
	if (target.kind === 'boundary') {
		return deny('boundary-no-incoming', UI_FLOW_BPMN.RULE_BOUNDARY_NO_INCOMING)
	}
	if (poolOf(graph, source) !== poolOf(graph, target)) {
		return deny('sequence-same-pool', UI_FLOW_BPMN.RULE_SEQUENCE_SAME_POOL)
	}
	if (source.kind === 'event-based' && !isCatching(target)) {
		return deny('event-based-target', UI_FLOW_BPMN.RULE_EVENT_BASED_TARGET)
	}
	return true
}

function checkMessage(source: FlowNode, target: FlowNode, graph: FlowGraph): FlowRuleResult {
	if (poolOf(graph, source) === poolOf(graph, target)) {
		return deny('message-different-pools', UI_FLOW_BPMN.RULE_MESSAGE_DIFFERENT_POOLS)
	}
	if (!MESSAGE_SOURCES.includes(source.kind) || (source.kind === 'intermediate' && !isThrowing(source))) {
		return deny('message-source', UI_FLOW_BPMN.RULE_MESSAGE_SOURCE)
	}
	if (!MESSAGE_TARGETS.includes(target.kind) || (target.kind === 'intermediate' && isThrowing(target))) {
		return deny('message-target', UI_FLOW_BPMN.RULE_MESSAGE_TARGET)
	}
	return true
}

function checkAssociation(kind: string, source: FlowNode, target: FlowNode): FlowRuleResult {
	if (kind === 'association') {
		const isAnnotated = source.kind === 'annotation' || target.kind === 'annotation'
		return isAnnotated ? true : deny('association-ends', UI_FLOW_BPMN.RULE_ASSOCIATION_ENDS)
	}
	const isData = DATA.includes(source.kind) !== DATA.includes(target.kind)
	const other = DATA.includes(source.kind) ? target : source
	return isData && [...ACTIVITIES, ...EVENTS].includes(other.kind)
		? true
		: deny('data-association-ends', UI_FLOW_BPMN.RULE_DATA_ASSOCIATION_ENDS)
}

function checkBpmnConnection(kind: string, ends: { source: FlowNode; target: FlowNode }, graph: FlowGraph): FlowRuleResult {
	const { source, target } = ends
	if (kind === 'sequence') {
		return checkSequence(source, target, graph)
	}
	if (kind === 'message') {
		return checkMessage(source, target, graph)
	}
	return kind === 'association' || kind === 'data-association' ? checkAssociation(kind, source, target) : true
}

function canConnect(context: FlowConnectContext): FlowRuleResult {
	const result = checkBpmnConnection(context.kind, context, context.graph)
	if (result !== true) {
		return result
	}
	const isSecondExit =
		context.kind === 'sequence' &&
		context.source.kind === 'boundary' &&
		context.graph.outgoing(context.source.id).some(edge => (edge.kind ?? 'sequence') === 'sequence')
	return isSecondExit ? deny('boundary-one-outgoing', UI_FLOW_BPMN.RULE_BOUNDARY_ONE_OUTGOING) : true
}

function edgeIssue(edge: FlowEdge, graph: FlowGraph): FlowDataIssue[] {
	const source = graph.nodes.get(edge.source)
	const target = graph.nodes.get(edge.target)
	const result = source && target ? checkBpmnConnection(edge.kind ?? 'sequence', { source, target }, graph) : true
	return result === true
		? []
		: [{ level: 'warning', code: `bpmn-${result.code}`, message: result.message, target: { entity: 'edge', id: edge.id } }]
}

function sequenceCount(edges: readonly FlowEdge[]): number {
	return edges.filter(edge => (edge.kind ?? 'sequence') === 'sequence').length
}

function nodeIssues(node: FlowNode, graph: FlowGraph): FlowDataIssue[] {
	const issues: FlowDataIssue[] = []
	const ref = { entity: 'node', id: node.id } as const
	if (node.kind === 'boundary' && sequenceCount(graph.outgoing(node.id)) > 1) {
		issues.push({ level: 'warning', code: 'bpmn-boundary-one-outgoing', message: UI_FLOW_BPMN.RULE_BOUNDARY_ONE_OUTGOING, target: ref })
	}
	const hasMixedFlow = sequenceCount(graph.incoming(node.id)) > 1 && sequenceCount(graph.outgoing(node.id)) > 1
	if (GATEWAYS_WITH_MIXED_CHECK.includes(node.kind) && hasMixedFlow) {
		issues.push({
			level: 'warning',
			code: 'bpmn-gateway-mixed',
			message: formatMessage(UI_FLOW_BPMN.ISSUE_GATEWAY_MIXED, { label: node.label }),
			target: ref,
		})
	}
	return issues
}

function triggerKey(node: FlowNode): keyof typeof BPMN_TRIGGERS_BY_KIND {
	if (node.kind !== 'intermediate') {
		return node.kind as 'start' | 'end' | 'boundary'
	}
	return isThrowing(node) ? 'intermediate-throw' : 'intermediate-catch'
}

function allowedTriggers(node: FlowNode): readonly BpmnEventTrigger[] | null {
	return EVENTS.includes(node.kind) ? BPMN_TRIGGERS_BY_KIND[triggerKey(node)] : null
}

function triggerIssues(node: FlowNode): FlowDataIssue[] {
	const allowed = allowedTriggers(node)
	const trigger = (node.props as BpmnEventProps | undefined)?.trigger
	if (!allowed || !trigger || allowed.includes(trigger)) {
		return []
	}
	const message = formatMessage(UI_FLOW_BPMN.ISSUE_TRIGGER_INVALID, { label: node.label, trigger: triggerLabel(trigger) })
	return [{ level: 'warning', code: 'bpmn-trigger-invalid', message, target: { entity: 'node', id: node.id } }]
}

function hasPool(group: FlowGroup, groups: ReadonlyMap<string, FlowGroup>): boolean {
	let current: FlowGroup | undefined = group
	for (let depth = 0; current && depth < 16; depth += 1) {
		if (current.kind === 'pool') {
			return true
		}
		current = current.parent ? groups.get(current.parent) : undefined
	}
	return false
}

function laneIssues(group: FlowGroup, graph: FlowGraph): FlowDataIssue[] {
	if (group.kind !== 'lane' || hasPool(group, graph.groups)) {
		return []
	}
	const message = formatMessage(UI_FLOW_BPMN.ISSUE_LANE_OUTSIDE_POOL, { label: group.label })
	return [{ level: 'warning', code: 'bpmn-lane-outside-pool', message, target: { entity: 'group', id: group.id } }]
}

function validate(_data: FlowMapData, graph: FlowGraph): FlowDataIssue[] {
	return [
		...[...graph.edges.values()].flatMap(edge => edgeIssue(edge, graph)),
		...[...graph.nodes.values()].flatMap(node => [...nodeIssues(node, graph), ...triggerIssues(node)]),
		...[...graph.groups.values()].flatMap(group => laneIssues(group, graph)),
	]
}

export const BPMN_RULES: FlowNotationRules = { connections: CONNECTIONS, canConnect, validate }
