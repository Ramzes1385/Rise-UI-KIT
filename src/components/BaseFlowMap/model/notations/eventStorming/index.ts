import { defineFlowNotation } from '../registry'
import { timelineLayout } from './eventStormingLayout'
import { eventStormingRules } from './eventStormingRules'
import { UI_FLOW_EVENT_STORMING } from '@/locales/messages'
import { eventStormingEdgeKinds, eventStormingGroupKinds, eventStormingNodeKinds } from './eventStormingKinds'

export const flowEventStorming = defineFlowNotation({
	id: 'event-storming',
	label: () => UI_FLOW_EVENT_STORMING.NOTATION,
	standard: 'EventStorming (Brandolini)',
	nodeKinds: eventStormingNodeKinds,
	edgeKinds: eventStormingEdgeKinds,
	groupKinds: eventStormingGroupKinds,
	defaultNodeKind: 'domain-event',
	defaultEdgeKind: 'flow',
	layout: { algorithm: 'timeline', direction: 'LR', routing: 'curved' },
	layouts: [timelineLayout],
	rules: eventStormingRules,
	rulesSummary: () => UI_FLOW_EVENT_STORMING.RULES_SUMMARY,
})
