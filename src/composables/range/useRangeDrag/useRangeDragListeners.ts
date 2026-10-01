/** Composable: подписки документа на время перетаскивания ползунка range-слайдера (мышь и касание) */
import { onBeforeUnmount } from 'vue'
import type { RangeDragKind, UseRangeDragListenersOptions } from './types/useRangeDrag.types'

/** Описание: подписывает документ на движение и отпускание указателя; отписка — по отпусканию и при размонтировании */
function useRangeDragListeners({ activeIndex, onMove, onEnd }: UseRangeDragListenersOptions) {
	function handleMouseMove(ev: MouseEvent): void {
		/* istanbul ignore next -- Защитный выход без активного drag. */
		if (activeIndex.value === null) return
		onMove(activeIndex.value, ev)
	}

	function handleTouchMove(ev: TouchEvent): void {
		/* istanbul ignore next -- Защитный выход без активного touch drag. */
		if (activeIndex.value === null) return
		onMove(activeIndex.value, ev)
	}

	function handleMouseUp(): void {
		activeIndex.value = null
		removeListeners('mouse')
		onEnd()
	}

	function handleTouchEnd(): void {
		activeIndex.value = null
		removeListeners('touch')
		onEnd()
	}

	function addListeners(kind: RangeDragKind): void {
		if (kind === 'mouse') {
			document.addEventListener('mousemove', handleMouseMove)
			document.addEventListener('mouseup', handleMouseUp)
		} else {
			document.addEventListener('touchmove', handleTouchMove)
			document.addEventListener('touchend', handleTouchEnd)
		}
	}

	function removeListeners(kind: RangeDragKind): void {
		if (kind === 'mouse') {
			document.removeEventListener('mousemove', handleMouseMove)
			document.removeEventListener('mouseup', handleMouseUp)
		} else {
			document.removeEventListener('touchmove', handleTouchMove)
			document.removeEventListener('touchend', handleTouchEnd)
		}
	}

	onBeforeUnmount(() => {
		removeListeners('mouse')
		removeListeners('touch')
	})

	return { addListeners }
}

export { useRangeDragListeners }
