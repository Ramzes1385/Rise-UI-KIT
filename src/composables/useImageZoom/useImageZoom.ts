import type { UseImageZoomOptions } from './useImageZoom.types'

import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

/**
 * Composable для зума изображения: масштаб, поворот, мини-карта.
 * Навигация — только через мини-карту, картинка не выходит за границы экрана.
 */
function useImageZoom(options: UseImageZoomOptions) {
	const isZoomOpen = ref(false)
	const currentScale = ref(options.initialScale())
	const translateX = ref(0)
	const translateY = ref(0)
	const rotation = ref(0)
	const isMinimapDragging = ref(false)
	const minimapStartX = ref(0)
	const minimapStartY = ref(0)
	const minimapStartTranslateX = ref(0)
	const minimapStartTranslateY = ref(0)

	/** Размеры контента zoom-изображения (object-fit: contain) */
	const zoomContentW = ref(0)
	const zoomContentH = ref(0)

	/** Размеры контента мини-карты (object-fit: contain) */
	const mmContentWidth = ref(200)
	const mmContentHeight = ref(150)
	const mmContentOffsetX = ref(0)
	const mmContentOffsetY = ref(0)

	/** Размеры zoom-контейнера */
	const containerWidth = ref(0)
	const containerHeight = ref(0)

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
		}),
	)

	/** Стили viewport мини-карты */
	const minimapViewportStyle = computed((): Record<string, string> => {
		const mmW = 200
		const mmH = 150
		const scale = currentScale.value
		const baseW = zoomContentW.value
		const baseH = zoomContentH.value
		if (baseW <= 0 || baseH <= 0) return { display: 'none' }

		const cW = containerWidth.value || window.innerWidth
		const cH = containerHeight.value || window.innerHeight

		// Видимая область в координатах изображения
		const visW = Math.min(baseW, cW / scale)
		const visH = Math.min(baseH, cH / scale)

		// Центр видимой области
		const visCenterX = baseW / 2 - translateX.value / scale
		const visCenterY = baseH / 2 - translateY.value / scale

		// Верхний левый угол
		const visLeft = visCenterX - visW / 2
		const visTop = visCenterY - visH / 2

		// Масштаб мини-карты
		const mmScaleX = mmContentWidth.value / baseW
		const mmScaleY = mmContentHeight.value / baseH

		const viewW = Math.max(10, visW * mmScaleX)
		const viewH = Math.max(10, visH * mmScaleY)

		const offsetX = visLeft * mmScaleX + mmContentOffsetX.value
		const offsetY = visTop * mmScaleY + mmContentOffsetY.value

		const clampX = Math.min(Math.max(offsetX, 0), mmW - viewW)
		const clampY = Math.min(Math.max(offsetY, 0), mmH - viewH)

		return {
			width: `${viewW}px`,
			height: `${viewH}px`,
			transform: `translate(${clampX}px, ${clampY}px)`,
		}
	})

	/** Стили изображения мини-карты */
	const minimapImageStyle = computed(
		(): Record<string, string> => ({
			transform: `rotate(${rotation.value}deg)`,
		}),
	)

	/** Расчёт object-fit: contain */
	function calcContain(
		natW: number,
		natH: number,
		elW: number,
		elH: number,
	): { w: number; h: number; offX: number; offY: number } {
		const imgAspect = natW / natH
		const elAspect = elW / elH
		if (imgAspect > elAspect) {
			const w = elW
			const h = elW / imgAspect
			return { w, h, offX: 0, offY: (elH - h) / 2 }
		}
		const h = elH
		const w = elH * imgAspect
		return { w, h, offX: (elW - w) / 2, offY: 0 }
	}

	/** Ограничить позицию картинки */
	function clampPosition(): void {
		const scale = currentScale.value
		if (scale <= 1) {
			translateX.value = 0
			translateY.value = 0
			return
		}

		const cW = containerWidth.value || window.innerWidth
		const cH = containerHeight.value || window.innerHeight
		const imgW = zoomContentW.value * scale
		const imgH = zoomContentH.value * scale

		if (imgW <= cW) {
			translateX.value = 0
		} else {
			const maxTX = (imgW - cW) / 2
			translateX.value = Math.min(Math.max(translateX.value, -maxTX), maxTX)
		}

		if (imgH <= cH) {
			translateY.value = 0
		} else {
			const maxTY = (imgH - cH) / 2
			translateY.value = Math.min(Math.max(translateY.value, -maxTY), maxTY)
		}
	}

	/** Синхронизировать размеры из DOM */
	function syncSizes(): void {
		const zoomImg = options.getZoomImgEl?.()
		const minimapImg = options.getMinimapImgEl?.()

		// Контент zoom-изображения (object-fit: contain)
		if (zoomImg && zoomImg instanceof HTMLImageElement && zoomImg.naturalWidth > 0) {
			const c = calcContain(zoomImg.naturalWidth, zoomImg.naturalHeight, zoomImg.offsetWidth, zoomImg.offsetHeight)
			zoomContentW.value = c.w
			zoomContentH.value = c.h
		}

		// Контент мини-карты
		if (minimapImg && minimapImg instanceof HTMLImageElement && minimapImg.naturalWidth > 0) {
			const c = calcContain(minimapImg.naturalWidth, minimapImg.naturalHeight, 200, 150)
			mmContentWidth.value = c.w
			mmContentHeight.value = c.h
			mmContentOffsetX.value = c.offX
			mmContentOffsetY.value = c.offY
		}

		containerWidth.value = window.innerWidth
		containerHeight.value = window.innerHeight
		clampPosition()
	}

	/** Открыть зум */
	function openZoom(): void {
		isZoomOpen.value = true
		resetZoom()
		nextTick(syncSizes)
	}

	/** Закрыть зум */
	function closeZoom(): void {
		isZoomOpen.value = false
		resetZoom()
		cleanupDragListeners()
	}

	/** Приблизить */
	function zoomIn(): void {
		if (isMaxScale.value) return
		currentScale.value = Math.min(currentScale.value + options.zoomStep(), options.maxScale())
		clampPosition()
		options.onZoom?.(currentScale.value)
	}

	/** Отдалить */
	function zoomOut(): void {
		if (isMinScale.value) return
		currentScale.value = Math.max(currentScale.value - options.zoomStep(), options.minScale())
		if (currentScale.value <= 1) resetPosition()
		else clampPosition()
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

	/** Клик по оверлею */
	function handleOverlayClick(): void {
		if (options.closeOnOverlay()) closeZoom()
	}

	/** Начало перетаскивания мини-карты */
	function handleMinimapDragStart(event: MouseEvent): void {
		isMinimapDragging.value = true
		minimapStartX.value = event.clientX
		minimapStartY.value = event.clientY
		minimapStartTranslateX.value = translateX.value
		minimapStartTranslateY.value = translateY.value
		document.addEventListener('mousemove', handleMinimapDragMove)
		document.addEventListener('mouseup', handleMinimapDragEnd)
	}

	/** Перетаскивание мини-карты */
	function handleMinimapDragMove(event: MouseEvent): void {
		if (!isMinimapDragging.value) return
		event.preventDefault()
		const dx = event.clientX - minimapStartX.value
		const dy = event.clientY - minimapStartY.value
		/* istanbul ignore next — defensive division-by-zero guard: mmContentWidth/Height инициализируются ref(200/150) и обновляются только через calcContain(natW,natH,200,150), которая всегда возвращает >0 */
		const scX = mmContentWidth.value > 0 ? zoomContentW.value / mmContentWidth.value : 1
		/* istanbul ignore next — defensive division-by-zero guard */
		const scY = mmContentHeight.value > 0 ? zoomContentH.value / mmContentHeight.value : 1
		translateX.value = minimapStartTranslateX.value - dx * scX * currentScale.value
		translateY.value = minimapStartTranslateY.value - dy * scY * currentScale.value
		clampPosition()
	}

	/** Конец перетаскивания мини-карты */
	function handleMinimapDragEnd(): void {
		if (!isMinimapDragging.value) return
		isMinimapDragging.value = false
		document.removeEventListener('mousemove', handleMinimapDragMove)
		document.removeEventListener('mouseup', handleMinimapDragEnd)
	}

	/** Клик по мини-карте — мгновенный переход */
	function handleMinimapClick(event: MouseEvent): void {
		if (zoomContentW.value <= 0 || zoomContentH.value <= 0) return
		const target = event.currentTarget as HTMLElement
		const rect = target.getBoundingClientRect()
		const clickX = event.clientX - rect.left
		const clickY = event.clientY - rect.top

		const contentX = clickX - mmContentOffsetX.value
		const contentY = clickY - mmContentOffsetY.value

		/* istanbul ignore next — defensive division-by-zero guard (см. handleMinimapDragMove) */
		const mmScaleX = mmContentWidth.value > 0 ? zoomContentW.value / mmContentWidth.value : 1
		/* istanbul ignore next — defensive division-by-zero guard */
		const mmScaleY = mmContentHeight.value > 0 ? zoomContentH.value / mmContentHeight.value : 1
		const imgX = contentX * mmScaleX
		const imgY = contentY * mmScaleY

		const scale = currentScale.value
		translateX.value = (zoomContentW.value / 2 - imgX) * scale
		translateY.value = (zoomContentH.value / 2 - imgY) * scale
		clampPosition()
	}

	/** Удалить все слушатели перетаскивания */
	function cleanupDragListeners(): void {
		isMinimapDragging.value = false
		document.removeEventListener('mousemove', handleMinimapDragMove)
		document.removeEventListener('mouseup', handleMinimapDragEnd)
	}

	/** Обработка клавиш */
	function handleKeydown(event: KeyboardEvent): void {
		if (!isZoomOpen.value) return
		if (event.key === 'Escape') closeZoom()
		if (event.key === '+' || event.key === '=') zoomIn()
		if (event.key === '-') zoomOut()
		if (event.key === '0') resetZoom()
	}

	watch(
		() => isZoomOpen.value,
		(opened: boolean) => {
			document.body.style.overflow = opened ? 'hidden' : ''
		},
	)

	onMounted(() => {
		document.addEventListener('keydown', handleKeydown)
		window.addEventListener('resize', syncSizes)
	})

	onUnmounted(() => {
		document.removeEventListener('keydown', handleKeydown)
		window.removeEventListener('resize', syncSizes)
		cleanupDragListeners()
		document.body.style.overflow = ''
	})

	return {
		isZoomOpen,
		currentScale,
		translateX,
		translateY,
		rotation,
		scalePercent,
		isMinScale,
		isMaxScale,
		zoomImageStyle,
		minimapViewportStyle,
		minimapImageStyle,
		syncSizes,
		openZoom,
		closeZoom,
		zoomIn,
		zoomOut,
		resetZoom,
		rotateLeft,
		rotateRight,
		handleWheel,
		handleOverlayClick,
		handleMinimapClick,
		handleMinimapDragStart,
		handleMinimapDragMove,
		handleMinimapDragEnd,
	}
}

export { useImageZoom }
