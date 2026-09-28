/** Composable: зум изображений (панорамирование, вращение, масштабирование, миникарта) */
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useEscapeKey } from '@composables/useEscapeKey'
import { useScrollLock } from '@composables/useScrollLock'
import { MINIMAP_HEIGHT, MINIMAP_WIDTH, useZoomMinimap } from './useZoomMinimap'
import type { Size, UseImageZoomOptions } from './types/useImageZoom.types'

/** Поворот за одно нажатие, градусы */
const ROTATION_STEP_DEG = 90
const FULL_TURN_DEG = 360

function useImageZoom(options: UseImageZoomOptions) {
	const isZoomOpen = ref(false)
	const currentScale = ref(options.initialScale())
	const translateX = ref(0)
	const translateY = ref(0)
	const rotation = ref(0)

	const zoomContentW = ref(0)
	const zoomContentH = ref(0)

	const mmContentWidth = ref<number>(MINIMAP_WIDTH)
	const mmContentHeight = ref<number>(MINIMAP_HEIGHT)
	const mmContentOffsetX = ref(0)
	const mmContentOffsetY = ref(0)

	const containerWidth = ref(0)
	const containerHeight = ref(0)

	const scalePercent = computed((): number => Math.round(currentScale.value * 100))
	const isMinScale = computed((): boolean => currentScale.value <= options.minScale())
	const isMaxScale = computed((): boolean => currentScale.value >= options.maxScale())

	const zoomImageStyle = computed((): Record<string, string> => ({
		transform: `translate(${translateX.value}px, ${translateY.value}px) scale(${currentScale.value}) rotate(${rotation.value}deg)`,
	}))

	/** Изображение, вписанное в рамку с сохранением пропорций (object-fit: contain): размер и отступы внутри рамки */
	function calcContain(natural: Size, frame: Size): { width: number; height: number; offX: number; offY: number } {
		const imgAspect = natural.width / natural.height
		const elAspect = frame.width / frame.height
		if (imgAspect > elAspect) {
			const width = frame.width
			const height = frame.width / imgAspect
			return { width, height, offX: 0, offY: (frame.height - height) / 2 }
		}
		const height = frame.height
		const width = frame.height * imgAspect
		return { width, height, offX: (frame.width - width) / 2, offY: 0 }
	}

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

	function syncSizes(): void {
		const zoomImg = options.getZoomImgEl?.()
		const minimapImg = options.getMinimapImgEl?.()

		if (zoomImg && zoomImg instanceof HTMLImageElement && zoomImg.naturalWidth > 0) {
			const contained = calcContain(
				{ width: zoomImg.naturalWidth, height: zoomImg.naturalHeight },
				{ width: zoomImg.offsetWidth, height: zoomImg.offsetHeight },
			)
			zoomContentW.value = contained.width
			zoomContentH.value = contained.height
		}

		if (minimapImg && minimapImg instanceof HTMLImageElement && minimapImg.naturalWidth > 0) {
			const contained = calcContain(
				{ width: minimapImg.naturalWidth, height: minimapImg.naturalHeight },
				{ width: MINIMAP_WIDTH, height: MINIMAP_HEIGHT },
			)
			mmContentWidth.value = contained.width
			mmContentHeight.value = contained.height
			mmContentOffsetX.value = contained.offX
			mmContentOffsetY.value = contained.offY
		}

		containerWidth.value = window.innerWidth
		containerHeight.value = window.innerHeight
		clampPosition()
	}

	function openZoom(): void {
		isZoomOpen.value = true
		resetZoom()
		nextTick(syncSizes)
	}

	function closeZoom(): void {
		isZoomOpen.value = false
		resetZoom()
		minimap.cleanupDragListeners()
	}

	function zoomIn(): void {
		if (isMaxScale.value) return
		currentScale.value = Math.min(currentScale.value + options.zoomStep(), options.maxScale())
		clampPosition()
		options.onZoom?.(currentScale.value)
	}

	function zoomOut(): void {
		if (isMinScale.value) return
		currentScale.value = Math.max(currentScale.value - options.zoomStep(), options.minScale())
		if (currentScale.value <= 1) resetPosition()
		else clampPosition()
		options.onZoom?.(currentScale.value)
	}

	function resetZoom(): void {
		currentScale.value = options.initialScale()
		rotation.value = 0
		resetPosition()
		options.onZoom?.(currentScale.value)
	}

	function resetPosition(): void {
		translateX.value = 0
		translateY.value = 0
	}

	function rotateLeft(): void {
		rotation.value = (rotation.value - ROTATION_STEP_DEG) % FULL_TURN_DEG
	}

	function rotateRight(): void {
		rotation.value = (rotation.value + ROTATION_STEP_DEG) % FULL_TURN_DEG
	}

	function handleWheel(event: WheelEvent): void {
		if (event.deltaY < 0) zoomIn()
		else zoomOut()
	}

	function handleOverlayClick(): void {
		if (options.closeOnOverlay()) closeZoom()
	}

	// Escape — через стек слоёв: зум, открытый из окна, закрывается первым, окно — следующим нажатием
	useEscapeKey({ isActive: () => isZoomOpen.value, callback: () => closeZoom() })

	function handleKeydown(event: KeyboardEvent): void {
		if (!isZoomOpen.value) return
		if (event.key === '+' || event.key === '=') zoomIn()
		if (event.key === '-') zoomOut()
		if (event.key === '0') resetZoom()
		if (event.key === 'ArrowLeft') options.onArrowLeft?.()
		if (event.key === 'ArrowRight') options.onArrowRight?.()
	}

	const minimap = useZoomMinimap({
		currentScale,
		translateX,
		translateY,
		rotation,
		zoomContentW,
		zoomContentH,
		mmContentWidth,
		mmContentHeight,
		mmContentOffsetX,
		mmContentOffsetY,
		clampPosition,
	})

	/** Общий счётчик блокировок: закрытие зума не должно снимать блокировку открытой под ним модалки */
	const { lock, unlock } = useScrollLock()

	watch(
		() => isZoomOpen.value,
		(opened: boolean) => {
			if (opened) {
				lock()
			} else {
				unlock()
			}
		},
	)

	onMounted(() => {
		document.addEventListener('keydown', handleKeydown)
		window.addEventListener('resize', syncSizes)
	})

	onUnmounted(() => {
		document.removeEventListener('keydown', handleKeydown)
		window.removeEventListener('resize', syncSizes)
		minimap.cleanupDragListeners()
		unlock()
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
		...minimap,
	}
}

export { useImageZoom }
