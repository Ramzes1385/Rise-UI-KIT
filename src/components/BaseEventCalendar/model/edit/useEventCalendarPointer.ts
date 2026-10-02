import { onBeforeUnmount } from 'vue'
import type { PointerTrackHandlers, ScreenPoint } from '../../types/BaseEventCalendarModel.types'

function pointOf(event: PointerEvent): ScreenPoint {
	return { x: event.clientX, y: event.clientY }
}

export function useEventCalendarPointer() {
	let stop: (() => void) | null = null
	onBeforeUnmount(() => stop?.())
	return function track(handlers: PointerTrackHandlers): void {
		stop?.()
		const move = (event: PointerEvent): void => handlers.move(pointOf(event))
		const up = (event: PointerEvent): void => {
			stop?.()
			handlers.up(pointOf(event))
		}
		const cancel = (): void => {
			stop?.()
			handlers.cancel()
		}
		const key = (event: KeyboardEvent): void => {
			if (event.key !== 'Escape') return
			event.preventDefault()
			cancel()
		}
		window.addEventListener('pointermove', move)
		window.addEventListener('pointerup', up)
		window.addEventListener('pointercancel', cancel)
		window.addEventListener('keydown', key)
		stop = (): void => {
			window.removeEventListener('pointermove', move)
			window.removeEventListener('pointerup', up)
			window.removeEventListener('pointercancel', cancel)
			window.removeEventListener('keydown', key)
			stop = null
		}
	}
}
