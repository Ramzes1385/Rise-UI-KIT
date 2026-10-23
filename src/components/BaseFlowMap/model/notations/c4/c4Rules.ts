import { c4KindOf } from './c4Card'
import { c4NodeKinds } from './c4Kinds'
import { UI_FLOW_C4 } from '@/locales/messages'
import { formatMessage } from '@/locales/state'
import type { FlowGraph } from '../../../types/api/flowLayout.types'
import type { C4NodeKind } from '../../../types/notations/architecture/c4.types'
import type { FlowGroup, FlowMapData, FlowNode } from '../../../types/data/flowData.types'
import type { FlowDataIssue, FlowLegendItem, FlowNotationRules, FlowRuleResult } from '../../../types/api/flowNotation.types'

const ALL_KINDS: C4NodeKind[] = ['person', 'software-system', 'container', 'component', 'external-person', 'external-system']

const CONTAINS: Record<string, C4NodeKind[]> = {
	'enterprise-boundary': ['person', 'software-system', 'external-person', 'external-system'],
	'system-boundary': ['container'],
	'container-boundary': ['component'],
}

function c4CanContain(group: FlowGroup | null, node: FlowNode): FlowRuleResult {
	const allowed = group ? CONTAINS[group.kind.replace(/^c4:/, '')] : undefined
	if (!group || !allowed || allowed.includes(c4KindOf(node) as C4NodeKind)) return true
	const kinds = allowed.map(kind => c4NodeKinds[kind].label()).join(', ')
	return { code: 'c4-contain', message: formatMessage(UI_FLOW_C4.RULE_CONTAIN, { group: group.label || group.id, kinds }) }
}

function c4Validate(data: FlowMapData, graph: FlowGraph): FlowDataIssue[] {
	return data.edges
		.filter(edge => !edge.label?.trim())
		.map(edge => ({
			level: 'warning' as const,
			code: 'c4-relationship-label',
			message: formatMessage(UI_FLOW_C4.WARN_NO_LABEL, {
				source: graph.nodes.get(edge.source)?.label ?? edge.source,
				target: graph.nodes.get(edge.target)?.label ?? edge.target,
			}),
			target: { entity: 'edge' as const, id: edge.id },
		}))
}

export function c4Legend(data: FlowMapData): FlowLegendItem[] {
	const used = new Set(data.nodes.map(c4KindOf))
	const nodes = ALL_KINDS.filter(kind => used.has(kind)).map(kind => ({
		id: `node-${kind}`,
		label: c4NodeKinds[kind].label(),
		sample: { entity: 'node' as const, kind },
	}))
	return [
		...nodes,
		{ id: 'edge-relationship', label: UI_FLOW_C4.RELATIONSHIP, sample: { entity: 'edge' as const, kind: 'relationship' } },
	]
}

export const c4Rules: FlowNotationRules = {
	connections: [{ edge: 'relationship', from: ALL_KINDS, to: ALL_KINDS }],
	canContain: c4CanContain,
	validate: c4Validate,
}
