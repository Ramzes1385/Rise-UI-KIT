import { defineFlowNotation } from '../registry'
import { SERVICES_RULES } from './servicesRules'
import { UI_FLOW_SERVICES } from '@/locales/messages'
import { SERVICES_EDGE_KINDS, SERVICES_GROUP_KINDS, SERVICES_NODE_KINDS } from './servicesKinds'

export const flowServices = defineFlowNotation({
	id: 'services',
	label: () => UI_FLOW_SERVICES.NAME,
	nodeKinds: SERVICES_NODE_KINDS,
	edgeKinds: SERVICES_EDGE_KINDS,
	groupKinds: SERVICES_GROUP_KINDS,
	defaultNodeKind: 'service',
	defaultEdgeKind: 'call',
	layout: { algorithm: 'layered', direction: 'TB', routing: 'curved' },
	rules: SERVICES_RULES,
	rulesSummary: () => UI_FLOW_SERVICES.RULES_SUMMARY,
})
