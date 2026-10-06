import { toViewportPoint } from './viewGeometry'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { ImageMapView } from '../../types/internal/imageMapModel.types'
import type { GestureOptions, GestureView, PointerStart, ScreenPoint } from '../../types/internal/imageMapInternal.types'

const DRAG_THRESHOLD = 4
const WHEEL_SENSITIVITY = 0.002
const HINT_DURATION = 1500
const WHEEL_LINE = 16
const WHEEL_PAGE = 400
const WHEEL_FACTOR_LIMIT = 4

function localPoint(event: { clientX: number; clientY: number }, element: HTMLElement): ScreenPoint {
	return toViewportPoint({ x: event.clientX, y: event.clientY }, element.getBoundingClientRect(), {
		width: element.clientWidth,
		height: element.clientHeight,
	})
}

function wheelFactor(event: WheelEvent): number {
	const unit = [1, WHEEL_LINE, WHEEL_PAGE][event.deltaMode] ?? 1
	return Math.min(Math.max(Math.exp(-event.deltaY * unit * WHEEL_SENSITIVITY), 1 / WHEEL_FACTOR_LIMIT), WHEEL_FACTOR_LIMIT)
}

function pinchMetrics(pointers: Map<number, ScreenPoint>): { distance: number; center: ScreenPoint } {
	const [first, second = first] = [...pointers.values()]
	return {
		distance: Math.hypot(second.x - first.x, second.y - first.y),
		center: { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 },
	}
}

function useWheel(options: GestureOptions, zoom: GestureView) {
	const isHintVisible = ref(false)
	let hintTimer: ReturnType<typeof setTimeout> | undefined

	function handleWheel(event: WheelEvent): void {
		const viewport = options.viewportRef.value
		const mode = options.getWheelMode()
		if (!viewport || mode === 'none') return
		if (mode === 'ctrl' && !event.ctrlKey && !event.metaKey) {
			isHintVisible.value = true
			clearTimeout(hintTimer)
			hintTimer = setTimeout(() => (isHintVisible.value = false), HINT_DURATION)
			return
		}
		event.preventDefault()
		isHintVisible.value = false
		options.onInteract()
		zoom.zoomBy(wheelFactor(event), localPoint(event, viewport), false)
	}

	onMounted(() => options.viewportRef.value?.addEventListener('wheel', handleWheel, { passive: false }))
	onBeforeUnmount(() => {
		options.viewportRef.value?.removeEventListener('wheel', handleWheel)
		clearTimeout(hintTimer)
	})

	return isHintVisible
}

function snapshot(pointers: Map<number, ScreenPoint>, view: ImageMapView): PointerStart {
	return { pointers: new Map(pointers), view: { ...view }, ...pinchMetrics(pointers) }
}

function movedView(start: PointerStart, pointers: Map<number, ScreenPoint>, limitScale: (scale: number) => number): ImageMapView {
	const { distance, center } = pinchMetrics(pointers)
	const wanted = start.distance && pointers.size > 1 ? distance / start.distance : 1
	const scale = limitScale(start.view.scale * wanted)
	const ratio = scale / start.view.scale
	const anchorX = center.x - (start.center.x - start.view.x) * ratio
	const anchorY = center.y - (start.center.y - start.view.y) * ratio
	return { scale, x: anchorX, y: anchorY }
}

export function useImageMapGestures(options: GestureOptions, zoom: GestureView) {
	const pointers = new Map<number, ScreenPoint>()
	const isDragging = ref(false)
	let start: PointerStart | null = null
	let wasDragged = false

	function handlePointerDown(event: PointerEvent): void {
		const viewport = options.viewportRef.value
		if (!viewport || (event.pointerType === 'mouse' && event.button !== 0)) return
		pointers.set(event.pointerId, localPoint(event, viewport))
		start = snapshot(pointers, zoom.view.value)
		wasDragged = false
	}

	function handlePointerMove(event: PointerEvent): void {
		const viewport = options.viewportRef.value
		if (!viewport || !start || !pointers.has(event.pointerId)) return
		pointers.set(event.pointerId, localPoint(event, viewport))
		const next = movedView(start, pointers, zoom.limitScale)
		if (!wasDragged && Math.hypot(next.x - start.view.x, next.y - start.view.y) < DRAG_THRESHOLD && pointers.size < 2) return
		if (!wasDragged) viewport.setPointerCapture?.(event.pointerId)
		wasDragged = true
		isDragging.value = true
		options.onInteract()
		zoom.setView(next, false)
	}

	function handlePointerUp(event: PointerEvent): void {
		pointers.delete(event.pointerId)
		start = pointers.size ? snapshot(pointers, zoom.view.value) : null
		if (!pointers.size) isDragging.value = false
	}

	return {
		isDragging,
		isWheelHintVisible: useWheel(options, zoom),
		handlePointerDown,
		handlePointerMove,
		handlePointerUp,
		consumeDrag(): boolean {
			const dragged = wasDragged
			wasDragged = false
			return dragged
		},
	}
}
