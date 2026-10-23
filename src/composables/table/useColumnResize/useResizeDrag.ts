/** Composable: слушатели перетаскивания на document, один кадр на движение и временные стили body на время resize */
import type { SavedBodyStyles, UseResizeDragOptions } from './types/useResizeDrag.types'

/** Откладывает движения до следующего кадра: за кадр обрабатывается только последнее положение указателя */
function createFrameThrottle(run: (event: PointerEvent) => void) {
	let frame = 0
	let pending: PointerEvent | null = null

	function flush(): void {
		if (frame) cancelAnimationFrame(frame)
		frame = 0
		const event = pending
		pending = null
		if (event) run(event)
	}

	return {
		push(event: PointerEvent): void {
			pending = event
			if (!frame) frame = requestAnimationFrame(flush)
		},
		flush,
		cancel(): void {
			if (frame) cancelAnimationFrame(frame)
			frame = 0
			pending = null
		},
	}
}

function useResizeDrag({ onMove, onEnd }: UseResizeDragOptions) {
	/** Стили body до начала перетаскивания: после него возвращаем их, а не затираем пустой строкой */
	let savedBodyStyles: SavedBodyStyles | null = null
	let activePointerId: number | null = null
	const throttle = createFrameThrottle(onMove)

	/** Событие от указателя, который начал перетаскивание (второй палец и чужая мышь не мешают) */
	function isOwn(event: PointerEvent): boolean {
		return activePointerId === null || event.pointerId === undefined || event.pointerId === activePointerId
	}

	function handleMove(event: PointerEvent): void {
		if (isOwn(event)) throttle.push(event)
	}

	function handleEnd(event: PointerEvent): void {
		if (!isOwn(event)) return
		const isCancelled = event.type === 'pointercancel'
		if (isCancelled) throttle.cancel()
		else throttle.flush()
		onEnd(isCancelled)
	}

	/** Повесить слушатели перетаскивания и выставить курсор/запрет выделения на body */
	function attach(event: PointerEvent): void {
		activePointerId = event.pointerId ?? null
		document.addEventListener('pointermove', handleMove)
		document.addEventListener('pointerup', handleEnd)
		document.addEventListener('pointercancel', handleEnd)
		// Повторный старт без pointerup (потерян за пределами окна) не должен перезаписать исходные стили
		if (!savedBodyStyles) {
			savedBodyStyles = { cursor: document.body.style.cursor, userSelect: document.body.style.userSelect }
		}
		document.body.style.cursor = 'col-resize'
		document.body.style.userSelect = 'none'
	}

	/** Снять слушатели перетаскивания, отменить отложенный кадр и вернуть стили body */
	function release(): void {
		document.removeEventListener('pointermove', handleMove)
		document.removeEventListener('pointerup', handleEnd)
		document.removeEventListener('pointercancel', handleEnd)
		throttle.cancel()
		activePointerId = null
		if (savedBodyStyles) {
			document.body.style.cursor = savedBodyStyles.cursor
			document.body.style.userSelect = savedBodyStyles.userSelect
			savedBodyStyles = null
		}
	}

	return { attach, release }
}

export { useResizeDrag }
