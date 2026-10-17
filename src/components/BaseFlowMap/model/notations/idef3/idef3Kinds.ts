import { UI_FLOW_IDEF } from '@/locales/messages'
import type { FlowNode } from '../../../types/data/flowData.types'
import type { Idef3Junction } from '../../../types/notations/process/idef.types'
import type {
	FlowEdgeKindDef,
	FlowGatewaySemantics,
	FlowNodeKindDef,
	FlowShapeDef,
	FlowShapeMarker,
} from '../../../types/api/flowNotation.types'

const NODE_FILL = 'var(--rise-flow-map-node-bg, var(--rise-bg))'
const LINE = 'var(--rise-text-highlighted)'
const BAR_START = 'M4 2v20'
const BAR_END = 'M20 2v20'

const IDEF3_UOB_SIZE = { width: 128, height: 64 }
const IDEF3_JUNCTION_SIZE = { width: 24, height: 56 }
const IDEF3_REFERENT_SIZE = { width: 128, height: 56 }

const IDEF3_JUNCTION_LETTERS: Record<Idef3Junction, string> = {
	'junction-and': '&',
	'junction-or': 'O',
	'junction-xor': 'X',
}

export const idef3Gateways: Record<Idef3Junction, FlowGatewaySemantics> = {
	'junction-and': { split: 'all', join: 'all' },
	'junction-or': { split: 'some', join: 'some' },
	'junction-xor': { split: 'one', join: 'one' },
}

function uobMarkers(node: FlowNode): FlowShapeMarker[] {
	const { number, ref } = node.props ?? {}
	const markers: FlowShapeMarker[] = []
	if (typeof number === 'string' || typeof number === 'number') markers.push({ text: String(number), placement: 'bottom-start' })
	if (typeof ref === 'string' && ref) markers.push({ text: ref, placement: 'bottom-end' })
	return markers
}

function junctionMarkers(letter: string): (node: FlowNode) => FlowShapeMarker[] {
	return node => {
		const bars: FlowShapeMarker[] = [{ path: BAR_START, placement: 'center' }]
		if (node.props?.isSynchronous === true) bars.push({ path: BAR_END, placement: 'center' })
		return [...bars, { text: letter, placement: 'center' }]
	}
}

function referentMarkers(node: FlowNode): FlowShapeMarker[] {
	const { type, target } = node.props ?? {}
	const kind = type === 'object' || type === 'scenario' ? type : 'goto'
	const markers: FlowShapeMarker[] = [{ text: REFERENT_LABELS[kind](), placement: 'top-start' }]
	if (typeof target === 'string' && target) markers.push({ text: target, placement: 'bottom-start' })
	return markers
}

const REFERENT_LABELS: Record<'goto' | 'object' | 'scenario', () => string> = {
	goto: () => UI_FLOW_IDEF.REFERENT_GOTO,
	object: () => UI_FLOW_IDEF.REFERENT_OBJECT,
	scenario: () => UI_FLOW_IDEF.REFERENT_SCENARIO,
}

const solid = (markers?: FlowShapeDef['markers']): FlowShapeDef => ({ shape: 'rect', fill: NODE_FILL, stroke: LINE, markers })

function junctionKind(kind: Idef3Junction, label: () => string): FlowNodeKindDef {
	return {
		label,
		render: 'svg',
		shape: solid(junctionMarkers(IDEF3_JUNCTION_LETTERS[kind])),
		size: IDEF3_JUNCTION_SIZE,
		labelPlacement: 'none',
		props: { isSynchronous: { label: () => UI_FLOW_IDEF.PROP_SYNCHRONOUS, type: 'boolean', default: false } },
		model3d: 'auto',
		paletteGroup: 'idef3',
	}
}

export const idef3NodeKinds: Record<string, FlowNodeKindDef> = {
	uob: {
		label: () => UI_FLOW_IDEF.UOB,
		render: 'svg',
		shape: solid(uobMarkers),
		size: IDEF3_UOB_SIZE,
		labelPlacement: 'inside',
		props: {
			number: { label: () => UI_FLOW_IDEF.PROP_NUMBER, type: 'text' },
			ref: { label: () => UI_FLOW_IDEF.PROP_REF, type: 'text' },
		},
		model3d: 'auto',
		paletteGroup: 'idef3',
	},
	'junction-and': junctionKind('junction-and', () => UI_FLOW_IDEF.JUNCTION_AND),
	'junction-or': junctionKind('junction-or', () => UI_FLOW_IDEF.JUNCTION_OR),
	'junction-xor': junctionKind('junction-xor', () => UI_FLOW_IDEF.JUNCTION_XOR),
	referent: {
		label: () => UI_FLOW_IDEF.REFERENT,
		render: 'svg',
		shape: { shape: 'round-rect', ring: 'dashed', fill: NODE_FILL, stroke: LINE, markers: referentMarkers },
		size: IDEF3_REFERENT_SIZE,
		labelPlacement: 'inside',
		props: {
			type: {
				label: () => UI_FLOW_IDEF.PROP_REFERENT_TYPE,
				type: 'select',
				default: 'goto',
				options: [
					{ value: 'goto', label: REFERENT_LABELS.goto },
					{ value: 'object', label: REFERENT_LABELS.object },
					{ value: 'scenario', label: REFERENT_LABELS.scenario },
				],
			},
			target: { label: () => UI_FLOW_IDEF.PROP_REFERENT_TARGET, type: 'text' },
		},
		model3d: 'auto',
		paletteGroup: 'idef3',
	},
}

export const idef3EdgeKinds: Record<string, FlowEdgeKindDef> = {
	precedence: {
		label: () => UI_FLOW_IDEF.PRECEDENCE,
		stroke: 'solid',
		endMarker: 'arrow',
		routing: 'orthogonal',
		traffic: { rate: 0.6, speed: 110 },
		effect: 'travel',
	},
	relational: {
		label: () => UI_FLOW_IDEF.RELATIONAL,
		stroke: 'dashed',
		endMarker: 'none',
		routing: 'orthogonal',
		effect: 'draw',
	},
	'object-flow': {
		label: () => UI_FLOW_IDEF.OBJECT_FLOW,
		stroke: 'solid',
		endMarker: 'double-arrow',
		routing: 'orthogonal',
		traffic: { rate: 0.6, speed: 110 },
		effect: 'travel',
	},
}
