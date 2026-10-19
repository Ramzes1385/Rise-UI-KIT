import { trackPointer } from './editTrack'
import { portsOf } from '../geometry/editPorts'
import { formatMessage } from '@/locales/state'
import { UI_FLOW_EDITOR } from '@/locales/messages'
import { containsPoint, toCanvas } from '../geometry/editGeometry'
import type { FlowPoint } from '../../../types/data/flowData.types'
import type { FlowEditContext } from '../../../types/internal/edit/flowEditApi.types'
import type { FlowEditEnd, FlowEditLink } from '../../../types/internal/edit/flowEdit.types'

export function endOfPort(value: string | null | undefined): FlowEditEnd | null {
	if (!value) return null
	const [node, port] = value.split('|')
	return { node, port: port || undefined }
}

function nodeAt(context: FlowEditContext, point: FlowPoint, skip: string): string | null {
	const { layout, graph } = context.env.model
	const hit = Object.entries(layout.value.nodes).find(
		([id, rect]) => id !== skip && graph.value.nodes.has(id) && containsPoint(rect, point),
	)
	return hit?.[0] ?? null
}

function anchorOf(context: FlowEditContext, end: FlowEditEnd): FlowPoint {
	const { model } = context.env
	const rect = model.layout.value.nodes[end.node]
	const node = model.graph.value.nodes.get(end.node)
	const ports = portsOf(node ? (node.ports ?? model.nodeKind(node).ports) : undefined, rect)
	const found = ports.find(port => port.id === (end.port ?? ''))
	return found?.point ?? { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
}

function verdictOf(context: FlowEditContext, source: FlowEditEnd, target: FlowEditEnd | null): Pick<FlowEditLink, 'verdict' | 'message'> {
	if (!target) return { verdict: 'none' }
	const rejected = context.commands.verify([source, target])
	return rejected ? { verdict: 'no', message: rejected.message } : { verdict: 'ok' }
}

function targetOf(context: FlowEditContext, input: { event: PointerEvent; point: FlowPoint; source: FlowEditEnd }): FlowEditEnd | null {
	const port = endOfPort((input.event.target as Element | null)?.closest?.('[data-edit-port]')?.getAttribute('data-edit-port'))
	if (port && port.node !== input.source.node) return port
	const node = nodeAt(context, input.point, input.source.node)
	return node ? { node } : null
}

async function finishLink(context: FlowEditContext, link: FlowEditLink): Promise<void> {
	const { state } = context.env
	if (link.verdict === 'no' && link.message) {
		context.notify('warning', formatMessage(UI_FLOW_EDITOR.NOTICE_DENIED, { message: link.message }))
		context.env.map.announce(link.message)
	}
	if (link.verdict !== 'ok' || !link.target) {
		state.link.value = null
		return
	}
	state.link.value = { ...link, verdict: 'pending' }
	await context.commands.connect([link.source, link.target])
	state.link.value = null
}

export function startLink(context: FlowEditContext, event: PointerEvent, source: FlowEditEnd): void {
	const { state } = context.env
	const from = anchorOf(context, source)
	state.link.value = { source, from, to: from, target: null, verdict: 'none' }
	trackPointer(event, {
		onMove: next => {
			const point = toCanvas(next, context.view())
			const target = targetOf(context, { event: next, point, source })
			state.link.value = { source, from, to: point, target, ...verdictOf(context, source, target) }
		},
		onEnd: (_, isMoved) => {
			const link = state.link.value
			context.flags.isClickSuppressed = isMoved
			if (isMoved && link) void finishLink(context, link)
			else state.link.value = null
		},
	})
}
