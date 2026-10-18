import { onBeforeUnmount } from 'vue'
import { zoomAt } from './viewGeometry'
import type { FlowPoint } from '../../types/data/flowData.types'
import type { BaseFlowMapProps } from '../../types/BaseFlowMap.types'
import type { FlowFrameState, FlowGestureHandlers, FlowViewState } from '../../types/internal/core/flowRenderInternal.types'

const WHEEL_STEP = 0.0015
const HINT_MS = 1600

function distance(first: FlowPoint, second: FlowPoint): number {
	return Math.hypot(first.x - second.x, first.y - second.y)
}

function middle(first: FlowPoint, second: FlowPoint): FlowPoint {
	return { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 }
}

function drag(view: FlowViewState, pointers: Map<number, FlowPoint>, moved: { id: number; from: FlowPoint; to: FlowPoint }): void {
	const current = view.viewport.value
	if (pointers.size === 1) {
		view.setViewport({ ...current, x: current.x + moved.to.x - moved.from.x, y: current.y + moved.to.y - moved.from.y })
		return
	}
	const other = [...pointers.entries()].find(([id]) => id !== moved.id)?.[1]
	const before = other ? distance(moved.from, other) : 0
	if (other && before > 0) {
		const anchor = middle(moved.to, other)
		view.setViewport(zoomAt(current, { factor: distance(moved.to, other) / before, anchor }, view.limits()))
	}
}

export function useFlowGestures(
	props: Pick<BaseFlowMapProps, 'wheelZoom'>,
	frame: FlowFrameState,
	view: FlowViewState,
): FlowGestureHandlers {
	const pointers = new Map<number, FlowPoint>()
	let hintTimer: ReturnType<typeof setTimeout> | undefined

	function local(event: { clientX: number; clientY: number }): FlowPoint {
		const box = frame.element.value?.getBoundingClientRect()
		return { x: event.clientX - (box?.left ?? 0), y: event.clientY - (box?.top ?? 0) }
	}

	function onPointerdown(event: PointerEvent): void {
		if (event.button > 0 || (event.target as Element).closest('[data-flow-id]')) return
		pointers.set(event.pointerId, local(event))
		frame.element.value?.setPointerCapture?.(event.pointerId)
	}

	function onPointermove(event: PointerEvent): void {
		const from = pointers.get(event.pointerId)
		if (!from) return
		const to = local(event)
		pointers.set(event.pointerId, to)
		drag(view, pointers, { id: event.pointerId, from, to })
	}

	function onPointerup(event: PointerEvent): void {
		pointers.delete(event.pointerId)
	}

	function showHint(): void {
		view.hint.value = true
		clearTimeout(hintTimer)
		hintTimer = setTimeout(() => (view.hint.value = false), HINT_MS)
	}

	function onWheel(event: WheelEvent): void {
		const mode = props.wheelZoom ?? 'ctrl'
		if (mode === 'none') return
		if (mode === 'ctrl' && !event.ctrlKey && !event.metaKey) return showHint()
		event.preventDefault()
		view.setViewport(zoomAt(view.viewport.value, { factor: Math.exp(-event.deltaY * WHEEL_STEP), anchor: local(event) }, view.limits()))
	}

	onBeforeUnmount(() => clearTimeout(hintTimer))
	return { onPointerdown, onPointermove, onPointerup, onPointercancel: onPointerup, onWheel }
}
