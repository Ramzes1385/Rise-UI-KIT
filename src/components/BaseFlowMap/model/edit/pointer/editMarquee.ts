import { trackPointer } from './editTrack'
import { intersects, rectBetween, toCanvas } from '../geometry/editGeometry'
import type { FlowEditContext } from '../../../types/internal/edit/flowEditApi.types'

export function startMarquee(context: FlowEditContext, event: PointerEvent): void {
	const { model, state } = context.env
	const origin = toCanvas(event, context.view())
	const base = event.shiftKey ? [...model.selection.value] : []
	const isGroup = state.tool.value === 'group'
	trackPointer(event, {
		onMove: next => {
			const rect = rectBetween(origin, toCanvas(next, context.view()))
			state.marquee.value = rect
			const hit = Object.entries(model.layout.value.nodes)
				.filter(([, frame]) => intersects(rect, frame))
				.map(([id]) => id)
			model.controller.select([...new Set([...base, ...hit])])
		},
		onEnd: (_, isMoved) => {
			state.marquee.value = null
			context.flags.isClickSuppressed = isMoved
			if (!isMoved && !event.shiftKey) context.actions.clearSelection()
			if (isMoved && isGroup) void context.actions.groupSelection()
			if (isGroup) state.tool.value = 'select'
		},
	})
}

export function startPan(context: FlowEditContext, event: PointerEvent): void {
	const { map } = context.env
	let last = { x: event.clientX, y: event.clientY }
	trackPointer(event, {
		onMove: next => {
			const { viewport } = map
			map.setViewport({ ...viewport.value, x: viewport.value.x + next.clientX - last.x, y: viewport.value.y + next.clientY - last.y })
			last = { x: next.clientX, y: next.clientY }
		},
		onEnd: (_, isMoved) => {
			context.flags.isClickSuppressed = isMoved
		},
	})
}
