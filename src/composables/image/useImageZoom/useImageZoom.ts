/** Composable: зум изображений (панорамирование, вращение, масштабирование, миникарта) */
import type { Ref } from 'vue'
import { useZoomLayout } from './useZoomLayout'
import { useZoomMinimap } from './useZoomMinimap'
import { normalizeZoomScales } from './zoomGeometry'
import { useZoomTransform } from './useZoomTransform'
import { useZoomPointer } from './gestures/useZoomPointer'
import { useEscapeKey } from '@composables/overlay/useEscapeKey'
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { useScrollLock } from '@composables/overlay/useScrollLock'
import { useReducedMotion } from '@composables/app/useReducedMotion'
import type { UseImageZoomOptions } from './types/useImageZoom.types'

/** Прокрутка колеса на один шаг масштаба, px: тачпад присылает много мелких событий, мышь — около 100 px на щелчок */
const WHEEL_STEP_PX = 50
/** Пикселей в строке и в странице — для событий колеса в строках (`deltaMode` 1) и страницах (2) */
const WHEEL_LINE_PX = 16
const WHEEL_PAGE_PX = 800

/** Шаг сдвига увеличенного изображения стрелкой, px */
const PAN_KEY_STEP_PX = 80
/** Сдвиг изображения клавишами-стрелками: стрелка открывает край в своей стороне, изображение смещается обратно */
const PAN_KEY_SHIFTS: Readonly<Record<string, readonly [number, number]>> = {
	ArrowLeft: [PAN_KEY_STEP_PX, 0],
	ArrowRight: [-PAN_KEY_STEP_PX, 0],
	ArrowUp: [0, PAN_KEY_STEP_PX],
	ArrowDown: [0, -PAN_KEY_STEP_PX],
}

/** Описание: стрелка двигает увеличенное изображение; у края (или без увеличения) сдвига нет — стрелка уходит в галерею */
function panByKey(event: KeyboardEvent, transform: ReturnType<typeof useZoomTransform>): boolean {
	const shift = PAN_KEY_SHIFTS[event.key]
	if (!shift || !transform.panBy(shift[0], shift[1])) return false
	event.preventDefault()
	return true
}

/** Описание: действие клавиши открытого зума — «+»/«=» и «-» масштаб, «0» сброс, стрелки — соседние изображения галереи */
function zoomKeyAction(
	key: string,
	options: UseImageZoomOptions,
	transform: ReturnType<typeof useZoomTransform>,
): (() => void) | undefined {
	const actions: Record<string, (() => void) | undefined> = {
		'+': transform.zoomIn,
		'=': transform.zoomIn,
		'-': transform.zoomOut,
		'0': transform.resetZoom,
		ArrowLeft: options.onArrowLeft,
		ArrowRight: options.onArrowRight,
	}
	return actions[key]
}

/** Описание: клавиши открытого зума; с Ctrl, Alt и Meta — клавиши браузера; стрелки при увеличении двигают изображение */
function handleZoomKey(event: KeyboardEvent, options: UseImageZoomOptions, transform: ReturnType<typeof useZoomTransform>): void {
	if (event.ctrlKey || event.altKey || event.metaKey || panByKey(event, transform)) return
	zoomKeyAction(event.key, options, transform)?.()
}

/** Описание: центр изображения зума на экране с учётом сдвига, масштаба и поворота; изображения нет — `null` */
function imageCenter(image: HTMLElement | null | undefined): { x: number; y: number } | null {
	if (!image) return null
	const rect = image.getBoundingClientRect()
	return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
}

/** Описание: жесты, которые нужны области изображения (без служебных `consumeDrag` и `resetPointers`) */
function pointerHandlers({ isPanning, handlePointerDown, handlePointerMove, handlePointerEnd }: ReturnType<typeof useZoomPointer>) {
	return { isPanning, handlePointerDown, handlePointerMove, handlePointerEnd }
}

/** Описание: прокрутка колеса в пикселях с учётом единиц события */
function wheelPixels(event: WheelEvent): number {
	if (event.deltaMode === 1) return event.deltaY * WHEEL_LINE_PX
	if (event.deltaMode === 2) return event.deltaY * WHEEL_PAGE_PX
	return event.deltaY
}

