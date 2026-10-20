import { formatMessage } from '@/locales/state'
import { UI_FLOW_MAP, UI_FLOW_MAP_3D } from '@/locales/messages'
import type { FlowNode } from '@components/BaseFlowMap/types/data/flowData.types'
import { parseKindRef } from '@components/BaseFlowMap/model/notations/resolveKind'
import type { FlowMap3DConnectVerdict } from '../../../types/internal/flowMap3dEdit.types'
import type { FlowConnectionRule } from '@components/BaseFlowMap/types/api/flowNotation.types'
import type { FlowModelInternal } from '@components/BaseFlowMap/types/internal/core/flowRenderInternal.types'

function matches(list: readonly string[], kind: string): boolean {
	return list.includes('*') || list.includes(kind) || list.includes(parseKindRef(kind).kind)
}

function isListed(table: readonly FlowConnectionRule[], kind: string, ends: { source: FlowNode; target: FlowNode }): boolean {
	return table.some(rule => rule.edge === kind && matches(rule.from, ends.source.kind) && matches(rule.to, ends.target.kind))
}

function tableVerdict(model: FlowModelInternal, source: FlowNode, target: FlowNode): FlowMap3DConnectVerdict | null {
	const { defaultEdgeKind: kind, rules } = model.notation.value
	if (!rules?.connections || isListed(rules.connections, kind, { source, target })) return null
	const message = formatMessage(UI_FLOW_MAP.REJECT_CONNECTION, { kind, from: source.label, to: target.label })
	return { isAllowed: false, message }
}

function customVerdict(model: FlowModelInternal, source: FlowNode, target: FlowNode): FlowMap3DConnectVerdict {
	const { defaultEdgeKind: kind, rules } = model.notation.value
	const verdict = rules?.canConnect?.({ source, target, kind, data: model.data.value, graph: model.graph.value })
	return verdict === undefined || verdict === true ? { isAllowed: true } : { isAllowed: false, message: verdict.message }
}

export function connectVerdict(model: FlowModelInternal, sourceId: string, targetId: string): FlowMap3DConnectVerdict {
	const { nodes } = model.graph.value
	const source = nodes.get(sourceId)
	const target = nodes.get(targetId)
	if (!source || !target) return { isAllowed: false, message: UI_FLOW_MAP_3D.LINK_NO_TARGET }
	if (source.id === target.id) return { isAllowed: false, message: UI_FLOW_MAP_3D.LINK_SELF }
	return tableVerdict(model, source, target) ?? customVerdict(model, source, target)
}
