import type { UseImageZoomOptions } from './useImageZoom.types'

import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

/**
 * Composable для зума изображения: масштаб, поворот, перетаскивание, мини-карта.
 *
 * @example
 * ```ts
 * const zoom = useImageZoom({
 *   initialScale: () => props.initialScale,
 *   zoomStep: () => props.zoomStep,
 *   minScale: () => props.minScale,
 *   maxScale: () => props.maxScale,
 *   closeOnOverlay: () => props.closeOnOverlay,
 *   onZoom: (scale) => emit('zoom', scale),
 * })
 * ```
 */
function useImageZoom(options: UseImageZoomOptions) {
	const isZoomOpen = ref(false)
	const currentScale = ref(options.initialScale())
	const translateX = ref(0)
	const translateY = ref(0)
	const isDragging = ref(false)
	const dragStartX = ref(0)
	const dragStartY = ref(0)
	const dragStartTranslateX = ref(0)
	const dragStartTranslateY = ref(0)
	const rotation = ref(0)

	/** Процент масштаба */
	const scalePercent = computed((): number => Math.round(currentScale.value * 100))

	/** Достигнут минимальный масштаб */
	const isMinScale = computed((): boolean => currentScale.value <= options.minScale())

	/** Достигнут максимальный масштаб */
	const isMaxScale = computed((): boolean => currentScale.value >= options.maxScale())

	/** Стили изображения в зуме */
	const zoomImageStyle = computed(
		(): Record<string, string> => ({
			transform: `translate(${translateX.value}px, ${translateY.value}px) scale(${currentScale.value}) rotate(${rotation.value}deg)`,
			cursor: isDragging.value ? 'grabbing' : currentScale.value > 1 ? 'grab' : 'default',
		}),
	)

	/** Стили viewport мини-карты */
	const minimapViewportStyle = computed((): Record<string, string> => {
		const minimapSize = 120
		const scale = currentScale.value
		const viewWidth = Math.max(10, minimapSize / scale)
		const viewHeight = Math.max(10, minimapSize / scale)
		const offsetX = (-translateX.value / scale) * (minimapSize / (minimapSize / scale))
		const offsetY = (-translateY.value / scale) * (minimapSize / (minimapSize / scale))
		return {
			width: `${viewWidth}px`,
			height: `${viewHeight}px`,
			left: `${Math.min(Math.max(offsetX, 0), minimapSize - viewWidth)}px`,
			top: `${Math.min(Math.max(offsetY, 0), minimapSize - viewHeight)}px`,
		}
	})

	/** Стили изображения мини-карты с учётом поворота */
	const minimapImageStyle = computed(
		(): Record<string, string> => ({
			transform: `rotate(${rotation.value}deg)`,
		}),
	)

	/** Открыть зум */
	function openZoom(): void {
		isZoomOpen.value = true
		resetZoom()
	}

	/** Закрыть зум */
	function closeZoom(): void {
		isZoomOpen.value = false
		resetZoom()
	}

	/** Приблизить */
	function zoomIn(): void {
		if (isMaxScale.value) return
		currentScale.value = Math.min(currentScale.value + options.zoomStep(), options.maxScale())
		options.onZoom?.(currentScale.value)
	}

	/** Отдалить */
	function zoomOut(): void {
		if (isMinScale.value) return
		currentScale.value = Math.max(currentScale.value - options.zoomStep(), options.minScale())
		if (currentScale.value <= 1) resetPosition()
		options.onZoom?.(currentScale.value)
	}

	/** Сбросить масштаб */
	function resetZoom(): void {
		currentScale.value = options.initialScale()
		rotation.value = 0
		resetPosition()
		options.onZoom?.(currentScale.value)
	}

	/** Сбросить позицию */
	function resetPosition(): void {
		translateX.value = 0
		translateY.value = 0
	}

	/** Повернуть влево на 90° */
	function rotateLeft(): void {
		rotation.value = (rotation.value - 90) % 360
	}

	/** Повернуть вправо на 90° */
	function rotateRight(): void {
		rotation.value = (rotation.value + 90) % 360
	}

	/** Зум колёсиком */
	function handleWheel(event: WheelEvent): void {
		if (event.deltaY < 0) zoomIn()
		else zoomOut()
	}

	/** Начало перетаскивания */
	function handleDragStart(event: MouseEvent): void {
		if (currentScale.value <= 1) return
		isDragging.value = true
		dragStartX.value = event.clientX
		dragStartY.value = event.clientY
		dragStartTranslateX.value = translateX.value
		dragStartTranslateY.value = translateY.value
	}

	/** Перетаскивание */
	function handleDragMove(event: MouseEvent): void {
		if (!isDragging.value) return
		translateX.value = dragStartTranslateX.value + (event.clientX - dragStartX.value)
		translateY.value = dragStartTranslateY.value + (event.clientY - dragStartY.value)
	}

	/** Конец перетаскивания */
	function handleDragEnd(): void {
		isDragging.value = false
	}

	/** Клик по оверлею */
	function handleOverlayClick(): void {
		if (options.closeOnOverlay()) closeZoom()
	}

	/** Клик по мини-карте — перемещение viewport */
	function handleMinimapClick(event: MouseEvent): void {
		const minimapSize = 120
		const target = event.currentTarget as HTMLElement
		const rect = target.getBoundingClientRect()
		const clickX = event.clientX - rect.left
		const clickY = event.clientY - rect.top
		const scale = currentScale.value
		const viewWidth = minimapSize / scale
		const viewHeight = minimapSize / scale
		const newOffsetX = clickX - viewWidth / 2
		const newOffsetY = clickY - viewHeight / 2
		translateX.value = -(newOffsetX * scale)
		translateY.value = -(newOffsetY * scale)
	}

	/** Обработка клавиш */
	function handleKeydown(event: KeyboardEvent): void {
		if (!isZoomOpen.value) return
		if (event.key === 'Escape') closeZoom()
		if (event.key === '+' || event.key === '=') zoomIn()
		if (event.key === '-') zoomOut()
		if (event.key === '0') resetZoom()
	}

	/** Блокировка скролла body при открытом зуме */
	watch(
		() => isZoomOpen.value,
		(opened: boolean) => {
			if (opened) {
				document.body.style.overflow = 'hidden'
			} else {
				document.body.style.overflow = ''
			}
		},
	)

	onMounted(() => {
		document.addEventListener('keydown', handleKeydown)
	})

	onUnmounted(() => {
		document.removeEventListener('keydown', handleKeydown)
		document.body.style.overflow = ''
	})

	return {
		isZoomOpen,
		currentScale,
		translateX,
		translateY,
		isDragging,
		rotation,
		scalePercent,
		isMinScale,
		isMaxScale,
		zoomImageStyle,
		minimapViewportStyle,
		minimapImageStyle,
		openZoom,
		closeZoom,
		zoomIn,
		zoomOut,
		resetZoom,
		rotateLeft,
		rotateRight,
		handleWheel,
		handleDragStart,
		handleDragMove,
		handleDragEnd,
		handleOverlayClick,
		handleMinimapClick,
	}
}

export { useImageZoom }
