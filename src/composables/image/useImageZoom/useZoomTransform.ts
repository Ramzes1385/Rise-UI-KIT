/** Composable: масштаб, сдвиг и поворот изображения в зуме */
import type { Ref } from 'vue'
import { computed, ref } from 'vue'
import { useZoomRotation } from './useZoomRotation'
import { clampTranslate, rotatedFit, rotatedSize } from './zoomGeometry'
import type { UseImageZoomOptions, ZoomLayout } from './types/useImageZoom.types'

/** Описание: множитель вписывания повёрнутого изображения в место под него (на 90° и 270° — меньше 1 у вытянутых изображений) */
function useRotatedFit(layout: ZoomLayout, rotation: Readonly<Ref<number>>) {
	return computed((): number =>
		rotatedFit(
			{ width: layout.zoomContentW.value, height: layout.zoomContentH.value },
			{ width: layout.spaceWidth.value, height: layout.spaceHeight.value },
			rotation.value,
		),
	)
}

/** Описание: сдвиг изображения; при масштабе больше 1 не выпускает увеличенное и повёрнутое изображение за край окна */
function useZoomPosition(layout: ZoomLayout, currentScale: Readonly<Ref<number>>, rotation: Readonly<Ref<number>>) {
	const translateX = ref(0)
	const translateY = ref(0)
	const fit = useRotatedFit(layout, rotation)

	function resetPosition(): void {
		translateX.value = 0
		translateY.value = 0
	}

	function clampPosition(): void {
		if (currentScale.value <= 1) return resetPosition()
		const scale = currentScale.value * fit.value
		const content = rotatedSize({ width: layout.zoomContentW.value, height: layout.zoomContentH.value }, rotation.value)
		const frameW = layout.containerWidth.value || window.innerWidth
		const frameH = layout.containerHeight.value || window.innerHeight
		translateX.value = clampTranslate(translateX.value, content.width * scale, frameW)
		translateY.value = clampTranslate(translateY.value, content.height * scale, frameH)
	}

	return { translateX, translateY, fit, resetPosition, clampPosition }
}

/** Описание: масштаб, сдвиг и поворот; сдвиг не выпускает увеличенное изображение за край окна, поворот на 90° и 270° вписывает изображение */
function useZoomTransform(options: UseImageZoomOptions, layout: ZoomLayout) {
	const currentScale = ref(options.initialScale())
	const { rotation, rotateLeft, rotateRight, resetRotationShortest, resetRotation } = useZoomRotation(() => clampPosition())
	const { translateX, translateY, fit, resetPosition, clampPosition } = useZoomPosition(layout, currentScale, rotation)

	const isMinScale = computed((): boolean => currentScale.value <= options.minScale())
	const isMaxScale = computed((): boolean => currentScale.value >= options.maxScale())

	function changeScale(scale: number): void {
		currentScale.value = scale
		clampPosition()
		options.onZoom?.(currentScale.value)
	}

	/** Масштаб и сдвиг — к начальным; `onZoom` — только если масштаб изменился */
	function resetScaleAndPosition(): void {
		const previous = currentScale.value
		currentScale.value = options.initialScale()
		resetPosition()
		if (currentScale.value !== previous) options.onZoom?.(currentScale.value)
	}

	return {
		currentScale,
		translateX,
		translateY,
		rotation,
		zoomFit: fit,
		scalePercent: computed((): number => Math.round(currentScale.value * 100)),
		isMinScale,
		isMaxScale,
		zoomImageStyle: computed((): Record<string, string> => ({
			transform: `translate(${translateX.value}px, ${translateY.value}px) scale(${currentScale.value * fit.value}) rotate(${rotation.value}deg)`,
		})),
		clampPosition,
		zoomIn: (): void => {
			if (!isMaxScale.value) changeScale(Math.min(currentScale.value + options.zoomStep(), options.maxScale()))
		},
		zoomOut: (): void => {
			if (!isMinScale.value) changeScale(Math.max(currentScale.value - options.zoomStep(), options.minScale()))
		},
		/** Сброс масштаба, сдвига и поворота — поворот к ближайшему полному обороту (кнопка «Сбросить масштаб», клавиша «0») */
		resetZoom: (): void => {
			resetRotationShortest()
			resetScaleAndPosition()
		},
		/** Сброс масштаба, сдвига и поворота ровно к 0° — открытие, закрытие и смена изображения */
		resetView: (): void => {
			resetRotation()
			resetScaleAndPosition()
		},
		rotateLeft,
		rotateRight,
	}
}

export { useZoomTransform }
