/** Composable: переходы тура между шагами и его закрытие с событиями */
import type { ComputedRef } from 'vue'
import type { UseTourCoordinationOptions } from './types/useTourCoordination.types'

/** Описание: смена шага, пропуск, завершение и закрытие по клику на оверлей */
function createTourNavigation(options: UseTourCoordinationOptions, resolvedCloseOnOverlayClick: ComputedRef<boolean>) {
	const { emit, internalIndex, isFirst, isLast } = options

	function setIndex(value: number): void {
		internalIndex.value = value
		emit('update:step', value)
		emit('change', value)
	}

	function goNext(): void {
		if (isLast.value) return
		const next = internalIndex.value + 1
		setIndex(next)
		emit('next', next)
	}

	function goPrev(): void {
		if (isFirst.value) return
		const prev = internalIndex.value - 1
		setIndex(prev)
		emit('prev', prev)
	}

	function close(): void {
		emit('update:isOpen', false)
		emit('close')
	}

	function handleSkip(): void {
		emit('skip')
		close()
	}

	function handleFinish(): void {
		emit('finish')
		close()
	}

	function handleOverlayClick(): void {
		if (resolvedCloseOnOverlayClick.value) handleSkip()
	}

	return { setIndex, goNext, goPrev, close, handleSkip, handleFinish, handleOverlayClick }
}

export { createTourNavigation }
