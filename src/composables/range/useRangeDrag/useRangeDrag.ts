/** Composable: drag-взаимодействие ползунков range-слайдера */
import { ref } from 'vue'
import { useRangeDragListeners } from './useRangeDragListeners'
import { keyTarget, nearestIndex, trackRatio } from './rangeDragUtils'
import type { UseRangeDragOptions, UseRangeDragReturn } from './types/useRangeDrag.types'

/** Описание: обрабатывает drag-взаимодействие ползунков range-слайдера — mouse/touch перетаскивание, клик по треку и клавиатурная навигация */
function useRangeDrag(options: UseRangeDragOptions): UseRangeDragReturn {
	const { trackRef, pointValues, isDisabled, min, max, snapToStepValue, setPointValue, emitChange } = options

	const activeIndex = ref<number | null>(null)

	function getValueFromEvent(e: MouseEvent | TouchEvent): number {
		/* istanbul ignore next -- Событие приходит только с отрисованного трека. */
		if (!trackRef.value) return min()
		const ratio = trackRatio(e, trackRef.value.getBoundingClientRect(), options.isVertical())
		return snapToStepValue(min() + ratio * (max() - min()))
	}

	const { addListeners } = useRangeDragListeners({
		activeIndex,
		onMove: (index, ev) => setPointValue(index, getValueFromEvent(ev)),
		onEnd: () => emitChange(),
	})

	function handleThumbDown(payload: { event: MouseEvent | TouchEvent; index: number }): void {
		if (isDisabled()) return
		activeIndex.value = payload.index
		addListeners(payload.event instanceof MouseEvent ? 'mouse' : 'touch')
	}

	function handleTrackDown(e: MouseEvent): void {
		if (isDisabled()) return
		const value = getValueFromEvent(e)
		const index = nearestIndex(pointValues.value, value)
		activeIndex.value = index
		setPointValue(index, value)
		addListeners('mouse')
	}

	function handleThumbKeydown(payload: { event: KeyboardEvent; index: number }): void {
		if (isDisabled()) return
		const { event, index } = payload
		const current = pointValues.value[index]
		const key = keyTarget(event.key, current, { min: min(), max: max(), step: options.step() })
		if (key === null) return
		event.preventDefault()

		const target = snapToStepValue(key)
		setPointValue(index, target)

		// Клавиатурный шаг — завершённое изменение, как отпускание ползунка, поэтому эмитим change.
		// Props родителя обновятся только после ре-рендера — значения после шага (с тем же
		// ограничением соседями, что в setPointValue) передаём явно; упор в границу change не даёт.
		const next = Math.max(options.thumbMin(index), Math.min(options.thumbMax(index), target))
		if (next === current) return
		const values = pointValues.value.slice()
		values[index] = next
		emitChange(values)
	}

	return { activeIndex, handleThumbDown, handleTrackDown, handleThumbKeydown }
}

export { useRangeDrag }
