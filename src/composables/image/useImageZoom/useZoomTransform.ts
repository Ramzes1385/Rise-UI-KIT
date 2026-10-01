/** Composable: масштаб, сдвиг и поворот изображения в зуме */
import type { Ref } from 'vue'
import { computed, ref } from 'vue'
import { clampTranslate } from './zoomGeometry'
import type { UseImageZoomOptions, ZoomLayout } from './types/useImageZoom.types'

/** Поворот за одно нажатие, градусы */
const ROTATION_STEP_DEG = 90
const FULL_TURN_DEG = 360

/** Описание: поворот изображения шагами по 90° в обе стороны */
function useZoomRotation() {
	const rotation = ref(0)

	function rotateBy(step: number): void {
		rotation.value = (rotation.value + step) % FULL_TURN_DEG
	}

	return {
		rotation,
		rotateLeft: (): void => rotateBy(-ROTATION_STEP_DEG),
		rotateRight: (): void => rotateBy(ROTATION_STEP_DEG),
	}
}

/** Описание: сдвиг изображения; при масштабе больше 1 не выпускает увеличенное изображение за край окна */
function useZoomPosition(layout: ZoomLayout, currentScale: Readonly<Ref<number>>) {
	const translateX = ref(0)
	const translateY = ref(0)

	function resetPosition(): void {
		translateX.value = 0
		translateY.value = 0
	}

	function clampPosition(): void {
		const scale = currentScale.value
		if (scale <= 1) return resetPosition()
		const frameW = layout.containerWidth.value || window.innerWidth
		const frameH = layout.containerHeight.value || window.innerHeight
		translateX.value = clampTranslate(translateX.value, layout.zoomContentW.value * scale, frameW)
		translateY.value = clampTranslate(translateY.value, layout.zoomContentH.value * scale, frameH)
	}

	return { translateX, translateY, resetPosition, clampPosition }
}

/** Описание: масштаб, сдвиг и поворот; сдвиг не выпускает увеличенное изображение за край окна */
function useZoomTransform(options: UseImageZoomOptions, layout: ZoomLayout) {
	const currentScale = ref(options.initialScale())
	const { translateX, translateY, resetPosition, clampPosition } = useZoomPosition(layout, currentScale)
	const { rotation, rotateLeft, rotateRight } = useZoomRotation()

	const isMinScale = computed((): boolean => currentScale.value <= options.minScale())
	const isMaxScale = computed((): boolean => currentScale.value >= options.maxScale())

	function changeScale(scale: number): void {
		currentScale.value = scale
		clampPosition()
		options.onZoom?.(currentScale.value)
	}

	function resetZoom(): void {
		currentScale.value = options.initialScale()
		rotation.value = 0
		resetPosition()
		options.onZoom?.(currentScale.value)
	}

	return {
		currentScale,
		translateX,
		translateY,
		rotation,
		scalePercent: computed((): number => Math.round(currentScale.value * 100)),
		isMinScale,
		isMaxScale,
		zoomImageStyle: computed((): Record<string, string> => ({
			transform: `translate(${translateX.value}px, ${translateY.value}px) scale(${currentScale.value}) rotate(${rotation.value}deg)`,
		})),
		clampPosition,
		zoomIn: (): void => {
			if (!isMaxScale.value) changeScale(Math.min(currentScale.value + options.zoomStep(), options.maxScale()))
		},
		zoomOut: (): void => {
			if (!isMinScale.value) changeScale(Math.max(currentScale.value - options.zoomStep(), options.minScale()))
		},
		resetZoom,
		rotateLeft,
		rotateRight,
	}
}

export { useZoomTransform }
