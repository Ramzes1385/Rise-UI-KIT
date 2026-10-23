/** Composable: поворот изображения в зуме — угол копится, переход всегда в сторону нажатия */
import { ref } from 'vue'
import { nearestFullTurn } from './zoomGeometry'

/** Поворот за одно нажатие, градусы */
const ROTATION_STEP_DEG = 90

/**
 * Описание: поворот шагами по 90° в обе стороны.
 * Угол не берётся по модулю 360: 270° → вправо даёт 360°, а не 0°, и CSS-переход идёт на 90° по часовой, а не на 270° назад.
 */
function useZoomRotation(onRotate: () => void) {
	const rotation = ref(0)

	function rotateBy(step: number): void {
		rotation.value += step
		onRotate()
	}

	return {
		rotation,
		rotateLeft: (): void => rotateBy(-ROTATION_STEP_DEG),
		rotateRight: (): void => rotateBy(ROTATION_STEP_DEG),
		/** К ближайшему полному обороту — переход не больше 180° (270° → 360°) */
		resetRotationShortest: (): void => {
			rotation.value = nearestFullTurn(rotation.value)
		},
		/** Ровно 0° — при открытии, закрытии и смене изображения */
		resetRotation: (): void => {
			rotation.value = 0
		},
	}
}

export { useZoomRotation }
