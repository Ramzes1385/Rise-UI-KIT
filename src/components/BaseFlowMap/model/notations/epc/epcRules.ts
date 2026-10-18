import { formatMessage } from '@/locales/state'
import { UI_FLOW_EPC } from '@/locales/messages'
import type { FlowGraph } from '../../../types/api/flowLayout.types'
import type { EpcAlternation } from '../../../types/notations/process/epc.types'
import type { FlowEdge, FlowMapData, FlowNode } from '../../../types/data/flowData.types'
import type { FlowConnectContext, FlowDataIssue, FlowNotationRules, FlowRuleResult } from '../../../types/api/flowNotation.types'

const ASIDE = ['org-unit', 'information']
const SPLITTERS = ['or', 'xor']
const ROLE_LIMIT = 64

export function epcKindOf(node: { kind: string }): string {
	return node.kind.replace(/^epc:/, '')
}

export function isControl(edge: FlowEdge): boolean {
	return (edge.kind ?? 'control') === 'control'
}

export function isAside(node: { kind: string }): boolean {
	return ASIDE.includes(epcKindOf(node))
}

export function alternationOf(node: { kind: string }): EpcAlternation {
	const kind = epcKindOf(node)
	return kind === 'event' || kind === 'function' ? kind : 'neutral'
}

function denied(code: string, message: string): FlowRuleResult {
	return { code, message }
}

function controlEdges(edges: readonly FlowEdge[]): FlowEdge[] {
	return edges.filter(isControl)
}

function neighbours(graph: FlowGraph, node: FlowNode, isForward: boolean): FlowNode[] {
	const edges = controlEdges(isForward ? graph.outgoing(node.id) : graph.incoming(node.id))
	return edges.flatMap(edge => graph.nodes.get(isForward ? edge.target : edge.source) ?? [])
}

function reach(graph: FlowGraph, start: FlowNode, isForward: boolean): Set<EpcAlternation> {
	const roles = new Set<EpcAlternation>()
	const seen = new Set<string>([start.id])
	const queue: FlowNode[] = [start]
	while (queue.length && seen.size < ROLE_LIMIT) {
		const node = queue.shift() as FlowNode
		const role = alternationOf(node)
		if (role !== 'neutral') roles.add(role)
		if (role !== 'neutral' && node !== start) continue
		for (const next of neighbours(graph, node, isForward).filter(candidate => !seen.has(candidate.id))) {
			seen.add(next.id)
			queue.push(next)
		}
	}
	return roles
}

function rolesAfter(graph: FlowGraph, node: FlowNode): Set<EpcAlternation> {
	return alternationOf(node) === 'neutral' ? reach(graph, node, true) : new Set([alternationOf(node)])
}

function rolesBefore(graph: FlowGraph, node: FlowNode): Set<EpcAlternation> {
	return alternationOf(node) === 'neutral' ? reach(graph, node, false) : new Set([alternationOf(node)])
}

function alternationClash(graph: FlowGraph, source: FlowNode, target: FlowNode): FlowRuleResult {
	const before = rolesBefore(graph, source)
	const after = rolesAfter(graph, target)
	if (before.has('event') && after.has('event')) return denied('epc-event-event', UI_FLOW_EPC.RULE_EVENT_EVENT)
	if (before.has('function') && after.has('function')) return denied('epc-function-function', UI_FLOW_EPC.RULE_FUNCTION_FUNCTION)
	return true
}

function isSplit(graph: FlowGraph, node: FlowNode, extra: number): boolean {
	return SPLITTERS.includes(epcKindOf(node)) && controlEdges(graph.outgoing(node.id)).length + extra >= 2
}

function eventFeeds(graph: FlowGraph, node: FlowNode): boolean {
	return controlEdges(graph.incoming(node.id)).some(edge => {
		const from = graph.nodes.get(edge.source)
		return from !== undefined && epcKindOf(from) === 'event'
	})
}

