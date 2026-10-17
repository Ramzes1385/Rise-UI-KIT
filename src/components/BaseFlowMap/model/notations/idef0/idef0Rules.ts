import { idef0RoleLabel } from './idef0Kinds'
import { formatMessage } from '@/locales/state'
import { UI_FLOW_IDEF } from '@/locales/messages'
import type { FlowGraph } from '../../../types/api/flowLayout.types'
import type { Idef0BoundaryRole } from '../../../types/notations/process/idef.types'
import type { FlowEdge, FlowMapData, FlowNode, FlowValue } from '../../../types/data/flowData.types'
import type { FlowConnectContext, FlowDataIssue, FlowNotationRules, FlowRuleResult } from '../../../types/api/flowNotation.types'

const MIN_FUNCTIONS = 3
const MAX_FUNCTIONS = 6
const SOURCE_ONLY = ['input', 'control', 'mechanism']
const TARGET_ONLY = ['output', 'call']

export function idef0KindOf(node: { kind: string }): string {
	return node.kind.replace(/^idef0:/, '')
}

export function boundaryRoleOf(node: { props?: Record<string, FlowValue> }): Idef0BoundaryRole {
	const icom = node.props?.icom
	return icom === 'control' || icom === 'output' || icom === 'mechanism' ? icom : 'input'
}

function codeIndex(code: string): number {
	return Number(code.charAt(code.length - 1))
}

export function codeOrder(code: string): number {
	return Number(code.replace(/\D/g, '')) || 0
}

export function portRole(node: FlowNode, portId: string | undefined): string | undefined {
	if (!portId) return undefined
	return node.ports?.find(port => port.id === portId)?.role ?? portId
}

function denied(code: string, message: string): FlowRuleResult {
	return { code, message }
}

function checkPortRoles(context: FlowConnectContext): FlowRuleResult {
	const sourceRole = context.sourcePort?.role
	const targetRole = context.targetPort?.role
	if (sourceRole && SOURCE_ONLY.includes(sourceRole)) {
		return denied('idef0-source-role', formatMessage(UI_FLOW_IDEF.RULE_SOURCE_ROLE, { role: idef0RoleLabel(sourceRole) }))
	}
	if (targetRole && TARGET_ONLY.includes(targetRole)) {
		return denied('idef0-target-role', formatMessage(UI_FLOW_IDEF.RULE_TARGET_ROLE, { role: idef0RoleLabel(targetRole) }))
	}
	return true
}

function checkBoundarySource(context: FlowConnectContext): FlowRuleResult {
	const role = boundaryRoleOf(context.source)
	if (role === 'output') return denied('idef0-boundary-direction', UI_FLOW_IDEF.RULE_OUTPUT_IS_SINK)
	const targetRole = portRole(context.target, context.targetPort?.id)
	if (targetRole && targetRole !== role) {
		return denied('idef0-role-mismatch', formatMessage(UI_FLOW_IDEF.RULE_ROLE_MISMATCH, { role: idef0RoleLabel(role) }))
	}
	return true
}

function checkBoundaryTarget(context: FlowConnectContext): FlowRuleResult {
	if (boundaryRoleOf(context.target) !== 'output') return denied('idef0-boundary-direction', UI_FLOW_IDEF.RULE_ONLY_OUTPUT_LEAVES)
	const sourceRole = portRole(context.source, context.sourcePort?.id)
	if (sourceRole && sourceRole !== 'output') {
		return denied('idef0-role-mismatch', formatMessage(UI_FLOW_IDEF.RULE_ROLE_MISMATCH, { role: idef0RoleLabel('output') }))
	}
	return true
}

function idef0CanConnect(context: FlowConnectContext): FlowRuleResult {
	const fromBoundary = idef0KindOf(context.source) === 'boundary'
	const toBoundary = idef0KindOf(context.target) === 'boundary'
	if (fromBoundary && toBoundary) return denied('idef0-boundary-pair', UI_FLOW_IDEF.RULE_BOUNDARY_PAIR)
	const roles = checkPortRoles(context)
	if (roles !== true) return roles
	if (fromBoundary) return checkBoundarySource(context)
	return toBoundary ? checkBoundaryTarget(context) : true
}

function issue(code: string, message: string, node?: FlowNode): FlowDataIssue {
	return { level: 'warning', code, message, ...(node ? { target: { entity: 'node' as const, id: node.id } } : {}) }
}

function functionsOf(data: FlowMapData): FlowNode[] {
	return data.nodes.filter(node => idef0KindOf(node) === 'function')
}

function countIssues(functions: FlowNode[]): FlowDataIssue[] {
	const count = functions.length
	if (count <= 1 || (count >= MIN_FUNCTIONS && count <= MAX_FUNCTIONS)) return []
	return [issue('idef0-function-count', formatMessage(UI_FLOW_IDEF.WARN_FUNCTION_COUNT, { count }))]
}

function codeOf(node: FlowNode): string {
	const code = node.props?.code
	return typeof code === 'string' ? code : ''
}

function codeIssues(functions: FlowNode[]): FlowDataIssue[] {
	const issues: FlowDataIssue[] = []
	const seen = new Set<string>()
	for (const node of functions) {
		const code = codeOf(node)
		if (code && seen.has(code))
			issues.push(issue('idef0-code-duplicate', formatMessage(UI_FLOW_IDEF.WARN_CODE_DUPLICATE, { code }), node))
		seen.add(code)
	}
	const indexes = new Set(functions.map(node => codeIndex(codeOf(node))))
	const isSequence = functions.every((_, index) => indexes.has(index + 1))
	return isSequence || issues.length ? issues : [...issues, issue('idef0-code-gap', UI_FLOW_IDEF.WARN_CODE_GAP)]
}

function incomingRole(edge: FlowEdge, graph: FlowGraph, node: FlowNode): string {
	const own = portRole(node, edge.targetPort)
	const source = graph.nodes.get(edge.source)
	if (own) return own
	return source && idef0KindOf(source) === 'boundary' ? boundaryRoleOf(source) : 'input'
}

function outgoingRole(edge: FlowEdge, node: FlowNode): string {
	return portRole(node, edge.sourcePort) ?? 'output'
}

function flowIssues(functions: FlowNode[], graph: FlowGraph): FlowDataIssue[] {
	const issues: FlowDataIssue[] = []
	for (const node of functions) {
		const hasControl = graph.incoming(node.id).some(edge => incomingRole(edge, graph, node) === 'control')
		const hasOutput = graph.outgoing(node.id).some(edge => outgoingRole(edge, node) === 'output')
		if (!hasControl) issues.push(issue('idef0-no-control', formatMessage(UI_FLOW_IDEF.WARN_NO_CONTROL, { name: node.label }), node))
		if (!hasOutput) issues.push(issue('idef0-no-output', formatMessage(UI_FLOW_IDEF.WARN_NO_OUTPUT, { name: node.label }), node))
	}
	return issues
}

function idef0Validate(data: FlowMapData, graph: FlowGraph): FlowDataIssue[] {
	const functions = functionsOf(data)
	return [...countIssues(functions), ...codeIssues(functions), ...flowIssues(functions, graph)]
}

export const idef0Rules: FlowNotationRules = {
	connections: [{ edge: 'arrow', from: ['function', 'boundary'], to: ['function', 'boundary'] }],
	canConnect: idef0CanConnect,
	validate: idef0Validate,
}
