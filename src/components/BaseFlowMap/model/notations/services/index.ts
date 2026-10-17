import { defineFlowNotation } from '../registry'
import { UI_FLOW_SERVICES } from '@/locales/messages'

export const flowServices = defineFlowNotation({
	id: 'services',
	label: () => UI_FLOW_SERVICES.NAME,
	nodeKinds: {
		service: {
			label: () => UI_FLOW_SERVICES.NODE_SERVICE,
			render: 'html',
			shape: { shape: 'round-rect' },
			size: { width: 176, height: 64 },
			icon: 'server',
		},
	},
	edgeKinds: {
		call: { label: () => UI_FLOW_SERVICES.EDGE_CALL, stroke: 'solid', endMarker: 'arrow', routing: 'curved' },
	},
	defaultNodeKind: 'service',
	defaultEdgeKind: 'call',
	layout: { algorithm: 'layered', direction: 'TB', routing: 'curved' },
})
