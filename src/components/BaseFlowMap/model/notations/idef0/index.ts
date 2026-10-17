import { defineFlowNotation } from '../registry'
import { UI_FLOW_IDEF } from '@/locales/messages'

export const flowIdef0 = defineFlowNotation({
	id: 'idef0',
	label: () => UI_FLOW_IDEF.IDEF0_NAME,
	standard: 'FIPS PUB 183 · IEEE 1320.1-1998',
	nodeKinds: {
		function: {
			label: () => UI_FLOW_IDEF.IDEF0_FUNCTION,
			render: 'svg',
			shape: { shape: 'rect' },
			size: { width: 168, height: 96 },
		},
	},
	edgeKinds: {
		arrow: { label: () => UI_FLOW_IDEF.IDEF0_ARROW, stroke: 'solid', endMarker: 'arrow', routing: 'orthogonal' },
	},
	defaultNodeKind: 'function',
	defaultEdgeKind: 'arrow',
	layout: { algorithm: 'layered', direction: 'LR', routing: 'orthogonal' },
})
