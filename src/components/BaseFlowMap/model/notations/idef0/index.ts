import { idef0Rules } from './idef0Rules'
import { idef0Simulate } from './idef0Simulate'
import { defineFlowNotation } from '../registry'
import { idef0Staircase } from './idef0Staircase'
import { UI_FLOW_IDEF } from '@/locales/messages'
import { idef0EdgeKinds, idef0NodeKinds } from './idef0Kinds'

export const flowIdef0 = defineFlowNotation({
	id: 'idef0',
	label: () => UI_FLOW_IDEF.NOTATION_IDEF0,
	standard: 'FIPS PUB 183 · IEEE 1320.1-1998',
	nodeKinds: idef0NodeKinds,
	edgeKinds: idef0EdgeKinds,
	defaultNodeKind: 'function',
	defaultEdgeKind: 'arrow',
	layout: { algorithm: 'idef0-staircase', direction: 'LR', routing: 'orthogonal' },
	layouts: [idef0Staircase],
	rules: idef0Rules,
	semantics: { simulate: idef0Simulate },
	rulesSummary: () => UI_FLOW_IDEF.RULES_SUMMARY_IDEF0,
})
