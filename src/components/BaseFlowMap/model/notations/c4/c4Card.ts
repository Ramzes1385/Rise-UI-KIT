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
