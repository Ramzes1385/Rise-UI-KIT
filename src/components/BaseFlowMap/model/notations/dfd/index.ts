import { dfdRules } from './dfdRules'
import { defineFlowNotation } from '../registry'
import { UI_FLOW_DFD } from '@/locales/messages'
import { dfdEdgeKinds, dfdNodeKinds, dfdStyles } from './dfdKinds'

export const flowDfd = defineFlowNotation({
	id: 'dfd',
	label: () => UI_FLOW_DFD.NOTATION,
	standard: 'DFD · Yourdon — DeMarco, Gane — Sarson',
	nodeKinds: dfdNodeKinds,
	edgeKinds: dfdEdgeKinds,
	defaultNodeKind: 'process',
	defaultEdgeKind: 'flow',
	layout: { algorithm: 'layered', direction: 'LR', routing: 'orthogonal', options: { style: 'gane-sarson' } },
	rules: dfdRules,
	styles: dfdStyles,
	rulesSummary: () => UI_FLOW_DFD.RULES_SUMMARY,
})
