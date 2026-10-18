import { formatMessage } from '@/locales/state'
import { UI_FLOW_SEQUENCE } from '@/locales/messages'
import type { FlowGraph } from '../../../types/api/flowLayout.types'
import type { FlowEdge, FlowMapData, FlowNode } from '../../../types/data/flowData.types'
import type { FlowConnectContext, FlowDataIssue, FlowNotationRules, FlowRuleResult } from '../../../types/api/flowNotation.types'

const LIFELINES = ['lifeline', 'actor']

export function sequenceKindOf(node: { kind: string }): string {
	return node.kind.replace(/^sequence:/, '')
}

export function isLifeline(node: { kind: string }): boolean {
	return LIFELINES.includes(sequenceKindOf(node))
}

export function textProp(node: { props?: Record<string, unknown> }, key: string): string | undefined {
	const value = node.props?.[key]
	return typeof value === 'string' && value ? value : undefined
}

function denied(code: string, message: string): FlowRuleResult {
	return { code, message }
}

function sequenceCanConnect(context: FlowConnectContext): FlowRuleResult {
	const { source, target, graph, kind } = context
	if (!isLifeline(source) || !isLifeline(target)) return denied('sequence-fragment', UI_FLOW_SEQUENCE.RULE_FRAGMENT)
	const isCreated = graph.incoming(target.id).some(edge => edge.kind === 'create')
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

function lifelineIssue(edge: FlowEdge, node: FlowNode, rows: Map<string, number>): FlowDataIssue[] {
	const row = rows.get(edge.id) ?? 0
	const created = rows.get(textProp(node, 'createdBy') ?? '')
	const destroyed = rows.get(textProp(node, 'destroyedBy') ?? '')
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

function lifelineIssues(edge: FlowEdge, graph: FlowGraph, rows: Map<string, number>): FlowDataIssue[] {
	const ends = [edge.source, edge.target].flatMap(id => graph.nodes.get(id) ?? [])
	return ends.flatMap(node => lifelineIssue(edge, node, rows))
}

function sequenceValidate(data: FlowMapData, graph: FlowGraph): FlowDataIssue[] {
	const rows = rowsOf(data)
	const fragments = data.nodes.filter(node => sequenceKindOf(node) === 'fragment')
	return [...fragments.flatMap(node => fragmentIssues(node, rows)), ...data.edges.flatMap(edge => lifelineIssues(edge, graph, rows))]
}

export const sequenceRules: FlowNotationRules = {
	connections: [
		{ edge: 'sync', from: LIFELINES, to: LIFELINES },
		{ edge: 'async', from: LIFELINES, to: LIFELINES },
		{ edge: 'reply', from: LIFELINES, to: LIFELINES },
		{ edge: 'create', from: LIFELINES, to: LIFELINES },
		{ edge: 'destroy', from: LIFELINES, to: LIFELINES },
	],
	canConnect: sequenceCanConnect,
	validate: sequenceValidate,
}
