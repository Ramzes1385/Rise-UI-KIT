import { onBeforeUnmount, ref } from 'vue'

interface UseRangeDragOptions {
	trackRef: { value: HTMLElement | null }
	pointValues: { value: number[] }
	isDisabled: { value: boolean }
	min: { value: number }
	max: { value: number }
	step: { value: number }
	isVertical: { value: boolean }
	thumbMin: (index: number) => number
	thumbMax: (index: number) => number
	snapToStepValue: (value: number) => number
	setPointValue: (index: number, rawValue: number) => void
	emitChange: () => void
}

interface UseRangeDragReturn {
	activeIndex: ReturnType<typeof ref<number | null>>
	handleThumbDown: (payload: { event: MouseEvent | TouchEvent; index: number }) => void
	handleTrackDown: (e: MouseEvent) => void
	handleThumbKeydown: (payload: { event: KeyboardEvent; index: number }) => void
}

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
		if (!trackRef.value) return min.value
		const rect = trackRef.value.getBoundingClientRect()
		const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
		const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

		let ratio: number
		if (isVertical.value) {
			ratio = 1 - (clientY - rect.top) / rect.height
		} else {
			ratio = (clientX - rect.left) / rect.width
		}

		ratio = Math.max(0, Math.min(1, ratio))
		const raw = min.value + ratio * (max.value - min.value)
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
		if (isDisabled.value) return
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
		if (isDisabled.value) return
		const value = getValueFromEvent(e)
		const index = nearestIndex(value)
		activeIndex.value = index
		setPointValue(index, value)
		document.addEventListener('mousemove', handleMouseMove)
		document.addEventListener('mouseup', handleMouseUp)
	}

	function handleThumbKeydown(payload: { event: KeyboardEvent; index: number }): void {
		if (isDisabled.value) return

		const { event, index } = payload
		const isIncrease = event.key === 'ArrowRight' || event.key === 'ArrowUp'
		const isDecrease = event.key === 'ArrowLeft' || event.key === 'ArrowDown'
		if (!isIncrease && !isDecrease) return
		event.preventDefault()

		const delta = isIncrease ? options.step.value : -options.step.value
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
