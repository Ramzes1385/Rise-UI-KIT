import { c4NodeKinds } from './c4Kinds'
import { UI_FLOW_C4 } from '@/locales/messages'
import { formatMessage } from '@/locales/state'
import type { FlowNode } from '../../../types/data/flowData.types'
import type { C4NodeKind } from '../../../types/notations/architecture/c4.types'

export function c4KindOf(node: { kind: string }): string {
	return node.kind.replace(/^c4:/, '')
}

export function c4CardLine(node: FlowNode): string {
	const kind = c4NodeKinds[c4KindOf(node) as C4NodeKind]?.label() ?? ''
	const technology = node.props?.technology
	if (typeof technology === 'string' && technology) return formatMessage(UI_FLOW_C4.CARD_LINE, { kind, technology })
	return formatMessage(UI_FLOW_C4.CARD_LINE_PLAIN, { kind })
}

const BLOCK_KINDS: Record<string, () => string> = {
	'enterprise-boundary': () => UI_FLOW_C4.ENTERPRISE_BOUNDARY,
	'system-boundary': () => UI_FLOW_C4.SOFTWARE_SYSTEM,
	'container-boundary': () => UI_FLOW_C4.CONTAINER,
}

function technologyOf(node: FlowNode): string | undefined {
	const groupProps = node.props?.groupProps
	const technology = groupProps && typeof groupProps === 'object' && !Array.isArray(groupProps) ? groupProps.technology : undefined
	return typeof technology === 'string' && technology ? technology : undefined
}

export function c4BlockLine(node: FlowNode): string {
	const groupKind = node.props?.groupKind
	const kind = typeof groupKind === 'string' ? BLOCK_KINDS[groupKind]?.() : undefined
	if (kind === undefined) return node.subtitle ?? ''
	const technology = technologyOf(node)
	return technology ? formatMessage(UI_FLOW_C4.CARD_LINE, { kind, technology }) : formatMessage(UI_FLOW_C4.CARD_LINE_PLAIN, { kind })
}
