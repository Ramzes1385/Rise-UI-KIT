import { onBeforeUnmount, ref } from 'vue'
import type { UseRangeDragOptions, UseRangeDragReturn } from './useRangeDrag.types'

/** Описание: обрабатывает drag-взаимодействие ползунков range-слайдера — mouse/touch перетаскивание, клик по треку и клавиатурная навигация */
function useRangeDrag(options: UseRangeDragOptions): UseRangeDragReturn {
	const {
		trackRef,
		pointValues,
		isDisabled,
		min,
		max,
		isVertical,
		snapToStepValue,
		setPointValue,
		emitChange,
	} = options

	const activeIndex = ref<number | null>(null)

	function getValueFromEvent(e: MouseEvent | TouchEvent): number {
		/* istanbul ignore next -- Событие приходит только с отрисованного трека. */
		if (!trackRef.value) return min()
		const rect = trackRef.value.getBoundingClientRect()
		const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
		const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

		let ratio: number
		if (isVertical()) {
			ratio = 1 - (clientY - rect.top) / rect.height
		} else {
			ratio = (clientX - rect.left) / rect.width
		}

		ratio = Math.max(0, Math.min(1, ratio))
		const raw = min() + ratio * (max() - min())
		return snapToStepValue(raw)
	}

	function handleMouseMove(ev: MouseEvent): void {
		/* istanbul ignore next -- Защитный выход без активного drag. */
		if (activeIndex.value === null) return
		setPointValue(activeIndex.value, getValueFromEvent(ev))
	}

	function handleTouchMove(ev: TouchEvent): void {
		/* istanbul ignore next -- Защитный выход без активного touch drag. */
		if (activeIndex.value === null) return
		setPointValue(activeIndex.value, getValueFromEvent(ev))
	}

	function handleMouseUp(): void {
		activeIndex.value = null
		document.removeEventListener('mousemove', handleMouseMove)
		document.removeEventListener('mouseup', handleMouseUp)
		emitChange()
	}

	function handleTouchEnd(): void {
		activeIndex.value = null
		document.removeEventListener('touchmove', handleTouchMove)
		document.removeEventListener('touchend', handleTouchEnd)
		emitChange()
	}

	function handleThumbDown(payload: { event: MouseEvent | TouchEvent; index: number }): void {
		if (isDisabled()) return
		activeIndex.value = payload.index

		if (payload.event instanceof MouseEvent) {
			document.addEventListener('mousemove', handleMouseMove)
			document.addEventListener('mouseup', handleMouseUp)
		} else {
			document.addEventListener('touchmove', handleTouchMove)
			document.addEventListener('touchend', handleTouchEnd)
		}
	}

	function nearestIndex(value: number): number {
		let best = 0
		let bestDistance = Math.abs(value - pointValues.value[0])
		for (let i = 1; i < pointValues.value.length; i += 1) {
			const distance = Math.abs(value - pointValues.value[i])
			if (distance < bestDistance) {
				best = i
				bestDistance = distance
			}
		}
		return best
	}

	function handleTrackDown(e: MouseEvent): void {
		if (isDisabled()) return
		const value = getValueFromEvent(e)
		const index = nearestIndex(value)
		activeIndex.value = index
		setPointValue(index, value)
		document.addEventListener('mousemove', handleMouseMove)
		document.addEventListener('mouseup', handleMouseUp)
	}

	function handleThumbKeydown(payload: { event: KeyboardEvent; index: number }): void {
		if (isDisabled()) return

		const { event, index } = payload
		const isIncrease = event.key === 'ArrowRight' || event.key === 'ArrowUp'
		const isDecrease = event.key === 'ArrowLeft' || event.key === 'ArrowDown'
		if (!isIncrease && !isDecrease) return
		event.preventDefault()

		const delta = isIncrease ? options.step() : -options.step()
		setPointValue(index, snapToStepValue(pointValues.value[index] + delta))
	}

	onBeforeUnmount(() => {
		document.removeEventListener('mousemove', handleMouseMove)
		document.removeEventListener('mouseup', handleMouseUp)
		document.removeEventListener('touchmove', handleTouchMove)
		document.removeEventListener('touchend', handleTouchEnd)
	})

	return {
		activeIndex,
		handleThumbDown,
		handleTrackDown,
		handleThumbKeydown,
	}
}

export { useRangeDrag }
