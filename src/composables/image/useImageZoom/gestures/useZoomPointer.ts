/** Composable: касания и перетаскивание в зуме — сдвиг пальцем или мышью, масштаб щипком двумя пальцами */
import { ref } from 'vue'
import type { DragContext, GestureState, PointerMove, UseZoomPointerOptions, ZoomPoint, ZoomPointerAreas } from '../types/useImageZoom.types'

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

/** Описание: области, на которых нажаты указатели; захват включается позже, после порога сдвига или при щипке */
function createAreas(): ZoomPointerAreas {
	const areas = new Map<number, Element>()
	return {
		remember: (pointerId: number, area: Element): void => void areas.set(pointerId, area),
		forget: (pointerId: number): void => void areas.delete(pointerId),
		clear: (): void => areas.clear(),
		captureAll: (): void => areas.forEach((area, pointerId) => capturePointer(area, pointerId)),
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

/** Описание: признак перетаскивания читается один раз: следующий клик после жеста гасится, дальнейшие — нет */
function takeDrag(gesture: GestureState): boolean {
	const wasDragged = gesture.isDragged
	gesture.isDragged = false
	return wasDragged
}

/** Описание: сдвиг одним указателем; дальше порога жест — перетаскивание, и с этого момента указатель захватывается */
function dragStep(context: DragContext, previous: ZoomPoint, move: PointerMove): void {
	const { options, pointers, areas, gesture } = context
	pointers.set(move.pointerId, move.next)
	gesture.travel += distance(previous, move.next)
	if (!gesture.isDragged && gesture.travel > DRAG_THRESHOLD_PX) {
		gesture.isDragged = true
		areas.captureAll()
	}
	options.panBy(move.next.x - previous.x, move.next.y - previous.y)
}

/**
 * Описание: жесты зума по pointer events — один указатель двигает увеличенное изображение, два (щипок) меняют масштаб вокруг
 * середины между пальцами. Сдвиг дальше порога гасит следующий клик (`consumeDrag`), чтобы перетаскивание не закрывало окно.
 * Указатель захватывается только после порога сдвига или при щипке: Chromium направляет `click` захватившему элементу,
 * и обычный клик по изображению стал бы кликом по фону (закрыл бы окно).
 */
function useZoomPointer(options: UseZoomPointerOptions) {
	const pointers = new Map<number, ZoomPoint>()
	const areas = createAreas()
	const isPanning = ref(false)
	const gesture: GestureState = { travel: 0, isDragged: false }
	const context = { options, pointers, areas, gesture }

	function prepareGesture(): void {
		if (pointers.size === 0) Object.assign(gesture, { travel: 0, isDragged: false })
	}

	function handlePointerDown(event: PointerEvent): void {
		if (event.pointerType === 'mouse' && event.button !== 0) return
		prepareGesture()
		pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
		areas.remember(event.pointerId, event.currentTarget as Element)
		isPanning.value = pointers.size > 1 || options.currentScale.value > 1
	}

	function handlePointerMove(event: PointerEvent): void {
		const previous = pointers.get(event.pointerId)
		if (!previous) return
		if (event.pointerType === 'mouse' && event.buttons === 0) return handlePointerEnd(event)
		const next = { x: event.clientX, y: event.clientY }
		if (pointers.size === 2) {
			pinchStep(options, pointers, { pointerId: event.pointerId, next })
			gesture.isDragged = true
			areas.captureAll()
		} else if (pointers.size === 1 && options.currentScale.value > 1) dragStep(context, previous, { pointerId: event.pointerId, next })
		else pointers.set(event.pointerId, next)
	}

	function handlePointerEnd(event: PointerEvent): void {
		pointers.delete(event.pointerId)
		areas.forget(event.pointerId)
		if (pointers.size === 0) isPanning.value = false
	}

	return {
		isPanning,
		handlePointerDown,
		handlePointerMove,
		handlePointerEnd,
		prepareGesture,
		consumeDrag: (): boolean => takeDrag(gesture),
		resetPointers: (): void => {
			pointers.clear()
			areas.clear()
			isPanning.value = false
			gesture.isDragged = false
		},
	}
}

export { useZoomPointer }
