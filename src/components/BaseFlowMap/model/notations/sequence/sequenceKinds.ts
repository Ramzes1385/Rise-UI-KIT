import { UI_FLOW_SEQUENCE } from '@/locales/messages'
import { fragmentPath, lifelinePath } from './sequencePaths'
import type { FlowNode } from '../../../types/data/flowData.types'
import type { SequenceOperator } from '../../../types/notations/architecture/sequence.types'
import type { FlowEdgeKindDef, FlowNodeKindDef, FlowShapeDef, FlowShapeMarker } from '../../../types/api/flowNotation.types'

const LINE = 'var(--rise-text-highlighted)'
const FILL = 'var(--rise-flow-map-node-bg, var(--rise-bg))'
const FRAME = 'var(--rise-text-muted)'
const PERSON = 'M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM4 21a8 8 0 0 1 16 0Z'

const OPERATORS: Record<SequenceOperator, () => string> = {
	alt: () => UI_FLOW_SEQUENCE.OPERATOR_ALT,
	opt: () => UI_FLOW_SEQUENCE.OPERATOR_OPT,
	loop: () => UI_FLOW_SEQUENCE.OPERATOR_LOOP,
	par: () => UI_FLOW_SEQUENCE.OPERATOR_PAR,
	break: () => UI_FLOW_SEQUENCE.OPERATOR_BREAK,
	critical: () => UI_FLOW_SEQUENCE.OPERATOR_CRITICAL,
	ref: () => UI_FLOW_SEQUENCE.OPERATOR_REF,
}

const lifelineShape = (extra: FlowShapeMarker[]): FlowShapeDef => ({
	shape: 'path',
	path: lifelinePath,
	fill: FILL,
	stroke: LINE,
	text: LINE,
	markers: node => [{ text: node.label, placement: 'top-center' }, ...extra],
})

function fragmentMarkers(node: FlowNode): FlowShapeMarker[] {
	const operator = typeof node.props?.operator === 'string' ? node.props.operator : 'alt'
	const guard = typeof node.props?.guard === 'string' && node.props.guard ? ` [${node.props.guard}]` : ''
	return [{ text: operator + guard, placement: 'top-start' }]
}

export const sequenceNodeKinds: Record<string, FlowNodeKindDef> = {
	lifeline: {
		label: () => UI_FLOW_SEQUENCE.LIFELINE,
		render: 'svg',
		shape: lifelineShape([]),
		size: { width: 150, height: 420 },
		labelPlacement: 'none',
		model3d: 'auto',
		paletteGroup: 'sequence',
	},
	actor: {
		label: () => UI_FLOW_SEQUENCE.ACTOR,
		render: 'svg',
		shape: lifelineShape([{ path: PERSON, placement: 'top-end' }]),
		size: { width: 150, height: 420 },
		labelPlacement: 'none',
		isExternal: true,
		model3d: 'user',
		paletteGroup: 'sequence',
	},
	fragment: {
		label: () => UI_FLOW_SEQUENCE.FRAGMENT,
		render: 'svg',
		shape: { shape: 'path', path: fragmentPath, fill: 'none', stroke: FRAME, text: LINE, markers: fragmentMarkers },
		size: { width: 300, height: 120 },
		labelPlacement: 'none',
		props: {
			operator: {
				label: () => UI_FLOW_SEQUENCE.PROP_OPERATOR,
				type: 'select',
				default: 'alt',
				options: Object.entries(OPERATORS).map(([value, label]) => ({ value, label })),
			},
			guard: { label: () => UI_FLOW_SEQUENCE.PROP_GUARD, type: 'text' },
			from: { label: () => UI_FLOW_SEQUENCE.PROP_FROM, type: 'text' },
			to: { label: () => UI_FLOW_SEQUENCE.PROP_TO, type: 'text' },
		},
		model3d: 'auto',
		paletteGroup: 'sequence',
	},
}

const message = (label: () => string, extra: Partial<FlowEdgeKindDef>): FlowEdgeKindDef => ({
	label,
	stroke: 'solid',
	color: LINE,
	endMarker: 'arrow',
	routing: 'straight',
	traffic: { rate: 0.5, speed: 120 },
	effect: 'travel',
	...extra,
})

export const sequenceEdgeKinds: Record<string, FlowEdgeKindDef> = {
	sync: message(() => UI_FLOW_SEQUENCE.SYNC, {}),
	async: message(() => UI_FLOW_SEQUENCE.ASYNC, { endMarker: 'open-arrow' }),
	reply: message(() => UI_FLOW_SEQUENCE.REPLY, { stroke: 'dashed', endMarker: 'open-arrow', traffic: undefined }),
	create: message(() => UI_FLOW_SEQUENCE.CREATE, { stroke: 'dashed', endMarker: 'open-arrow', traffic: undefined }),
	destroy: message(() => UI_FLOW_SEQUENCE.DESTROY, { endMarker: 'cross' }),
}
