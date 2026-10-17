import { formatMessage } from '@/locales/state'
import { UI_FLOW_IDEF } from '@/locales/messages'
import type { Idef0PortRole } from '../../../types/notations/process/idef.types'
import type { FlowNode, FlowPort, FlowPortSide } from '../../../types/data/flowData.types'
import { IDEF0_BOUNDARY_ROLES, IDEF0_PORT_ROLES } from '../../../types/notations/process/idef.types'
import type { FlowEdgeKindDef, FlowNodeKindDef, FlowPropDef, FlowShapeDef, FlowShapeMarker } from '../../../types/api/flowNotation.types'

const NODE_FILL = 'var(--rise-flow-map-node-bg, var(--rise-bg))'
const LINE = 'var(--rise-text-highlighted)'

const IDEF0_FUNCTION_SIZE = { width: 170, height: 96 }

const IDEF0_BOUNDARY_SIZE = { width: 150, height: 28 }

const ROLE_LABELS: Record<Idef0PortRole, () => string> = {
	input: () => UI_FLOW_IDEF.PORT_INPUT,
	control: () => UI_FLOW_IDEF.PORT_CONTROL,
	output: () => UI_FLOW_IDEF.PORT_OUTPUT,
	mechanism: () => UI_FLOW_IDEF.PORT_MECHANISM,
	call: () => UI_FLOW_IDEF.PORT_CALL,
}

export function idef0RoleLabel(role: string): string {
	return ROLE_LABELS[role as Idef0PortRole]?.() ?? role
}

const PORT_PLACEMENT: Record<Idef0PortRole, { side: FlowPortSide; direction: 'in' | 'out'; offset?: number }> = {
	input: { side: 'left', direction: 'in' },
	control: { side: 'top', direction: 'in' },
	output: { side: 'right', direction: 'out' },
	mechanism: { side: 'bottom', direction: 'in' },
	call: { side: 'bottom', direction: 'out', offset: 0.85 },
}

function icomPort(role: Idef0PortRole): FlowPort {
	return {
		id: role,
		role,
		...PORT_PLACEMENT[role],
		get label() {
			return ROLE_LABELS[role]()
		},
	}
}

function idef0FunctionPorts(): FlowPort[] {
	return IDEF0_PORT_ROLES.map(icomPort)
}

function functionMarkers(node: FlowNode): FlowShapeMarker[] {
	const { code, page } = node.props ?? {}
	const markers: FlowShapeMarker[] = []
	if (typeof code === 'string' && code) markers.push({ text: code, placement: 'bottom-end' })
	if (typeof page === 'string' && page) markers.push({ text: formatMessage(UI_FLOW_IDEF.PAGE, { page }), placement: 'bottom-start' })
	return markers
}

function boundaryMarkers(node: FlowNode): FlowShapeMarker[] {
	const { code, isTunnel } = node.props ?? {}
	const markers: FlowShapeMarker[] = []
	if (typeof code === 'string' && code) markers.push({ text: code, placement: 'top-start' })
	if (isTunnel === true) markers.push({ text: '( )', placement: 'bottom-end' })
	return markers
}

const functionShape: FlowShapeDef = {
	shape: 'rect',
	fill: NODE_FILL,
	stroke: LINE,
	markers: functionMarkers,
}

const boundaryShape: FlowShapeDef = {
	shape: 'rect',
	fill: 'transparent',
	stroke: 'transparent',
	markers: boundaryMarkers,
}

const textProp = (label: () => string): FlowPropDef => ({ label, type: 'text' })

export const idef0NodeKinds: Record<string, FlowNodeKindDef> = {
	function: {
		label: () => UI_FLOW_IDEF.FUNCTION,
		render: 'svg',
		shape: functionShape,
		size: IDEF0_FUNCTION_SIZE,
		labelPlacement: 'inside',
		ports: idef0FunctionPorts(),
		props: { code: textProp(() => UI_FLOW_IDEF.PROP_CODE), page: textProp(() => UI_FLOW_IDEF.PROP_PAGE) },
		model3d: 'auto',
		paletteGroup: 'idef0',
	},
	boundary: {
		label: () => UI_FLOW_IDEF.BOUNDARY,
		render: 'svg',
		shape: boundaryShape,
		size: IDEF0_BOUNDARY_SIZE,
		labelPlacement: 'inside',
		props: {
			code: textProp(() => UI_FLOW_IDEF.PROP_BOUNDARY_CODE),
			icom: {
				label: () => UI_FLOW_IDEF.PROP_ICOM,
				type: 'select',
				default: 'input',
				options: IDEF0_BOUNDARY_ROLES.map(value => ({ value, label: ROLE_LABELS[value] })),
			},
			isTunnel: { label: () => UI_FLOW_IDEF.PROP_TUNNEL, type: 'boolean', default: false },
		},
		model3d: 'auto',
		paletteGroup: 'idef0',
	},
}

export const idef0EdgeKinds: Record<string, FlowEdgeKindDef> = {
	arrow: {
		label: () => UI_FLOW_IDEF.ARROW,
		stroke: 'solid',
		endMarker: 'arrow',
		routing: 'orthogonal',
		traffic: { rate: 0.6, speed: 110 },
		effect: 'travel',
	},
}
