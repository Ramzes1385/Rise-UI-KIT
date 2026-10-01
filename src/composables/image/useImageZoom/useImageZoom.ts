/** Composable: зум изображений (панорамирование, вращение, масштабирование, миникарта) */
import type { Ref } from 'vue'
import { useZoomLayout } from './useZoomLayout'
import { useZoomMinimap } from './useZoomMinimap'
import { useZoomTransform } from './useZoomTransform'
import { useEscapeKey } from '@composables/overlay/useEscapeKey'
import { useScrollLock } from '@composables/overlay/useScrollLock'
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import type { UseImageZoomOptions } from './types/useImageZoom.types'

/** Описание: клавиши открытого зума — «+»/«=» и «-» масштаб, «0» сброс, стрелки — соседние изображения галереи */
function handleZoomKey(event: KeyboardEvent, options: UseImageZoomOptions, transform: ReturnType<typeof useZoomTransform>): void {
	if (event.key === '+' || event.key === '=') transform.zoomIn()
	if (event.key === '-') transform.zoomOut()
	if (event.key === '0') transform.resetZoom()
	if (event.key === 'ArrowLeft') options.onArrowLeft?.()
	if (event.key === 'ArrowRight') options.onArrowRight?.()
}

/** Описание: блокировка прокрутки страницы, пока зум открыт; общий счётчик не снимает блокировку модалки под зумом */
function useZoomScrollLock(isZoomOpen: Ref<boolean>): () => void {
	const { lock, unlock } = useScrollLock()
	watch(
		() => isZoomOpen.value,
		(opened: boolean) => {
			if (opened) lock()
			else unlock()
		},
	)
	return unlock
}

/** Описание: клавиатура и изменение размера окна, пока компонент смонтирован; `cleanup` — при размонтировании */
function useZoomListeners(handleKeydown: (event: KeyboardEvent) => void, syncSizes: () => void, cleanup: () => void): void {
	onMounted(() => {
		document.addEventListener('keydown', handleKeydown)
		window.addEventListener('resize', syncSizes)
	})

	onUnmounted(() => {
		document.removeEventListener('keydown', handleKeydown)
		window.removeEventListener('resize', syncSizes)
		cleanup()
	})
}

/** Описание: зум изображения — открытие и закрытие, масштаб, сдвиг, поворот, клавиатура и миникарта */
function useImageZoom(options: UseImageZoomOptions) {
	const isZoomOpen = ref(false)
	const { layout, measure } = useZoomLayout(options)
	const transform = useZoomTransform(options, layout)
	const { clampPosition, resetZoom, ...transformState } = transform

	function syncSizes(): void {
		measure()
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

	// Escape — через стек слоёв: зум, открытый из окна, закрывается первым, окно — следующим нажатием
	useEscapeKey({ isActive: () => isZoomOpen.value, callback: () => closeZoom() })

	function handleKeydown(event: KeyboardEvent): void {
		if (isZoomOpen.value) handleZoomKey(event, options, transform)
	}

	const minimap = useZoomMinimap({ ...transform, ...layout })
	const unlockScroll = useZoomScrollLock(isZoomOpen)

	useZoomListeners(handleKeydown, syncSizes, () => {
		minimap.cleanupDragListeners()
		unlockScroll()
	})

	return {
		isZoomOpen,
		...transformState,
		resetZoom,
		syncSizes,
		openZoom,
		closeZoom,
		handleWheel: (event: WheelEvent): void => {
			if (event.deltaY < 0) transform.zoomIn()
			else transform.zoomOut()
		},
		handleOverlayClick: (): void => {
			if (options.closeOnOverlay()) closeZoom()
		},
		...minimap,
	}
}

export { useImageZoom }
