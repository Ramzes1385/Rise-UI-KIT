/** Composable: касания и перетаскивание в зуме — сдвиг пальцем или мышью, масштаб щипком двумя пальцами */
import { ref } from 'vue'
import type { GestureState, PointerMove, UseZoomPointerOptions, ZoomPoint } from '../types/useImageZoom.types'

/** Сдвиг указателя, после которого жест считается перетаскиванием, а не кликом, px */
const DRAG_THRESHOLD_PX = 5

/** Описание: расстояние между двумя точками */
function distance(a: ZoomPoint, b: ZoomPoint): number {
	return Math.hypot(a.x - b.x, a.y - b.y)
}

/** Описание: середина между двумя точками */
function middle(a: ZoomPoint, b: ZoomPoint): ZoomPoint {
	return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

/** Описание: захватывает указатель за область зума, чтобы жест не прерывался за её краем; синтетическому указателю захват недоступен */
function capturePointer(target: Element, pointerId: number): void {
	try {
		target.setPointerCapture(pointerId)
	} catch {
		return
	}
}

/** Описание: щипок — масштаб по изменению расстояния между пальцами вокруг прежней середины и сдвиг на смещение середины */
function pinchStep(options: UseZoomPointerOptions, pointers: Map<number, ZoomPoint>, move: PointerMove): void {
	const [beforeA, beforeB] = [...pointers.values()] as [ZoomPoint, ZoomPoint]
	pointers.set(move.pointerId, move.next)
	const [afterA, afterB] = [...pointers.values()] as [ZoomPoint, ZoomPoint]
	const baseDistance = distance(beforeA, beforeB)
	const ratio = baseDistance > 0 ? distance(afterA, afterB) / baseDistance : 1
	const before = middle(beforeA, beforeB)
	const after = middle(afterA, afterB)
	const center = options.getImageCenter() ?? before
	options.zoomAround(options.currentScale.value * ratio, { x: before.x - center.x, y: before.y - center.y })
	options.panBy(after.x - before.x, after.y - before.y)
}

/**
 * Описание: жесты зума по pointer events — один указатель двигает увеличенное изображение, два (щипок) меняют масштаб вокруг
 * середины между пальцами. Сдвиг дальше порога гасит следующий клик (`consumeDrag`), чтобы перетаскивание не закрывало окно.
 */
function useZoomPointer(options: UseZoomPointerOptions) {
	const pointers = new Map<number, ZoomPoint>()
	const isPanning = ref(false)
	const gesture: GestureState = { travel: 0, isDragged: false }

	function handlePointerDown(event: PointerEvent): void {
		if (event.pointerType === 'mouse' && event.button !== 0) return
		if (pointers.size === 0) Object.assign(gesture, { travel: 0, isDragged: false })
		pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
		capturePointer(event.currentTarget as Element, event.pointerId)
		isPanning.value = pointers.size > 1 || options.currentScale.value > 1
	}

	function drag(pointerId: number, previous: ZoomPoint, next: ZoomPoint): void {
		pointers.set(pointerId, next)
		gesture.travel += distance(previous, next)
		gesture.isDragged ||= gesture.travel > DRAG_THRESHOLD_PX
		options.panBy(next.x - previous.x, next.y - previous.y)
	}

	function handlePointerMove(event: PointerEvent): void {
		const previous = pointers.get(event.pointerId)
		if (!previous) return
		const next = { x: event.clientX, y: event.clientY }
		if (pointers.size === 2) {
			pinchStep(options, pointers, { pointerId: event.pointerId, next })
			gesture.isDragged = true
		} else if (pointers.size === 1 && options.currentScale.value > 1) drag(event.pointerId, previous, next)
		else pointers.set(event.pointerId, next)
	}

	function handlePointerEnd(event: PointerEvent): void {
		pointers.delete(event.pointerId)
		if (pointers.size === 0) isPanning.value = false
	}

	return {
		isPanning,
		handlePointerDown,
		handlePointerMove,
		handlePointerEnd,
		consumeDrag: (): boolean => {
			const wasDragged = gesture.isDragged
			gesture.isDragged = false
			return wasDragged
		},
		resetPointers: (): void => {
			pointers.clear()
			isPanning.value = false
			gesture.isDragged = false
		},
	}
}

export { useZoomPointer }
