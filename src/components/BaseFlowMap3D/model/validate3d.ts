import { warn } from '@/locales/warn'
import { quarterOf } from './data/snapshotNodes'
import { UI_FLOW_MAP_3D } from '@/locales/messages'
import { isDevelopmentBuild } from '@utils/seo/structuredDataUtils'
import { FLOW_MAP_3D_QUALITIES } from '../types/BaseFlowMap3D.types'
import { SCENE_3D_CAMERA_PRESETS } from '@/scene3d/types/scene3d.types'
import type { FlowMap3DIssue } from '../types/internal/flowMap3dInternal.types'
import type { FlowEdge, FlowGroup, FlowMapData, FlowNode } from '@components/BaseFlowMap/types/data/flowData.types'

const MAX_NODES = 300
const EDGE_SHAPES = ['ribbon', 'arc', 'tube']
const GROUP_BASES = ['dashed', 'plate', 'none']

const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)

function nodeIssues(node: FlowNode): FlowMap3DIssue[] {
	const model = node.model3d
	if (!model) return []
	const issues: FlowMap3DIssue[] = []
	if (model.rotation !== undefined && quarterOf(model.rotation) !== model.rotation)
		issues.push({
			message: UI_FLOW_MAP_3D.WARN_ROTATION,
			params: { id: node.id, value: model.rotation, rounded: quarterOf(model.rotation) },
		})
	if (model.scale !== undefined && !(isNumber(model.scale) && model.scale > 0))
		issues.push({ message: UI_FLOW_MAP_3D.WARN_SCALE, params: { id: node.id, value: String(model.scale) } })
	if (model.elevation !== undefined && !isNumber(model.elevation))
		issues.push({ message: UI_FLOW_MAP_3D.WARN_ELEVATION, params: { id: node.id } })
	return issues
}

function edgeIssues(edge: FlowEdge): FlowMap3DIssue[] {
	const model = edge.model3d
	if (!model) return []
	const issues: FlowMap3DIssue[] = []
	if (model.shape !== undefined && !EDGE_SHAPES.includes(model.shape))
		issues.push({ message: UI_FLOW_MAP_3D.WARN_EDGE_SHAPE, params: { id: edge.id, value: String(model.shape) } })
	if (model.height !== undefined && !(isNumber(model.height) && model.height > 0))
		issues.push({ message: UI_FLOW_MAP_3D.WARN_EDGE_HEIGHT, params: { id: edge.id, value: String(model.height) } })
	return issues
}

function groupIssues(group: FlowGroup): FlowMap3DIssue[] {
	const base = group.model3d?.base
	if (base === undefined || GROUP_BASES.includes(base)) return []
	return [{ message: UI_FLOW_MAP_3D.WARN_GROUP_BASE, params: { id: group.id, value: String(base) } }]
}

function viewIssues(data: FlowMapData): FlowMap3DIssue[] {
	const view = data.view3d
	if (!view) return []
	const issues: FlowMap3DIssue[] = []
	if (view.camera !== undefined && !(SCENE_3D_CAMERA_PRESETS as readonly string[]).includes(view.camera))
		issues.push({ message: UI_FLOW_MAP_3D.WARN_CAMERA, params: { value: view.camera } })
	if (view.unit !== undefined && !(isNumber(view.unit) && view.unit > 0))
		issues.push({ message: UI_FLOW_MAP_3D.WARN_UNIT, params: { value: String(view.unit) } })
	if (view.quality !== undefined && !(FLOW_MAP_3D_QUALITIES as readonly string[]).includes(view.quality))
		issues.push({ message: UI_FLOW_MAP_3D.WARN_QUALITY, params: { value: String(view.quality) } })
	return issues
}

function validateFlow3d(data: FlowMapData): FlowMap3DIssue[] {
	const crowded =
		data.nodes.length > MAX_NODES
			? [{ message: UI_FLOW_MAP_3D.WARN_CROWDED, params: { count: data.nodes.length, max: MAX_NODES } }]
			: []
	return [
		...crowded,
		...data.nodes.flatMap(nodeIssues),
		...data.edges.flatMap(edgeIssues),
		...(data.groups ?? []).flatMap(groupIssues),
		...viewIssues(data),
	]
}

export function warnFlow3d(data: FlowMapData): void {
	if (!isDevelopmentBuild()) return
	validateFlow3d(data).forEach(issue => warn(issue.message, issue.params))
}
