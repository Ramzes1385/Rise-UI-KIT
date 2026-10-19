import { formatMessage } from '@/locales/state'
import { UI_FLOW_SEQUENCE } from '@/locales/messages'
import type { FlowGraph } from '../../../types/api/flowLayout.types'
import type { FlowEdge, FlowMapData, FlowNode } from '../../../types/data/flowData.types'
import type { SequenceLifecycle } from '../../../types/notations/architecture/sequence.types'
import type { FlowConnectContext, FlowDataIssue, FlowNotationRules, FlowRuleResult } from '../../../types/api/flowNotation.types'

const LIFELINES = ['lifeline', 'actor']
const ANY = ['*']

export function sequenceKindOf(node: { kind?: string }): string {
	return (node.kind ?? '').replace(/^sequence:/, '')
}

export function isLifeline(node: { kind: string }): boolean {
	return LIFELINES.includes(sequenceKindOf(node))
}

export function textProp(node: { props?: Record<string, unknown> }, key: string): string | undefined {
	const value = node.props?.[key]
	return typeof value === 'string' && value ? value : undefined
}

export function lifecycleOf(edges: readonly { kind?: string; target: string }[]): SequenceLifecycle {
	const created = new Map<string, number>()
	const destroyed = new Map<string, number>()
	edges.forEach((edge, row) => {
		const kind = sequenceKindOf(edge)
		if (kind === 'create' && !created.has(edge.target)) created.set(edge.target, row)
		if (kind === 'destroy' && !destroyed.has(edge.target)) destroyed.set(edge.target, row)
	})
	return { created, destroyed }
}

function denied(code: string, message: string): FlowRuleResult {
	return { code, message }
}

function sequenceCanConnect(context: FlowConnectContext): FlowRuleResult {
	const { source, target, graph, kind } = context
	if (!isLifeline(source) || !isLifeline(target)) return denied('sequence-fragment', UI_FLOW_SEQUENCE.RULE_FRAGMENT)
	const isCreated = graph.incoming(target.id).some(edge => sequenceKindOf(edge) === 'create')
	if (kind === 'create' && isCreated) {
		return denied('sequence-create-once', formatMessage(UI_FLOW_SEQUENCE.RULE_CREATE_ONCE, { name: target.label || target.id }))
	}
	return true
}

function issue(code: string, message: string, target: { entity: 'node' | 'edge'; id: string }): FlowDataIssue {
	return { level: 'warning', code, message, target }
}

function rowsOf(data: FlowMapData): Map<string, number> {
	return new Map(data.edges.map((edge, index) => [edge.id, index]))
}

function fragmentIssues(node: FlowNode, rows: Map<string, number>): FlowDataIssue[] {
	const first = rows.get(textProp(node, 'from') ?? '')
	const last = rows.get(textProp(node, 'to') ?? '')
	const isValid = first !== undefined && last !== undefined && first <= last
	const name = node.label || textProp(node, 'operator') || node.id
	return isValid
		? []
		: [issue('sequence-fragment-range', formatMessage(UI_FLOW_SEQUENCE.WARN_FRAGMENT_RANGE, { name }), { entity: 'node', id: node.id })]
}

function lifelineIssue(
	edge: FlowEdge,
	node: FlowNode,
	context: { rows: Map<string, number>; lifecycle: SequenceLifecycle },
): FlowDataIssue[] {
	const row = context.rows.get(edge.id) as number
	const created = context.lifecycle.created.get(node.id)
	const destroyed = context.lifecycle.destroyed.get(node.id)
	const names = { name: edge.label || edge.id, lifeline: node.label || node.id }
	const target = { entity: 'edge' as const, id: edge.id }
	if (created !== undefined && row < created) {
		return [issue('sequence-before-create', formatMessage(UI_FLOW_SEQUENCE.WARN_BEFORE_CREATE, names), target)]
	}
	if (destroyed !== undefined && row > destroyed) {
		return [issue('sequence-after-destroy', formatMessage(UI_FLOW_SEQUENCE.WARN_AFTER_DESTROY, names), target)]
	}
	return []
}

function lifelineIssues(
	edge: FlowEdge,
	graph: FlowGraph,
	context: { rows: Map<string, number>; lifecycle: SequenceLifecycle },
): FlowDataIssue[] {
	const ends = [edge.source, edge.target].flatMap(id => graph.nodes.get(id) ?? [])
	return ends.flatMap(node => lifelineIssue(edge, node, context))
}

function sequenceValidate(data: FlowMapData, graph: FlowGraph): FlowDataIssue[] {
	const rows = rowsOf(data)
	const context = { rows, lifecycle: lifecycleOf(data.edges) }
	const fragments = data.nodes.filter(node => sequenceKindOf(node) === 'fragment')
	return [...fragments.flatMap(node => fragmentIssues(node, rows)), ...data.edges.flatMap(edge => lifelineIssues(edge, graph, context))]
}

export const sequenceRules: FlowNotationRules = {
	connections: [
		{ edge: 'sync', from: ANY, to: ANY },
		{ edge: 'async', from: ANY, to: ANY },
		{ edge: 'reply', from: ANY, to: ANY },
		{ edge: 'create', from: ANY, to: ANY },
		{ edge: 'destroy', from: ANY, to: ANY },
	],
	canConnect: sequenceCanConnect,
	validate: sequenceValidate,
}
