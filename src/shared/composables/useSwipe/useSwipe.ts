import type { UseSwipeOptions } from './useSwipe.types'

import { onBeforeUnmount, ref } from 'vue'

/**
 * Composable для обработки свайпа и перетаскивания (touch + mouse).
 * Поддерживает горизонтальный и вертикальный режимы, RAF-оптимизацию.
 *
 * @example
 * ```ts
 * const { isDragging, dragOffset, onTouchStart, onTouchMove, onTouchEnd, onDragStart } = useSwipe({
 *   isVertical: () => props.isVertical,
 *   threshold: 50,
 *   onSwipeNext: goNext,
 *   onSwipePrev: goPrev,
 *   onDragOffset: (offset) => { dragOffset.value = offset },
 * })
 * ```
 */
function useSwipe(options: UseSwipeOptions) {
	const threshold = options.threshold ?? 50
	const isDragging = ref(false)
	const dragOffset = ref(0)

	let dragStartX = 0
	let dragStartY = 0
	let rafId: number | null = null

	/** Определить направление свайпа и вызвать callback */
	function resolveSwipe(deltaMain: number, deltaCross: number): void {
		if (Math.abs(deltaMain) > Math.abs(deltaCross) && Math.abs(deltaMain) > threshold) {
			if (deltaMain < 0) options.onSwipeNext?.()
			else options.onSwipePrev?.()
		}
	}

	/** Запланировать обновление смещения через RAF */
	function scheduleOffsetUpdate(offset: number): void {
		if (rafId !== null) return
		rafId = requestAnimationFrame(() => {
			dragOffset.value = offset
			options.onDragOffset?.(offset)
			rafId = null
		})
	}

	/** Отменить запланированный RAF */
	function cancelRaf(): void {
		if (rafId !== null) {
			cancelAnimationFrame(rafId)
			rafId = null
		}
	}

	/** Обработка начала касания */
	function onTouchStart(event: TouchEvent): void {
		dragStartX = event.touches[0].clientX
		dragStartY = event.touches[0].clientY
		isDragging.value = true
		dragOffset.value = 0
	}

	/** Обработка движения касания */
	function onTouchMove(event: TouchEvent): void {
		if (!isDragging.value) return
		const currentX = event.touches[0].clientX
		const currentY = event.touches[0].clientY
		const offset = options.isVertical() ? currentY - dragStartY : currentX - dragStartX
		scheduleOffsetUpdate(offset)
	}

	/** Обработка окончания касания */
	function onTouchEnd(event: TouchEvent): void {
		if (!isDragging.value) return
		cancelRaf()
		const deltaX = event.changedTouches[0].clientX - dragStartX
		const deltaY = event.changedTouches[0].clientY - dragStartY
		const deltaMain = options.isVertical() ? deltaY : deltaX
		const deltaCross = options.isVertical() ? deltaX : deltaY
		options.onDragEnd?.({ main: deltaMain, cross: deltaCross })
		resolveSwipe(deltaMain, deltaCross)
		isDragging.value = false
		dragOffset.value = 0
		options.onDragOffset?.(0)
	}

	/** Обработка начала перетаскивания мышью */
	function onDragStart(event: MouseEvent): void {
		dragStartX = event.clientX
		dragStartY = event.clientY
		isDragging.value = true
		dragOffset.value = 0

		let pendingOffset = 0

		function scheduleUpdate(): void {
			if (rafId !== null) return
			rafId = requestAnimationFrame(() => {
				dragOffset.value = pendingOffset
				options.onDragOffset?.(pendingOffset)
				rafId = null
			})
		}

		function handleMouseMove(ev: MouseEvent): void {
			if (!isDragging.value) return
			pendingOffset = options.isVertical() ? ev.clientY - dragStartY : ev.clientX - dragStartX
			scheduleUpdate()
		}

		function handleMouseUp(ev: MouseEvent): void {
			if (!isDragging.value) return
			cancelRaf()
			const deltaX = ev.clientX - dragStartX
			const deltaY = ev.clientY - dragStartY
			const deltaMain = options.isVertical() ? deltaY : deltaX
			const deltaCross = options.isVertical() ? deltaX : deltaY
			options.onDragEnd?.({ main: deltaMain, cross: deltaCross })
			resolveSwipe(deltaMain, deltaCross)
			isDragging.value = false
			dragOffset.value = 0
			options.onDragOffset?.(0)
			document.removeEventListener('mousemove', handleMouseMove)
			document.removeEventListener('mouseup', handleMouseUp)
		}

		document.addEventListener('mousemove', handleMouseMove)
		document.addEventListener('mouseup', handleMouseUp)
	}

	onBeforeUnmount(() => {
		cancelRaf()
	})

	return {
		isDragging,
		dragOffset,
		onTouchStart,
		onTouchMove,
		onTouchEnd,
		onDragStart,
	}
}

export { useSwipe }