function eventSplit(context: FlowConnectContext): FlowRuleResult {
	const { source, target, graph } = context
	const isFromEvent = epcKindOf(source) === 'event' && isSplit(graph, target, 0)
	const isIntoSplit = SPLITTERS.includes(epcKindOf(source)) && eventFeeds(graph, source) && isSplit(graph, source, 1)
	return isFromEvent || isIntoSplit ? denied('epc-event-split', UI_FLOW_EPC.RULE_EVENT_SPLIT) : true
}

function assignmentRule(context: FlowConnectContext): FlowRuleResult {
	const kinds = [epcKindOf(context.source), epcKindOf(context.target)]
	const isPair = kinds.some(kind => ASIDE.includes(kind)) && kinds.includes('function') && !kinds.every(kind => ASIDE.includes(kind))
	return isPair ? true : denied('epc-assignment', UI_FLOW_EPC.RULE_ASSIGNMENT)
}

function controlRule(context: FlowConnectContext): FlowRuleResult {
	const { source, target, graph } = context
	if (isAside(source) || isAside(target)) return denied('epc-aside-flow', UI_FLOW_EPC.RULE_ASIDE_FLOW)
	const clash = alternationClash(graph, source, target)
	return clash === true ? eventSplit(context) : clash
}

function epcCanConnect(context: FlowConnectContext): FlowRuleResult {
	return context.kind === 'assignment' ? assignmentRule(context) : controlRule(context)
}

function nameOf(node: FlowNode): string {
	return node.label || node.id
}

function issue(code: string, message: string, node: FlowNode): FlowDataIssue {
	return { level: 'warning', code, message, target: { entity: 'node', id: node.id } }
}

function endpointIssues(node: FlowNode, graph: FlowGraph): FlowDataIssue[] {
	if (alternationOf(node) !== 'function') return []
	const issues: FlowDataIssue[] = []
	const name = { name: nameOf(node) }
	if (!controlEdges(graph.incoming(node.id)).length) issues.push(issue('epc-start', formatMessage(UI_FLOW_EPC.WARN_START, name), node))
	if (!controlEdges(graph.outgoing(node.id)).length) issues.push(issue('epc-end', formatMessage(UI_FLOW_EPC.WARN_END, name), node))
	return issues
}

function clashIssue(source: FlowNode, target: FlowNode, graph: FlowGraph): FlowDataIssue[] {
	const before = rolesBefore(graph, source)
	const after = rolesAfter(graph, target)
	const isClash = (before.has('event') && after.has('event')) || (before.has('function') && after.has('function'))
	const names = { source: nameOf(source), target: nameOf(target) }
	return isClash ? [issue('epc-alternation', formatMessage(UI_FLOW_EPC.WARN_ALTERNATION, names), target)] : []
}

function splitIssue(source: FlowNode, target: FlowNode, graph: FlowGraph): FlowDataIssue[] {
	if (epcKindOf(source) !== 'event' || !isSplit(graph, target, 0)) return []
	return [issue('epc-event-split', formatMessage(UI_FLOW_EPC.WARN_EVENT_SPLIT, { name: nameOf(source) }), source)]
}

function edgeIssues(edge: FlowEdge, graph: FlowGraph): FlowDataIssue[] {
	const source = graph.nodes.get(edge.source)
	const target = graph.nodes.get(edge.target)
	if (!source || !target || isAside(source) || isAside(target)) return []
	return [...clashIssue(source, target, graph), ...splitIssue(source, target, graph)]
}

function epcValidate(data: FlowMapData, graph: FlowGraph): FlowDataIssue[] {
	const nodes = data.nodes.flatMap(node => endpointIssues(node, graph))
	const edges = data.edges.filter(isControl).flatMap(edge => edgeIssues(edge, graph))
	return [...nodes, ...edges]
}

export const epcRules: FlowNotationRules = {
	connections: [
		{
			edge: 'control',
			from: ['event', 'function', 'and', 'or', 'xor', 'process-interface'],
			to: ['event', 'function', 'and', 'or', 'xor', 'process-interface'],
		},
		{ edge: 'assignment', from: ['org-unit', 'information', 'function'], to: ['function', 'information'] },
	],
	canConnect: epcCanConnect,
	validate: epcValidate,
}