/** Описание: масштаб колесом — прокрутка копится до шага; горизонтальная прокрутка (`deltaY` 0) масштаб не меняет */
function useZoomWheel(transform: ReturnType<typeof useZoomTransform>) {
	let accumulated = 0
	return (event: WheelEvent): void => {
		accumulated += wheelPixels(event)
		if (Math.abs(accumulated) < WHEEL_STEP_PX) return
		if (accumulated < 0) transform.zoomIn()
		else transform.zoomOut()
		accumulated = 0
	}
}

/** Описание: блокировка прокрутки и подстройка под размер окна, пока зум открыт; общий счётчик не снимает блокировку модалки под зумом */
function useOpenZoomEffects(isZoomOpen: Ref<boolean>, syncSizes: () => void): () => void {
	const { lock, unlock } = useScrollLock()
	function release(): void {
		unlock()
		window.removeEventListener('resize', syncSizes)
	}
	watch(
		() => isZoomOpen.value,
		(opened: boolean) => {
			if (!opened) return release()
			lock()
			window.addEventListener('resize', syncSizes)
		},
	)
	return release
}

/** Описание: настройки зума с исправленными границами масштаба (min ≤ max, шаг > 0, без NaN) */
function useNormalizedOptions(options: UseImageZoomOptions): UseImageZoomOptions {
	const scales = computed(() =>
		normalizeZoomScales({
			initialScale: options.initialScale(),
			zoomStep: options.zoomStep(),
			minScale: options.minScale(),
			maxScale: options.maxScale(),
		}),
	)
	return {
		...options,
		initialScale: () => scales.value.initialScale,
		zoomStep: () => scales.value.zoomStep,
		minScale: () => scales.value.minScale,
		maxScale: () => scales.value.maxScale,
	}
}

/**
 * Описание: зум изображения — открытие и закрытие, масштаб, сдвиг, поворот, клавиатура и миникарта.
 * Жесты — `handlePointerDown`, `handlePointerMove`, `handlePointerEnd` на области изображения: сдвиг пальцем и мышью, щипок двумя пальцами.
 * Клавиши — `handleKeydown` на окне просмотра (`@keydown`), не на `document`: при фокусе вне зума «+», «-» и «0» не перехватываются.
 */
function useImageZoom(rawOptions: UseImageZoomOptions) {
	const options = useNormalizedOptions(rawOptions)
	const isZoomOpen = ref(false)
	const { layout, measure } = useZoomLayout(options)
	const transform = useZoomTransform(options, layout)
	const { clampPosition, resetView, zoomFit: _zoomFit, ...transformState } = transform
	const isReducedMotion = useReducedMotion()
	const pointer = useZoomPointer({ ...transform, getImageCenter: () => imageCenter(options.getZoomImgEl?.()) })

	function syncSizes(): void {
		measure()
		clampPosition()
	}

	function openZoom(): void {
		isZoomOpen.value = true
		resetView()
		nextTick(syncSizes)
	}

	function closeZoom(): void {
		isZoomOpen.value = false
		resetView()
		minimap.cleanupDragListeners()
		pointer.resetPointers()
	}

	// Escape — через стек слоёв: зум, открытый из окна, закрывается первым, окно — следующим нажатием
	useEscapeKey({ isActive: () => isZoomOpen.value, callback: () => closeZoom() })

	const minimap = useZoomMinimap({ ...transform, ...layout })
	const releaseOpenEffects = useOpenZoomEffects(isZoomOpen, syncSizes)

	onUnmounted(() => {
		minimap.cleanupDragListeners()
		releaseOpenEffects()
	})

	return {
		isZoomOpen,
		...transformState,
		resetView,
		/** Плавные переходы поворота, масштаба и сдвига: выключены при «уменьшить движение», при перетаскивании рамки миникарты и при жесте пальцами или мышью */
		isZoomAnimated: computed((): boolean => !isReducedMotion.value && !minimap.isMinimapDragging.value && !pointer.isPanning.value),
		syncSizes,
		openZoom,
		closeZoom,
		handleKeydown: (event: KeyboardEvent): void => {
			if (isZoomOpen.value) handleZoomKey(event, options, transform)
		},
		handleWheel: useZoomWheel(transform),
		handleOverlayClick: (): void => {
			if (pointer.consumeDrag()) return
			if (options.closeOnOverlay()) closeZoom()
		},
		...pointerHandlers(pointer),
		...minimap,
	}
}

export { useImageZoom }
