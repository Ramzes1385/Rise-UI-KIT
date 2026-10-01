/** Composable: обработка свайпа и перетаскивания (touch + mouse) */
import { onBeforeUnmount, ref, type Ref } from 'vue'
import type {
	SwipeClickGuard,
	SwipeDelta,
	SwipeDragSession,
	SwipeMouseListeners,
	SwipeOffsetScheduler,
	SwipePoint,
	UseSwipeOptions,
} from './types/useSwipe.types'

/** Смещение указателя (px), после которого отпускание мыши считается перетаскиванием, а не кликом */
const CLICK_SLOP = 5

/** Порог свайпа по умолчанию, px */
const DEFAULT_THRESHOLD = 50

/** Координаты касания или указателя мыши */
function toPoint(source: { clientX: number; clientY: number }): SwipePoint {
	return { x: source.clientX, y: source.clientY }
}

/** Смещение от начала жеста по осям: `main` — вдоль направления свайпа, `cross` — поперёк */
function toDelta(start: SwipePoint, point: SwipePoint, isVertical: boolean): SwipeDelta {
	const x = point.x - start.x
	const y = point.y - start.y
	return { x, y, main: isVertical ? y : x, cross: isVertical ? x : y }
}

/** Определить направление свайпа и вызвать callback: смещение вдоль оси больше поперечного и больше порога */
function resolveSwipe(delta: SwipeDelta, options: UseSwipeOptions): void {
	const threshold = options.threshold ?? DEFAULT_THRESHOLD
	if (Math.abs(delta.main) <= Math.abs(delta.cross) || Math.abs(delta.main) <= threshold) return
	if (delta.main < 0) options.onSwipeNext?.()
	else options.onSwipePrev?.()
}

/**
 * Обновление смещения не чаще кадра (RAF). Значение читается `getOffset` в момент кадра; пока кадр запланирован,
 * новые запросы не ставятся
 */
function createOffsetScheduler(dragOffset: Ref<number>, options: UseSwipeOptions): SwipeOffsetScheduler {
	let rafId: number | null = null
	return {
		schedule: getOffset => {
			if (rafId !== null) return
			rafId = requestAnimationFrame(() => {
				const offset = getOffset()
				dragOffset.value = offset
				options.onDragOffset?.(offset)
				rafId = null
			})
		},
		cancel: () => {
			if (rafId === null) return
			cancelAnimationFrame(rafId)
			rafId = null
		},
	}
}

/**
 * Click, завершающий перетаскивание мышью, гасится в фазе захвата, чтобы не активировать содержимое слайда
 * (зум изображения, ссылку, кнопку). Браузер отправляет click в той же задаче, что и mouseup, поэтому признак живёт
 * до конца текущей задачи: если click не последовал (отпустили вне элемента), он не погасит следующий,
 * не связанный с перетаскиванием click (например, Enter на кнопке внутри слайда)
 */
function createClickGuard(): SwipeClickGuard {
	let isClickAfterDrag = false
	return {
		reset: () => {
			isClickAfterDrag = false
		},
		mark: wasDrag => {
			isClickAfterDrag = wasDrag
			if (!wasDrag) return
			setTimeout(() => {
				isClickAfterDrag = false
			}, 0)
		},
		onClickCapture: event => {
			if (!isClickAfterDrag) return
			isClickAfterDrag = false
			event.stopPropagation()
			event.preventDefault()
		},
	}
}

/** Слушатели mousemove и mouseup на document на время перетаскивания мышью */
function createMouseListeners(): SwipeMouseListeners {
	let activeMouseMove: ((ev: MouseEvent) => void) | null = null
	let activeMouseUp: ((ev: MouseEvent) => void) | null = null
	return {
		add: (handleMouseMove, handleMouseUp) => {
			activeMouseMove = handleMouseMove
			activeMouseUp = handleMouseUp
			document.addEventListener('mousemove', handleMouseMove)
			document.addEventListener('mouseup', handleMouseUp)
		},
		remove: () => {
			if (activeMouseMove) document.removeEventListener('mousemove', activeMouseMove)
			if (activeMouseUp) document.removeEventListener('mouseup', activeMouseUp)
			activeMouseMove = null
			activeMouseUp = null
		},
	}
}

/**
 * Состояние жеста: начало, смещение во время движения (не чаще кадра) и отпускание — итоговая дельта для snap-решения,
 * свайп по порогу, сброс смещения
 */
function createDragSession(options: UseSwipeOptions): SwipeDragSession {
	const isDragging = ref(false)
	const dragOffset = ref(0)
	const start: SwipePoint = { x: 0, y: 0 }
	const scheduler = createOffsetScheduler(dragOffset, options)
	return {
		isDragging,
		dragOffset,
		begin: point => {
			start.x = point.x
			start.y = point.y
			isDragging.value = true
			dragOffset.value = 0
		},
		offsetAt: point => toDelta(start, point, options.isVertical()).main,
		scheduleOffset: scheduler.schedule,
		cancel: scheduler.cancel,
		finish: point => {
			scheduler.cancel()
			const delta = toDelta(start, point, options.isVertical())
			options.onDragEnd?.({ main: delta.main, cross: delta.cross })
			resolveSwipe(delta, options)
			isDragging.value = false
			dragOffset.value = 0
			options.onDragOffset?.(0)
			return delta
		},
	}
}

/**
 * Composable для обработки свайпа и перетаскивания (touch + mouse).
 * Поддерживает горизонтальный и вертикальный режимы, RAF-оптимизацию.
 *
 * @example
 * ```ts
 * const { isDragging, dragOffset, onTouchStart, onTouchMove, onTouchEnd, onDragStart, onClickCapture } = useSwipe({
 *   isVertical: () => props.isVertical,
 *   threshold: 50,
 *   onSwipeNext: goNext,
 *   onSwipePrev: goPrev,
 *   onDragOffset: (offset) => { dragOffset.value = offset },
 * })
 * ```
 */
function useSwipe(options: UseSwipeOptions) {
	const session = createDragSession(options)
	const { isDragging } = session
	const clickGuard = createClickGuard()
	const mouseListeners = createMouseListeners()

	function onTouchStart(event: TouchEvent): void {
		session.begin(toPoint(event.touches[0]))
	}

	function onTouchMove(event: TouchEvent): void {
		if (!isDragging.value) return
		const offset = session.offsetAt(toPoint(event.touches[0]))
		session.scheduleOffset(() => offset)
	}

	function onTouchEnd(event: TouchEvent): void {
		if (isDragging.value) session.finish(toPoint(event.changedTouches[0]))
	}

	function onDragStart(event: MouseEvent): void {
		session.begin(toPoint(event))
		clickGuard.reset()
		let pendingOffset = 0
		mouseListeners.add(
			ev => {
				if (!isDragging.value) return
				pendingOffset = session.offsetAt(toPoint(ev))
				session.scheduleOffset(() => pendingOffset)
			},
			ev => {
				if (!isDragging.value) return
				const delta = session.finish(toPoint(ev))
				mouseListeners.remove()
				clickGuard.mark(Math.abs(delta.x) > CLICK_SLOP || Math.abs(delta.y) > CLICK_SLOP)
			},
		)
	}

	onBeforeUnmount(() => {
		session.cancel()
		mouseListeners.remove()
	})

	return {
		isDragging,
		dragOffset: session.dragOffset,
		onTouchStart,
		onTouchMove,
		onTouchEnd,
		onDragStart,
		onClickCapture: clickGuard.onClickCapture,
	}
}

export { useSwipe }
