import { startDrag } from './editDrag'
import { onScopeDispose, watch } from 'vue'
import { startLabel } from '../panels/editLabel'
import { startLink, endOfPort } from './editLink'
import { toCanvas } from '../geometry/editGeometry'
import { startMarquee, startPan } from './editMarquee'
import { noteKindOf, placeNode } from '../actions/editPlace'
import { createKeyMap, handleKeydown } from '../actions/editKeys'
import type { FlowElementRef } from '../../../types/data/flowReview.types'
import type { FlowEditEnd } from '../../../types/internal/edit/flowEdit.types'
import type { FlowEditContext } from '../../../types/internal/edit/flowEditApi.types'

const NODE = '[data-flow-entity="node"]'

function consume(event: Event): void {
	event.preventDefault()
	event.stopPropagation()
}

function idOf(target: EventTarget | null, selector: string): string | null {
	return (target as Element | null)?.closest?.(selector)?.getAttribute('data-flow-id') ?? null
}

function portOf(event: Event): FlowEditEnd | null {
	return endOfPort((event.target as Element | null)?.closest?.('[data-edit-port]')?.getAttribute('data-edit-port'))
}

function startPress(context: FlowEditContext, event: PointerEvent): void {
	const { state } = context.env
	const port = portOf(event)
	const node = idOf(event.target, NODE)
	if (port || (state.tool.value === 'connect' && node)) {
		consume(event)
		startLink(context, event, port ?? { node: node as string })
	} else if (node && state.tool.value === 'select') startDrag(context, event, node)
	else if (!node) startEmpty(context, event)
}

function onPointerdown(context: FlowEditContext, event: PointerEvent): void {
	const { state } = context.env
	if (!state.isActive.value || state.isCompact.value) return
	context.flags.isClickSuppressed = false
	if (event.button === 1 || state.tool.value === 'hand' || state.isHandHeld.value) {
		consume(event)
		startPan(context, event)
	} else if (event.button === 0) startPress(context, event)
}

function startEmpty(context: FlowEditContext, event: PointerEvent): void {
	const { model, state } = context.env
	consume(event)
	const tool = state.tool.value
	if (tool === 'node' || tool === 'note') {
		const kind = tool === 'node' ? model.notation.value.defaultNodeKind : noteKindOf(context)
		state.tool.value = 'select'
		if (kind) void placeNode(context, { kind, at: toCanvas(event, context.view()) })
		return
	}
	if (tool === 'select' || tool === 'group') startMarquee(context, event)
}

function onClick(context: FlowEditContext, event: MouseEvent): void {
	if (!context.flags.isClickSuppressed) return
	context.flags.isClickSuppressed = false
	consume(event)
}

function refOf(target: EventTarget | null): FlowElementRef | null {
	const element = (target as Element | null)?.closest?.('[data-flow-entity]')
	const entity = element?.getAttribute('data-flow-entity') as FlowElementRef['entity'] | null | undefined
	const id = element?.getAttribute('data-flow-id')
	return entity && id ? { entity, id } : null
}

function onDblclick(context: FlowEditContext, event: MouseEvent): void {
	const { state, model } = context.env
	const target = refOf(event.target)
	if (!state.isActive.value || state.isCompact.value || !target) return
	consume(event)
	model.controller.select([target.id])
	startLabel(context, target)
}

function onContextmenu(context: FlowEditContext, event: MouseEvent): void {
	const { state, model } = context.env
	if (!state.isActive.value || state.isCompact.value) return
	const target = refOf(event.target)
	consume(event)
	if (target && !model.selection.value.includes(target.id)) model.controller.select([target.id])
	state.menu.value = { x: event.clientX, y: event.clientY, target }
}

function onKeyup(context: FlowEditContext, event: KeyboardEvent): void {
	if (event.key === ' ') context.env.state.isHandHeld.value = false
}

export function useEditPointer(context: FlowEditContext): void {
	const keys = createKeyMap(context)
	const listeners: [string, (event: never) => void][] = [
		['pointerdown', (event: PointerEvent) => onPointerdown(context, event)],
		['click', (event: MouseEvent) => onClick(context, event)],
		['dblclick', (event: MouseEvent) => onDblclick(context, event)],
		['contextmenu', (event: MouseEvent) => onContextmenu(context, event)],
		['keydown', (event: KeyboardEvent) => handleKeydown(context, keys, event)],
		['keyup', (event: KeyboardEvent) => onKeyup(context, event)],
	]
	const stop = watch(
		context.env.element,
		(element, _, onCleanup) => {
			if (!element) return
			for (const [name, handler] of listeners) element.addEventListener(name, handler as (event: Event) => void, true)
			onCleanup(() =>
				listeners.forEach(([name, handler]) => element.removeEventListener(name, handler as (event: Event) => void, true)),
			)
		},
		{ immediate: true, flush: 'post' },
	)
	onScopeDispose(stop)
}
