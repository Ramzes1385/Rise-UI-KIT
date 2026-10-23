import { formatMessage } from '@/locales/state'
import { UI_FLOW_DFD } from '@/locales/messages'
import type { FlowGraph } from '../../../types/api/flowLayout.types'
import type { FlowMapData, FlowNode } from '../../../types/data/flowData.types'
import type { FlowConnectContext, FlowDataIssue, FlowNotationRules, FlowRuleResult } from '../../../types/api/flowNotation.types'

const DFD_KINDS = ['process', 'store', 'entity']

function dfdKindOf(node: FlowNode): string {
	return node.kind.replace(/^dfd:/, '')
}

function denied(code: string, message: string): FlowRuleResult {
	return { code, message }
}

function pairMessage(from: string, to: string): FlowRuleResult {
	if (from === 'entity' && to === 'entity') return denied('dfd-entity-entity', UI_FLOW_DFD.RULE_ENTITY_ENTITY)
	if (from === 'store' && to === 'store') return denied('dfd-store-store', UI_FLOW_DFD.RULE_STORE_STORE)
	return denied('dfd-entity-store', UI_FLOW_DFD.RULE_ENTITY_STORE)
}

function dfdCanConnect(context: FlowConnectContext): FlowRuleResult {
	const from = dfdKindOf(context.source)
	const to = dfdKindOf(context.target)
	return from === 'process' || to === 'process' ? true : pairMessage(from, to)
}

function warning(code: string, message: string, node: FlowNode): FlowDataIssue {
	return { level: 'warning', code, message, target: { entity: 'node', id: node.id } }
}

function dfdValidate(data: FlowMapData, graph: FlowGraph): FlowDataIssue[] {
	const issues: FlowDataIssue[] = []
	for (const node of data.nodes.filter(candidate => dfdKindOf(candidate) === 'process')) {
		const name = node.label || node.id
		if (!graph.incoming(node.id).length) issues.push(warning('dfd-miracle', formatMessage(UI_FLOW_DFD.WARN_MIRACLE, { name }), node))
		if (!graph.outgoing(node.id).length)
			issues.push(warning('dfd-black-hole', formatMessage(UI_FLOW_DFD.WARN_BLACK_HOLE, { name }), node))
	}
	return issues
}

export const dfdRules: FlowNotationRules = {
	connections: [{ edge: 'flow', from: DFD_KINDS, to: DFD_KINDS }],
	canConnect: dfdCanConnect,
	validate: dfdValidate,
}
