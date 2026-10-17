import { defineFlowNotation } from '../registry'
import { UI_FLOW_BPMN } from '@/locales/messages'

export const flowBpmn = defineFlowNotation({
	id: 'bpmn',
	label: () => UI_FLOW_BPMN.NAME,
	standard: 'OMG BPMN 2.0.2 · ISO/IEC 19510:2013',
	nodeKinds: {
		task: {
			label: () => UI_FLOW_BPMN.TASK,
			render: 'svg',
			shape: { shape: 'round-rect' },
			size: { width: 120, height: 72 },
		},
	},
	edgeKinds: {
		sequence: { label: () => UI_FLOW_BPMN.SEQUENCE, stroke: 'solid', endMarker: 'arrow', routing: 'orthogonal' },
	},
	defaultNodeKind: 'task',
	defaultEdgeKind: 'sequence',
	layout: { algorithm: 'layered', direction: 'LR', routing: 'orthogonal' },
})
