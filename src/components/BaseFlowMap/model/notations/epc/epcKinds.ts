import { UI_FLOW_EPC } from '@/locales/messages'
import type { FlowSize } from '../../../types/data/flowData.types'
import type { FlowEdgeKindDef, FlowGatewaySemantics, FlowNodeKindDef, FlowShapeDef } from '../../../types/api/flowNotation.types'

const INK = 'var(--rise-flow-ink)'
const LINE = 'var(--rise-text-highlighted)'
const CONNECTOR_FILL = 'var(--rise-flow-map-node-bg, var(--rise-bg))'

const EVENT_SIZE: FlowSize = { width: 160, height: 44 }
const FUNCTION_SIZE: FlowSize = { width: 160, height: 52 }
const CONNECTOR_SIZE: FlowSize = { width: 40, height: 40 }
const ORG_SIZE: FlowSize = { width: 124, height: 46 }
const INFO_SIZE: FlowSize = { width: 112, height: 52 }
const INTERFACE_SIZE: FlowSize = { width: 160, height: 48 }
const ARROW = 'M4 12h14M13 6l6 6-6 6'

const tinted = (token: string): Pick<FlowShapeDef, 'fill' | 'stroke' | 'text'> => ({
	fill: `var(${token})`,
	stroke: `color-mix(in srgb, var(${token}) 65%, var(--rise-text-highlighted))`,
	text: INK,
})

function orgPath({ width, height }: FlowSize): string {
	const rx = width / 2
	const ry = height / 2
	const ellipse = `M0 ${ry}A${rx} ${ry} 0 1 0 ${width} ${ry}A${rx} ${ry} 0 1 0 0 ${ry}Z`
	return `${ellipse}M${width * 0.2} ${height * 0.16}V${height * 0.84}`
}

function interfacePath({ width, height }: FlowSize): string {
	const r = 10
	const body = `M${r} 0H${width - r}Q${width} 0 ${width} ${r}V${height - r}Q${width} ${height} ${width - r} ${height}H${r}Q0 ${height} 0 ${height - r}V${r}Q0 0 ${r} 0Z`
	return `${body}M${width + 5} ${r}V${height - 2}Q${width + 5} ${height + 5} ${width - 2} ${height + 5}H${r}`
}

const connector = (text: string): FlowShapeDef => ({
	shape: 'circle',
	fill: CONNECTOR_FILL,
	stroke: LINE,
	text: LINE,
	markers: () => [{ text, placement: 'center' }],
})

const connectorKind = (label: () => string, text: string): FlowNodeKindDef => ({
	label,
	render: 'svg',
	shape: connector(text),
	size: CONNECTOR_SIZE,
	labelPlacement: 'none',
	model3d: 'gateway',
	paletteGroup: 'epc-connectors',
})

export const epcNodeKinds: Record<string, FlowNodeKindDef> = {
	event: {
		label: () => UI_FLOW_EPC.EVENT,
		render: 'svg',
		shape: { shape: 'hexagon', ...tinted('--rise-flow-epc-event') },
		size: EVENT_SIZE,
		labelPlacement: 'inside',
		model3d: 'auto',
		paletteGroup: 'epc',
	},
	function: {
		label: () => UI_FLOW_EPC.FUNCTION,
		render: 'svg',
		shape: { shape: 'round-rect', ...tinted('--rise-flow-epc-function') },
		size: FUNCTION_SIZE,
		labelPlacement: 'inside',
		props: {
			latency: { label: () => UI_FLOW_EPC.PROP_LATENCY, type: 'number' },
		},
		model3d: 'auto',
		paletteGroup: 'epc',
	},
	and: connectorKind(() => UI_FLOW_EPC.AND, '∧'),
	or: connectorKind(() => UI_FLOW_EPC.OR, '∨'),
	xor: connectorKind(() => UI_FLOW_EPC.XOR, 'XOR'),
	'org-unit': {
		label: () => UI_FLOW_EPC.ORG_UNIT,
		render: 'svg',
		shape: { shape: 'path', path: orgPath, ...tinted('--rise-flow-epc-org') },
		size: ORG_SIZE,
		labelPlacement: 'inside',
		model3d: 'user',
		paletteGroup: 'epc-objects',
	},
	information: {
		label: () => UI_FLOW_EPC.INFORMATION,
		render: 'svg',
		shape: {
			shape: 'document',
			fill: 'var(--rise-flow-map-node-bg, var(--rise-bg))',
			stroke: LINE,
			text: LINE,
		},
		size: INFO_SIZE,
		labelPlacement: 'inside',
		model3d: 'auto',
		paletteGroup: 'epc-objects',
	},
	'process-interface': {
		label: () => UI_FLOW_EPC.PROCESS_INTERFACE,
		render: 'svg',
		shape: {
			shape: 'path',
			path: interfacePath,
			fill: 'var(--rise-bg-muted)',
			stroke: LINE,
			text: LINE,
			markers: () => [{ path: ARROW, placement: 'top-start' }],
		},
		size: INTERFACE_SIZE,
		labelPlacement: 'inside',
		model3d: 'gateway',
		paletteGroup: 'epc',
	},
}

export const epcEdgeKinds: Record<string, FlowEdgeKindDef> = {
	control: {
		label: () => UI_FLOW_EPC.CONTROL,
		stroke: 'solid',
		endMarker: 'arrow',
		routing: 'orthogonal',
		traffic: { rate: 0.6, speed: 110 },
		effect: 'travel',
	},
	assignment: {
		label: () => UI_FLOW_EPC.ASSIGNMENT,
		stroke: 'dashed',
		endMarker: 'none',
		routing: 'straight',
		effect: 'pulse',
	},
}

export const EPC_GATEWAYS: Record<string, FlowGatewaySemantics> = {
	and: { split: 'all', join: 'all' },
	or: { split: 'some', join: 'some' },
	xor: { split: 'one', join: 'one' },
}
