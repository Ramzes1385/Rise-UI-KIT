import type { Ref } from 'vue'
import { nextTick, onBeforeUnmount, watch } from 'vue'
import type { FlowElementRef } from '../../types/data/flowReview.types'
import { ARROW_DIRECTIONS, isPrintable, nearestInDirection, typeaheadMatch } from './flowFocus'
import type {
	FlowFocusApi,
	FlowFrameState,
	FlowModelInternal,
	FlowPickApi,
	FlowViewState,
} from '../../types/internal/core/flowRenderInternal.types'

const TYPEAHEAD_MS = 700

function entityOf(model: FlowModelInternal, id: string): FlowElementRef['entity'] | null {
	const graph = model.graph.value
	if (graph.nodes.has(id)) return 'node'
	if (graph.edges.has(id)) return 'edge'
	return graph.groups.has(id) ? 'group' : null
}

function stepAlong(model: FlowModelInternal, id: string, direction: 1 | -1): string | null {
	const graph = model.graph.value
	const edge = graph.edges.get(id)
	if (edge) return direction === 1 ? edge.target : edge.source
	const links = direction === 1 ? graph.outgoing(id) : graph.incoming(id)
	return links[0]?.id ?? null
}

function focusElement(frame: FlowFrameState, id: string): void {
	const target = frame.element.value?.querySelector<HTMLElement>(`[data-flow-id="${id.replace(/["\\]/g, '\\$&')}"]`)
	if (target && target !== document.activeElement) target.focus({ preventScroll: true })
}

function arrowTarget(model: FlowModelInternal, current: string | null, key: string): string | null {
	const rects = model.layout.value.nodes
	const candidates = model.data.value.nodes.flatMap(node =>
		rects[node.id] && node.id !== current ? [{ id: node.id, rect: rects[node.id] }] : [],
	)
	const from = current ? rects[current] : undefined
	return from ? nearestInDirection(from, candidates, ARROW_DIRECTIONS[key]) : (candidates[0]?.id ?? null)
}

function createTypeahead(model: FlowModelInternal, focused: Ref<string | null>, move: (id: string | null) => void) {
	let buffer = ''
	let timer: ReturnType<typeof setTimeout> | undefined
	return {
		type(key: string): void {
			buffer += key
			clearTimeout(timer)
			timer = setTimeout(() => (buffer = ''), TYPEAHEAD_MS)
			const items = model.data.value.nodes.map(node => ({ id: node.id, label: node.label }))
			const found = typeaheadMatch(items, buffer, focused.value)
			if (found) move(found)
		},
		stop: () => clearTimeout(timer),
	}
}

export function useFlowFocus(
	model: FlowModelInternal,
	parts: { frame: FlowFrameState; view: FlowViewState; focused: Ref<string | null> },
	actions: Pick<FlowPickApi, 'pick' | 'clear'>,
): FlowFocusApi {
	const { frame, view, focused } = parts

	function move(id: string | null): void {
		focused.value = id
		const rect = id ? (model.layout.value.nodes[id] ?? model.layout.value.groups[id]) : undefined
		if (rect) view.reveal(rect)
	}

	const typeahead = createTypeahead(model, focused, move)
	const along = (direction: 1 | -1) => () => focused.value && move(stepAlong(model, focused.value, direction) ?? focused.value)
	const keys: Record<string, (event: KeyboardEvent) => void> = {
		']': along(1),
		'[': along(-1),
		Home: () => move(model.data.value.nodes[0]?.id ?? null),
		End: () => move(model.data.value.nodes.at(-1)?.id ?? null),
		Enter: () => focused.value && actions.pick({ entity: entityOf(model, focused.value) ?? 'node', id: focused.value }),
		Escape: () => actions.clear(),
	}

	function onKeydown(event: KeyboardEvent): void {
		const isArrow = event.key in ARROW_DIRECTIONS
		const handler = keys[event.key] ?? (isPrintable(event) ? () => typeahead.type(event.key) : null)
		if (!isArrow && !handler) return
		event.preventDefault()
		if (isArrow) move(arrowTarget(model, focused.value, event.key) ?? focused.value)
		else handler?.(event)
	}

	function onFocusin(event: FocusEvent): void {
		const id = (event.target as Element).closest('[data-flow-id]')?.getAttribute('data-flow-id')
		if (id && id !== focused.value) focused.value = id
	}

	function onFocusout(event: FocusEvent): void {
		if (!frame.element.value?.contains(event.relatedTarget as Node | null)) model.events.emit('focus-change', null)
	}

	watch(focused, async id => {
		if (!id) return
		const entity = entityOf(model, id)
		if (entity) model.events.emit('focus-change', { entity, id })
		await nextTick()
		focusElement(frame, id)
	})

	onBeforeUnmount(typeahead.stop)

	const tabIndexOf = (id: string): 0 | -1 => {
		const current = focused.value && model.graph.value.nodes.has(focused.value) ? focused.value : model.data.value.nodes[0]?.id
		return id === current ? 0 : -1
	}
	return { focused, move, onKeydown, onFocusin, onFocusout, tabIndexOf }
}
