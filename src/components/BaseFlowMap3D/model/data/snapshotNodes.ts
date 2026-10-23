import { fallbackForKind } from '@/scene3d/models/presets'
import type { Model3DShape } from '@/scene3d/types/internal/model3dInternal.types'
import { parseKindRef } from '@components/BaseFlowMap/model/notations/resolveKind'
import type { FlowShape } from '@components/BaseFlowMap/types/api/flowNotation.types'
import type { Model3DSelection } from '@/scene3d/types/internal/model3dInternal.types'
import type { FlowNode, FlowRect } from '@components/BaseFlowMap/types/data/flowData.types'
import type { FlowModelInternal } from '@components/BaseFlowMap/types/internal/core/flowRenderInternal.types'
import type { FlowMap3DLevels, FlowMap3DNodeItem, FlowMap3DPlan, FlowMap3DTierSpot } from '../../types/internal/flowMap3dInternal.types'

const CELL_RATIO = 0.8
const GROUND: FlowMap3DTierSpot = { tier: 0, y: 0, z: 0 }
export const MODEL_HEIGHT = 1.35
const QUARTER = 90

const SHAPES: Record<FlowShape, Model3DShape> = {
	rect: 'rect',
	'round-rect': 'rounded',
	pill: 'rounded',
	ellipse: 'circle',
	circle: 'circle',
	diamond: 'diamond',
	hexagon: 'hexagon',
	parallelogram: 'parallelogram',
	cylinder: 'cylinder',
	document: 'document',
	person: 'circle',
	note: 'document',
	'open-rect': 'rect',
	'parallel-lines': 'parallelogram',
	path: 'rounded',
}

export function quarterOf(rotation: number | undefined): number {
	const steps = Math.round((Number.isFinite(rotation) ? (rotation as number) : 0) / QUARTER)
	return (((steps * QUARTER) % 360) + 360) % 360
}

function selectionOf(node: FlowNode, kind: { shape: { shape: FlowShape }; model3d?: string }): Model3DSelection {
	const ref = parseKindRef(node.kind)
	const source = { ...node, shape: SHAPES[kind.shape.shape] ?? 'rounded' }
	return {
		node: { id: node.id, title: node.label, kind: ref.kind, tags: node.tags, tone: 'none', source },
		model3d: node.model3d ? { model: node.model3d.model, url: node.model3d.url } : undefined,
		kindModel: kind.model3d,
		kindFallback: fallbackForKind(ref.kind),
		isExternal: node.isExternal,
	}
}

export function medianCell(rects: readonly FlowRect[], unit: number): number {
	const sizes = rects.map(rect => Math.min(rect.width, rect.height)).sort((a, b) => a - b)
	const middle = sizes[Math.floor(sizes.length / 2)]
	return ((middle ?? unit) / unit) * CELL_RATIO
}

function itemOf(
	model: FlowModelInternal,
	node: FlowNode,
	parts: { plan: FlowMap3DPlan; spot: FlowMap3DTierSpot },
): FlowMap3DNodeItem | null {
	const { plan, spot } = parts
	const base = spot.y
	const { unit, origin } = plan
	const rect = model.layout.value.nodes[node.id]
	if (!rect) return null
	const kind = model.nodeKind(node)
	const scale = node.model3d?.scale && node.model3d.scale > 0 ? node.model3d.scale : 1
	return {
		id: node.id,
		node,
		kind,
		rect,
		x: (rect.x + rect.width / 2) / unit - origin.x,
		z: (rect.y + rect.height / 2) / unit - origin.z + spot.z,
		base,
		shift: spot.z,
		elevation: base + (node.model3d?.elevation ?? 0),
		rotation: (quarterOf(node.model3d?.rotation) * Math.PI) / 180,
		scale,
		group: node.group,
		selection: selectionOf(node, kind),
		height: MODEL_HEIGHT * scale,
	}
}

export function buildNodeItems(model: FlowModelInternal, plan: FlowMap3DPlan, levels: FlowMap3DLevels): FlowMap3DNodeItem[] {
	return model.shown.value.nodes.flatMap(node => itemOf(model, node, { plan, spot: levels.nodes.get(node.id) ?? GROUND }) ?? [])
}
