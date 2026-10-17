import type { FlowEdgeKindDef, FlowGroupKindDef, FlowNodeKindDef } from '../../types/api/flowNotation.types'

export const FALLBACK_NODE_KIND: FlowNodeKindDef = {
	label: () => '',
	render: 'html',
	shape: { shape: 'round-rect' },
	size: { width: 160, height: 56 },
}

export const FALLBACK_EDGE_KIND: FlowEdgeKindDef = {
	label: () => '',
	stroke: 'solid',
	endMarker: 'arrow',
}

const BOX: FlowGroupKindDef = { label: () => '', layout: 'box', header: 'top', border: 'solid' }

export const BASE_GROUP_KINDS: Record<string, FlowGroupKindDef> = {
	lane: { ...BOX, layout: 'band', header: 'start' },
	pool: { ...BOX, layout: 'band', header: 'start' },
	layer: { ...BOX, layout: 'tier' },
	boundary: { ...BOX, border: 'dashed' },
	context: { ...BOX, border: 'dashed' },
	zone: BOX,
}

export const FALLBACK_GROUP_KIND: FlowGroupKindDef = BOX
