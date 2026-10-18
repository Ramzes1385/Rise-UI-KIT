import { epcRules } from './epcRules'
import { epcLayout } from './epcLayout'
import { simulateEpc } from './epcSimulate'
import { defineFlowNotation } from '../registry'
import { UI_FLOW_EPC } from '@/locales/messages'
import { EPC_GATEWAYS, epcEdgeKinds, epcNodeKinds } from './epcKinds'

export const flowEpc = defineFlowNotation({
	id: 'epc',
	label: () => UI_FLOW_EPC.NOTATION,
	standard: 'ARIS eEPC (Scheer)',
	nodeKinds: epcNodeKinds,
	edgeKinds: epcEdgeKinds,
	defaultNodeKind: 'function',
	defaultEdgeKind: 'control',
	layout: { algorithm: 'epc', direction: 'TB', routing: 'orthogonal' },
	layouts: [epcLayout],
	rules: epcRules,
	semantics: { gateways: EPC_GATEWAYS, simulate: simulateEpc },
	rulesSummary: () => UI_FLOW_EPC.RULES_SUMMARY,
})
