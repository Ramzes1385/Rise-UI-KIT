import type { FlowNode } from '@components/BaseFlowMap/types/data/flowData.types'
import type { FlowNode3D } from '@components/BaseFlowMap/types/data/flowData3d.types'

export function withModel3d(node: FlowNode, patch: Record<string, unknown>): FlowNode3D {
	const merged: Record<string, unknown> = { ...node.model3d, ...patch }
	for (const key of Object.keys(merged)) if (merged[key] === undefined) delete merged[key]
	return merged as FlowNode3D
}
