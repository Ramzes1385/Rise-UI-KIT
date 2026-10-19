import { onBeforeUnmount } from 'vue'
import type { Scene3DPointerOptions, Scene3DPointerSpot } from '../types/internal/scene3dInternal.types'

const DRAG_THRESHOLD = 4

function useHoverFrame(options: Scene3DPointerOptions) {
	let frame = 0

	const pick = (at: Scene3DPointerSpot): string | null => options.markerAt?.(at.target) ?? options.pickAt(at.x, at.y)

	function flush(at: Scene3DPointerSpot): void {
		frame = 0
		options.setHover(pick(at))
	}

	function cancel(): void {
		if (frame) cancelAnimationFrame(frame)
		frame = 0
	}

	onBeforeUnmount(cancel)

	return {
		pick,
		cancel,
		request(next: Scene3DPointerSpot): void {
			if (frame) cancelAnimationFrame(frame)
			frame = requestAnimationFrame(() => flush(next))
		},
	}
}

export function useScenePointer(options: Scene3DPointerOptions) {
	const hover = useHoverFrame(options)
	let start: { x: number; y: number } | null = null

	return {
		onPointerDown(event: PointerEvent): void {
			start = { x: event.clientX, y: event.clientY }
		},
		onPointerMove(event: PointerEvent): void {
			if (event.pointerType === 'touch' || event.buttons) return
			hover.request({ target: event.target, x: event.clientX, y: event.clientY })
		},
		onPointerLeave(): void {
			hover.cancel()
			options.setHover(null)
		},
		onClick(event: MouseEvent): void {
			const from = start
			start = null
			if (from && Math.hypot(event.clientX - from.x, event.clientY - from.y) > DRAG_THRESHOLD) return
			const id = hover.pick({ target: event.target, x: event.clientX, y: event.clientY })
			if (id) options.activate(id, event)
		},
	}
}
