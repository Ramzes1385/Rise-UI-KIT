import { ref } from 'vue'
import type { FlowRoute } from '@components/BaseFlowMap/types/api/flowLayout.types'
import type { FlowEdgeKindDef, FlowNodeKindDef } from '@components/BaseFlowMap/types/api/flowNotation.types'
import type { FlowModelInternal } from '@components/BaseFlowMap/types/internal/core/flowRenderInternal.types'
import type { FlowEdge, FlowGroup, FlowMapData, FlowNode, FlowRect } from '@components/BaseFlowMap/types/data/flowData.types'

interface FakeModelParts {
	nodes?: FlowNode[]
	edges?: FlowEdge[]
	groups?: FlowGroup[] | undefined
	rects?: Record<string, FlowRect>
	groupRects?: Record<string, FlowRect>
	routes?: Record<string, FlowRoute>
	bounds?: FlowRect
	view3d?: FlowMapData['view3d']
	shape?: FlowNodeKindDef['shape']['shape']
	edgeKind?: Partial<FlowEdgeKindDef>
}

export function node(id: string, extra: Partial<FlowNode> = {}): FlowNode {
	return { id, label: id.toUpperCase(), kind: 'service', ...extra }
}

export function edge(id: string, source: string, ...rest: [target: string, extra?: Partial<FlowEdge>]): FlowEdge {
	return { id, source, target: rest[0], ...rest[1] }
}

export function group(id: string, extra: Partial<FlowGroup> = {}): FlowGroup {
	return { id, kind: 'zone', label: id.toUpperCase(), ...extra }
}

export function route(...points: Array<[number, number]>): FlowRoute {
	return { path: '', points: points.map(([x, y]) => ({ x, y })), label: null }
}

export function rect(x: number, y: number, ...size: [width?: number, height?: number]): FlowRect {
	return { x, y, width: size[0] ?? 160, height: size[1] ?? 56 }
}

export function fakeModel(parts: FakeModelParts = {}): FlowModelInternal {
	const kind = (shape: FlowNodeKindDef['shape']['shape']): FlowNodeKindDef =>
		({ label: () => 'Сервис', shape: { shape }, size: { width: 160, height: 56 }, model3d: 'auto' }) as FlowNodeKindDef
	const edgeKind = { label: () => 'Вызов', stroke: 'solid', endMarker: 'arrow', ...parts.edgeKind } as FlowEdgeKindDef
	const nodes = parts.nodes ?? []
	return {
		shown: ref({ nodes, edges: parts.edges ?? [], groups: parts.groups }),
		layout: ref({
			nodes: parts.rects ?? {},
			groups: parts.groupRects ?? {},
			bounds: parts.bounds ?? rect(0, 0, 800, 400),
		}),
		routes: ref(parts.routes ?? {}),
		data: ref({ version: 1, nodes, edges: parts.edges ?? [], view3d: parts.view3d }),
		nodeKind: () => kind(parts.shape ?? 'round-rect'),
		edgeKind: () => edgeKind,
	} as unknown as FlowModelInternal
}
