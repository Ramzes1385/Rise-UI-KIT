import { BPMN_RULES } from './bpmnRules'
import { defineFlowNotation } from '../registry'
import { UI_FLOW_BPMN } from '@/locales/messages'
import { BPMN_GATEWAYS, simulateBpmn } from './bpmnSimulate'
import { BPMN_EDGE_KINDS, BPMN_GROUP_KINDS, BPMN_NODE_KINDS } from './bpmnKinds'

export const flowBpmn = defineFlowNotation({
	id: 'bpmn',
	label: () => UI_FLOW_BPMN.NAME,
	standard: 'OMG BPMN 2.0.2 · ISO/IEC 19510:2013',
	nodeKinds: BPMN_NODE_KINDS,
	edgeKinds: BPMN_EDGE_KINDS,
	groupKinds: BPMN_GROUP_KINDS,
	defaultNodeKind: 'task',
	defaultEdgeKind: 'sequence',
	layout: { algorithm: 'layered', direction: 'LR', routing: 'orthogonal' },
	rules: BPMN_RULES,
	semantics: { gateways: BPMN_GATEWAYS, simulate: simulateBpmn },
	rulesSummary: () => UI_FLOW_BPMN.RULES_SUMMARY,
})
