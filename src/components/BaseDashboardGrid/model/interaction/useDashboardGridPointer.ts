import { shallowRef } from 'vue'
import { useDashboardGridAutoScroll } from './useDashboardGridAutoScroll'
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
	DashboardScrollDelta,
	DashboardScrollPoint,
} from '../../types/BaseDashboardGrid.types'

const DRAG_THRESHOLD = 3
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

function useDragPreview(state: DashboardGridState) {
	const dragRect = shallowRef<DashboardDragRect | null>(null)
	let drag: DashboardPointerDrag | null = null
	let point: DashboardScrollPoint = { x: 0, y: 0 }
	let scrolled: DashboardScrollDelta = { dx: 0, dy: 0 }
	let isMoved = false

	function update(current: DashboardPointerDrag): void {
		const delta = { dx: point.x - current.startX + scrolled.dx, dy: point.y - current.startY + scrolled.dy }
		const rect = draggedRect(current, delta, state.metrics.value)
		dragRect.value = { id: current.id, rect }
		state.draft.value = previewLayout(current, rect, state)
	}

	return {
		dragRect,
		get current(): DashboardPointerDrag | null {
			return drag
		},
		reachesThreshold(next: DashboardScrollPoint): boolean {
			const current = drag as DashboardPointerDrag
			isMoved ||= Math.hypot(next.x - current.startX, next.y - current.startY) >= DRAG_THRESHOLD
			return isMoved
		},
		begin(next: DashboardPointerDrag, start: DashboardScrollPoint, item: DashboardLayoutItem): void {
			drag = next
			isMoved = false
			point = start
			scrolled = { dx: 0, dy: 0 }
			dragRect.value = { id: item.id, rect: itemRect(item, state.metrics.value) }
		},
		move(next: DashboardScrollPoint): void {
			point = next
			update(drag as DashboardPointerDrag)
		},
		scroll(delta: DashboardScrollDelta): void {
			scrolled = { dx: scrolled.dx + delta.dx, dy: scrolled.dy + delta.dy }
			update(drag as DashboardPointerDrag)
		},
		end(): void {
			drag = null
			dragRect.value = null
		},
	}
}

export function useDashboardGridPointer(state: DashboardGridState) {
	const preview = useDragPreview(state)
	const autoScroll = useDashboardGridAutoScroll(preview.scroll)

	function reset(): void {
		autoScroll.stop()
		preview.end()
		state.draft.value = null
	}

	function isOwnEvent(event: PointerEvent): boolean {
		return preview.current !== null && event.pointerId === preview.current.pointerId
	}

	return {
		dragRect: preview.dragRect,
		cancel: reset,
		handlePointerDown(event: PointerEvent, item: DashboardLayoutItem, mode: DashboardChangeAction): void {
			if (preview.current || !state.isInteractive.value || !canStart(event, item, mode)) return
			;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
			const point = { x: event.clientX, y: event.clientY }
			preview.begin({ ...startDrag(event, item, mode), base: state.layout.value }, point, item)
		},
		handlePointerMove(event: PointerEvent): void {
			if (!isOwnEvent(event)) return
			const point = { x: event.clientX, y: event.clientY }
			if (!preview.reachesThreshold(point)) return
			if (!autoScroll.isRunning) autoScroll.start(state.rootRef.value, point)
			autoScroll.move(point)
			preview.move(point)
		},
		handlePointerUp(event: PointerEvent): void {
			if (!isOwnEvent(event)) return
			const { id, mode, base } = preview.current as DashboardPointerDrag
			const next = state.draft.value
			autoScroll.stop()
			preview.end()
			if (next && !layoutsEqual(next, base)) state.commit(next, id, mode)
			else state.draft.value = null
		},
		handlePointerCancel(event: PointerEvent): void {
			if (isOwnEvent(event)) reset()
		},
	}
}
