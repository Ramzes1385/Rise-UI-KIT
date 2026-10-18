import { c4Layout } from './c4Layout'
import { C4_ZOOM_LEVELS } from './c4Zoom'
import { c4Legend, c4Rules } from './c4Rules'
import { UI_FLOW_C4 } from '@/locales/messages'
import { defineFlowNotation } from '../registry'
import { c4EdgeKinds, c4GroupKinds, c4NodeKinds } from './c4Kinds'

export const flowC4 = defineFlowNotation({
	id: 'c4',
	label: () => UI_FLOW_C4.NOTATION,
	standard: 'C4 model (c4model.com)',
	nodeKinds: c4NodeKinds,
	edgeKinds: c4EdgeKinds,
	groupKinds: c4GroupKinds,
	defaultNodeKind: 'container',
	defaultEdgeKind: 'relationship',
	layout: { algorithm: 'c4-nested', direction: 'TB', routing: 'orthogonal' },
	layouts: [c4Layout],
	rules: c4Rules,
	legend: c4Legend,
	semanticZoom: C4_ZOOM_LEVELS,
	rulesSummary: () => UI_FLOW_C4.RULES_SUMMARY,
})

export { c4CardLine } from './c4Card'
export { collapsedGroupIds } from './c4Zoom'
