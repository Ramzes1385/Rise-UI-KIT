import { defineFlowNotation } from '../registry'
import { UI_FLOW_IDEF } from '@/locales/messages'

export const flowIdef3 = defineFlowNotation({
	id: 'idef3',
	label: () => UI_FLOW_IDEF.IDEF3_NAME,
	standard: 'IDEF3 · KBSI 1995',
	nodeKinds: {
		uob: {
			label: () => UI_FLOW_IDEF.IDEF3_UOB,
			render: 'svg',
			shape: { shape: 'rect' },
			size: { width: 152, height: 72 },
		},
	},
	edgeKinds: {
		precedence: { label: () => UI_FLOW_IDEF.IDEF3_PRECEDENCE, stroke: 'solid', endMarker: 'arrow', routing: 'orthogonal' },
	},
	defaultNodeKind: 'uob',
	defaultEdgeKind: 'precedence',
	layout: { algorithm: 'layered', direction: 'LR', routing: 'orthogonal' },
})
