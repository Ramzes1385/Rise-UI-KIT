import { sequenceRules } from './sequenceRules'
import { defineFlowNotation } from '../registry'
import { sequenceLayout } from './sequenceLayout'
import { simulateSequence } from './sequenceSimulate'
import { UI_FLOW_SEQUENCE } from '@/locales/messages'
import { sequenceEdgeKinds, sequenceNodeKinds } from './sequenceKinds'

export const flowSequence = defineFlowNotation({
	id: 'sequence',
	label: () => UI_FLOW_SEQUENCE.NOTATION,
	standard: 'OMG UML 2.5.1 · Interactions',
	nodeKinds: sequenceNodeKinds,
	edgeKinds: sequenceEdgeKinds,
	defaultNodeKind: 'lifeline',
	defaultEdgeKind: 'sync',
	layout: { algorithm: 'sequence', direction: 'TB', routing: 'straight', nodeGap: 40, gridSize: 0 },
	layouts: [sequenceLayout],
	rules: sequenceRules,
	semantics: { simulate: simulateSequence },
	rulesSummary: () => UI_FLOW_SEQUENCE.RULES_SUMMARY,
})
