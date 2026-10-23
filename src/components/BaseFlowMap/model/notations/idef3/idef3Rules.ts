import { formatMessage } from '@/locales/state'
import { UI_FLOW_IDEF } from '@/locales/messages'
import type { FlowGraph } from '../../../types/api/flowLayout.types'
import { IDEF3_JUNCTIONS } from '../../../types/notations/process/idef.types'
import type { FlowEdge, FlowMapData, FlowNode } from '../../../types/data/flowData.types'
import type { FlowConnectContext, FlowDataIssue, FlowNotationRules, FlowRuleResult } from '../../../types/api/flowNotation.types'

const FLOW_NODES = ['uob', ...IDEF3_JUNCTIONS]

export function idef3KindOf(node: FlowNode): string {
	return node.kind.replace(/^idef3:/, '')
}

function isIdef3Junction(node: FlowNode): boolean {
	return idef3KindOf(node).startsWith('junction-')
}

export function isFlowEdge(edge: FlowEdge): boolean {
	return edge.kind === undefined || edge.kind === 'precedence' || edge.kind === 'object-flow'
}

function idef3CanConnect(context: FlowConnectContext): FlowRuleResult {
	const touchesReferent = idef3KindOf(context.source) === 'referent' || idef3KindOf(context.target) === 'referent'
	if (touchesReferent && context.kind !== 'relational')
		return { code: 'idef3-referent-link', message: UI_FLOW_IDEF.RULE_REFERENT_RELATIONAL }
	return true
}

function idef3Validate(data: FlowMapData, graph: FlowGraph): FlowDataIssue[] {
	const issues: FlowDataIssue[] = []
	for (const node of data.nodes.filter(isIdef3Junction)) {
		const incoming = graph.incoming(node.id).filter(isFlowEdge).length
		const outgoing = graph.outgoing(node.id).filter(isFlowEdge).length
		if (incoming > 1 && outgoing > 1) {
			const message = formatMessage(UI_FLOW_IDEF.WARN_JUNCTION_MIXED, { name: node.label || node.id })
			issues.push({ level: 'warning', code: 'idef3-junction-mixed', message, target: { entity: 'node', id: node.id } })
		}
	}
	return issues
}

export const idef3Rules: FlowNotationRules = {
	connections: [
		{ edge: 'precedence', from: FLOW_NODES, to: FLOW_NODES },
		{ edge: 'object-flow', from: FLOW_NODES, to: FLOW_NODES },
		{ edge: 'relational', from: ['*'], to: ['*'] },
	],
	canConnect: idef3CanConnect,
	validate: idef3Validate,
}
