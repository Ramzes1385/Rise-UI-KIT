import type { FlowPoint } from '../../../types/data/flowData.types'
import type { FlowEditTrack } from '../../../types/internal/edit/flowEditApi.types'

const START_DISTANCE = 4

export function trackPointer(event: PointerEvent, handlers: FlowEditTrack): () => void {
	const origin: FlowPoint = { x: event.clientX, y: event.clientY }
	let isStarted = false
	const move = (next: PointerEvent): void => {
		const distance = Math.hypot(next.clientX - origin.x, next.clientY - origin.y)
		if (!isStarted && distance < START_DISTANCE) return
		if (!isStarted) handlers.onStart?.(next)
		isStarted = true
		handlers.onMove(next)
	}
	const stop = (): void => {
		window.removeEventListener('pointermove', move)
		window.removeEventListener('pointerup', up)
		window.removeEventListener('pointercancel', cancel)
	}
	const up = (next: PointerEvent): void => {
		stop()
		handlers.onEnd(next, isStarted)
	}
	const cancel = (next: PointerEvent): void => {
		stop()
		handlers.onEnd(next, false)
	}
	window.addEventListener('pointermove', move)
	window.addEventListener('pointerup', up)
	window.addEventListener('pointercancel', cancel)
	return stop
}
