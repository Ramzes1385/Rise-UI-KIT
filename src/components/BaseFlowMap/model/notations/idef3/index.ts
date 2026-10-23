import { idef3Rules } from './idef3Rules'
import { idef3Simulate } from './idef3Simulate'
import { defineFlowNotation } from '../registry'
import { UI_FLOW_IDEF } from '@/locales/messages'
import { idef3EdgeKinds, idef3Gateways, idef3NodeKinds } from './idef3Kinds'

export const flowIdef3 = defineFlowNotation({
	id: 'idef3',
	label: () => UI_FLOW_IDEF.NOTATION_IDEF3,
	standard: 'IDEF3 · KBSI 1995',
	nodeKinds: idef3NodeKinds,
	edgeKinds: idef3EdgeKinds,
	defaultNodeKind: 'uob',
	defaultEdgeKind: 'precedence',
	layout: { algorithm: 'layered', direction: 'LR', routing: 'orthogonal' },
	rules: idef3Rules,
	semantics: { gateways: idef3Gateways, simulate: idef3Simulate },
	rulesSummary: () => UI_FLOW_IDEF.RULES_SUMMARY_IDEF3,
})
