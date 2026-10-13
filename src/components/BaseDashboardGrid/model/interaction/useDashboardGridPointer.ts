import { shallowRef } from 'vue'
import { moveItem, resizeItem, layoutsEqual } from '../layout/dashboardLayout'
import { cellAt, draggedRect, itemRect, sizeAt } from '../layout/dashboardGeometry'
import type {
	DashboardChangeAction,
	DashboardDragRect,
	DashboardGridState,
	DashboardLayout,
	DashboardLayoutItem,
	DashboardPointerDrag,
	DashboardRect,
} from '../../types/BaseDashboardGrid.types'

const INTERACTIVE_SELECTOR = 'a[href], button, input, select, textarea, [contenteditable], [data-no-drag]'

function canStart(event: PointerEvent, item: DashboardLayoutItem, mode: DashboardChangeAction): boolean {
	const target = event.target as Element
	if (item.isStatic || (event.pointerType === 'mouse' && event.button !== 0)) return false
	if (mode === 'resize') return true
	const isHandle = target.closest('[data-handle]') !== null
	if (event.pointerType === 'touch') return isHandle
	return isHandle || target.closest(INTERACTIVE_SELECTOR) === null
}

function startDrag(event: PointerEvent, item: DashboardLayoutItem, mode: DashboardChangeAction): DashboardPointerDrag {
	return {
		id: item.id,
		mode,
		pointerId: event.pointerId,
		startX: event.clientX,
		startY: event.clientY,
		origin: item,
		base: [],
	}
}

function previewLayout(drag: DashboardPointerDrag, rect: DashboardRect, state: DashboardGridState): DashboardLayout {
	const metrics = state.metrics.value
	return drag.mode === 'move'
		? moveItem(drag.base, { id: drag.id, ...cellAt(rect, metrics) }, state.rules())
		: resizeItem(drag.base, { id: drag.id, ...sizeAt(rect, metrics) }, state.rules())
}

export function useDashboardGridPointer(state: DashboardGridState) {
	const dragRect = shallowRef<DashboardDragRect | null>(null)
	let drag: DashboardPointerDrag | null = null

	function reset(): void {
		drag = null
		dragRect.value = null
		state.draft.value = null
	}

	function isOwnEvent(event: PointerEvent): boolean {
		return drag !== null && event.pointerId === drag.pointerId
	}

	return {
		dragRect,
		cancel: reset,
		handlePointerDown(event: PointerEvent, item: DashboardLayoutItem, mode: DashboardChangeAction): void {
			if (drag || !state.isInteractive.value || !canStart(event, item, mode)) return
			;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
			drag = { ...startDrag(event, item, mode), base: state.layout.value }
			dragRect.value = { id: item.id, rect: itemRect(item, state.metrics.value) }
		},
		handlePointerMove(event: PointerEvent): void {
			if (!drag || !isOwnEvent(event)) return
			const rect = draggedRect(drag, { dx: event.clientX - drag.startX, dy: event.clientY - drag.startY }, state.metrics.value)
			dragRect.value = { id: drag.id, rect }
			state.draft.value = previewLayout(drag, rect, state)
		},
		handlePointerUp(event: PointerEvent): void {
			if (!drag || !isOwnEvent(event)) return
			const { id, mode, base } = drag
			const next = state.draft.value
			drag = null
			dragRect.value = null
			if (next && !layoutsEqual(next, base)) state.commit(next, id, mode)
			else state.draft.value = null
		},
		handlePointerCancel(event: PointerEvent): void {
			if (isOwnEvent(event)) reset()
		},
	}
}
