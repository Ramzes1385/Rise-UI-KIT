import { defineFlowNotation } from '../registry'
import { UI_FLOW_DFD } from '@/locales/messages'

export const flowDfd = defineFlowNotation({
	id: 'dfd',
	label: () => UI_FLOW_DFD.NAME,
	standard: 'DFD · Yourdon — DeMarco, Gane — Sarson',
	nodeKinds: {
		process: {
			label: () => UI_FLOW_DFD.PROCESS,
			render: 'svg',
			shape: { shape: 'circle' },
			size: { width: 112, height: 112 },
		},
	},
	edgeKinds: {
		flow: { label: () => UI_FLOW_DFD.FLOW, stroke: 'solid', endMarker: 'arrow', routing: 'curved' },
	},
	defaultNodeKind: 'process',
	defaultEdgeKind: 'flow',
	layout: { algorithm: 'layered', direction: 'LR', routing: 'curved' },
})
