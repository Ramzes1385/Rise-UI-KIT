import { UI_FLOW_DFD } from '@/locales/messages'
import type { FlowNode } from '../../../types/data/flowData.types'
import type { DfdStyle } from '../../../types/notations/process/dfd.types'
import type { FlowEdgeKindDef, FlowNodeKindDef, FlowShapeDef, FlowShapeMarker } from '../../../types/api/flowNotation.types'

const NODE_FILL = 'var(--rise-flow-map-node-bg, var(--rise-bg))'
const LINE = 'var(--rise-text-highlighted)'

const DFD_PROCESS_SIZE = { width: 160, height: 96 }
const DFD_STORE_SIZE = { width: 200, height: 44 }
const DFD_ENTITY_SIZE = { width: 150, height: 60 }
const DFD_YOURDON_PROCESS_SIZE = { width: 160, height: 160 }

function codeMarker(placement: FlowShapeMarker['placement']): (node: FlowNode) => FlowShapeMarker[] {
	return node => {
		const code = node.props?.code
		return typeof code === 'string' && code ? [{ text: code, placement }] : []
	}
}

const shape = (kind: FlowShapeDef['shape'], markers?: FlowShapeDef['markers']): FlowShapeDef => ({
	shape: kind,
	fill: NODE_FILL,
	stroke: LINE,
	markers,
})

const codeProp = { code: { label: () => UI_FLOW_DFD.PROP_CODE, type: 'text' as const } }

export const dfdNodeKinds: Record<string, FlowNodeKindDef> = {
	process: {
		label: () => UI_FLOW_DFD.PROCESS,
		render: 'svg',
		shape: shape('round-rect', codeMarker('top-start')),
		size: DFD_PROCESS_SIZE,
		labelPlacement: 'inside',
		props: codeProp,
		model3d: 'auto',
		paletteGroup: 'dfd',
	},
	store: {
		label: () => UI_FLOW_DFD.STORE,
		render: 'svg',
		shape: shape('open-rect', codeMarker('top-start')),
		size: DFD_STORE_SIZE,
		labelPlacement: 'inside',
		props: codeProp,
		model3d: 'db',
		paletteGroup: 'dfd',
	},
	entity: {
		label: () => UI_FLOW_DFD.ENTITY,
		render: 'svg',
		shape: shape('rect'),
		size: DFD_ENTITY_SIZE,
		labelPlacement: 'inside',
		isExternal: true,
		model3d: 'user',
		paletteGroup: 'dfd',
	},
}

export const dfdEdgeKinds: Record<string, FlowEdgeKindDef> = {
	flow: {
		label: () => UI_FLOW_DFD.FLOW,
		stroke: 'solid',
		endMarker: 'arrow',
		routing: 'orthogonal',
		traffic: { rate: 0.7, speed: 110 },
		effect: 'travel',
	},
}

export const dfdStyles: Record<DfdStyle, { label: () => string; nodeKinds: Record<string, Partial<FlowNodeKindDef>> }> = {
	'gane-sarson': {
		label: () => UI_FLOW_DFD.STYLE_GANE_SARSON,
		nodeKinds: {},
	},
	'yourdon-demarco': {
		label: () => UI_FLOW_DFD.STYLE_YOURDON_DEMARCO,
		nodeKinds: {
			process: { shape: shape('circle', codeMarker('bottom-center')), size: DFD_YOURDON_PROCESS_SIZE },
			store: { shape: shape('parallel-lines') },
			entity: { shape: shape('rect') },
		},
	},
}
