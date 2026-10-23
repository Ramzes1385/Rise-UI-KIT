import type { Ref } from 'vue'
import { formatMessage } from '@/locales/state'
import { UI_FLOW_MAP } from '@/locales/messages'
import { FLOW_COLLAPSED_KIND } from '../groups/tree/collapseData'
import type { FlowElementRef } from '../../types/data/flowReview.types'
import type { FlowMapContext } from '../../types/internal/flowModel.types'
import type { FlowElementEvent } from '../../types/api/flowController.types'
import type { FlowElementEventKind, FlowModelInternal, FlowPickApi } from '../../types/internal/core/flowRenderInternal.types'

function nameOf(model: FlowModelInternal, target: FlowElementRef): string {
	const graph = model.graph.value
	if (target.entity === 'node') return graph.nodes.get(target.id)?.label ?? target.id
	if (target.entity === 'group') return graph.groups.get(target.id)?.label ?? target.id
	return graph.edges.get(target.id)?.label ?? target.id
}

function enterBlock(model: FlowModelInternal, target: FlowElementRef): void {
	const node = target.entity === 'node' ? model.shown.value.nodes.find(item => item.id === target.id) : undefined
	if (node?.kind === FLOW_COLLAPSED_KIND) model.controller.enterGroup(node.id)
}

export function useFlowPick(
	model: FlowModelInternal,
	map: FlowMapContext,
	parts: { hovered: Ref<string | null>; isDisabled: () => boolean },
): FlowPickApi {
	let current: FlowElementRef | null = null

	function send(kind: FlowElementEventKind, target: FlowElementRef, event?: FlowElementEvent['event']): void {
		if (target.entity === 'scenario') return
		const name = `${target.entity}-${kind}`
		if (target.entity === 'group' && kind !== 'click' && kind !== 'contextmenu') return
		;(model.events.emit as (name: string, value: FlowElementEvent) => void)(name, { target, event })
	}

	function pick(target: FlowElementRef, event?: MouseEvent): void {
		if (parts.isDisabled()) return
		const isToggle = Boolean(event && (event.shiftKey || event.ctrlKey || event.metaKey))
		model.controller.select([target.id], isToggle ? 'toggle' : 'replace')
		map.openDetails(target)
		map.announce(formatMessage(UI_FLOW_MAP.ANNOUNCE_SELECTED, { label: nameOf(model, target) }))
		send('click', target, event)
		enterBlock(model, target)
	}

	function clear(): void {
		model.controller.select([])
		map.openDetails(null)
		map.announce(UI_FLOW_MAP.ANNOUNCE_CLEARED)
	}

	function hover(target: FlowElementRef | null, event?: PointerEvent): void {
		if (current?.id === target?.id) return
		if (current) send('leave', current, event)
		current = target
		parts.hovered.value = target?.id ?? null
		if (target) send('enter', target, event)
	}

	return {
		pick,
		clear,
		hover,
		open: (target, event) => {
			send('dblclick', target, event)
			enterBlock(model, target)
		},
		menu: (target, event) => send('contextmenu', target, event),
	}
}
