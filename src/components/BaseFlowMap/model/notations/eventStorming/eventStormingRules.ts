import { formatMessage } from '@/locales/state'
import { UI_FLOW_EVENT_STORMING } from '@/locales/messages'
import type { FlowGraph } from '../../../types/api/flowLayout.types'
import type { FlowMapData, FlowNode } from '../../../types/data/flowData.types'
import type { FlowDataIssue, FlowNotationRules } from '../../../types/api/flowNotation.types'
import type { EventStormingGrammar } from '../../../types/notations/architecture/eventStorming.types'

const EVENT_STORMING_GRAMMAR: EventStormingGrammar = {
	actor: ['command'],
	command: ['aggregate', 'external-system'],
	aggregate: ['domain-event'],
	'external-system': ['domain-event'],
	'domain-event': ['policy', 'read-model', 'command'],
	policy: ['command'],
	'read-model': ['actor'],
}

const NOTES = ['hotspot', 'opportunity']

const EXPECTED: Record<string, () => string> = {
	actor: () => UI_FLOW_EVENT_STORMING.EXPECTED_ACTOR,
	command: () => UI_FLOW_EVENT_STORMING.EXPECTED_COMMAND,
	aggregate: () => UI_FLOW_EVENT_STORMING.EXPECTED_AGGREGATE,
	'external-system': () => UI_FLOW_EVENT_STORMING.EXPECTED_EXTERNAL,
	'domain-event': () => UI_FLOW_EVENT_STORMING.EXPECTED_EVENT,
	policy: () => UI_FLOW_EVENT_STORMING.EXPECTED_POLICY,
	'read-model': () => UI_FLOW_EVENT_STORMING.EXPECTED_READ_MODEL,
}

export function stormingKindOf(node: { kind: string }): string {
	return node.kind.replace(/^event-storming:/, '')
}

function nameOf(node: FlowNode): string {
	return node.label || node.id
}

function isAllowed(source: FlowNode, target: FlowNode): boolean {
	const from = stormingKindOf(source)
	const to = stormingKindOf(target)
	if (NOTES.includes(from) || NOTES.includes(to)) return true
	return (EVENT_STORMING_GRAMMAR[from] as readonly string[] | undefined)?.includes(to) ?? false
}

function stormingValidate(data: FlowMapData, graph: FlowGraph): FlowDataIssue[] {
	const issues: FlowDataIssue[] = []
	for (const edge of data.edges) {
		const source = graph.nodes.get(edge.source)
		const target = graph.nodes.get(edge.target)
		if (!source || !target || isAllowed(source, target)) continue
		const expected = EXPECTED[stormingKindOf(source)]?.() ?? ''
		const message = formatMessage(UI_FLOW_EVENT_STORMING.WARN_GRAMMAR, { source: nameOf(source), target: nameOf(target), expected })
		issues.push({ level: 'warning', code: 'es-grammar', message, target: { entity: 'edge', id: edge.id } })
	}
	return issues
}

export const eventStormingRules: FlowNotationRules = { validate: stormingValidate }
