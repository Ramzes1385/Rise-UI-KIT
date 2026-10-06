import { onBeforeUnmount } from 'vue'
import { IMAGE_MAP_OBJECT_ATTR } from '@components/BaseImageMap/types/internal/imageMapModel.types'
import type { PointerSpot, ScenePointerOptions } from '../../types/internal/imageMap3dInternal.types'

const DRAG_THRESHOLD = 4

function markerIdOf(target: EventTarget | null): string | null {
	return target instanceof Element ? (target.closest(`[${IMAGE_MAP_OBJECT_ATTR}]`)?.getAttribute(IMAGE_MAP_OBJECT_ATTR) ?? null) : null
}

function useHoverFrame(options: ScenePointerOptions) {
	let spot: PointerSpot | null = null
	let frame = 0

	const pick = (at: PointerSpot): string | null => markerIdOf(at.target) ?? options.pickAt(at.x, at.y)

	function flush(): void {
		frame = 0
		if (spot) options.setHover(pick(spot))
		spot = null
	}

	function cancel(): void {
		if (frame) cancelAnimationFrame(frame)
		frame = 0
		spot = null
	}

	onBeforeUnmount(cancel)

	return {
		pick,
		cancel,
		request(next: PointerSpot): void {
			spot = next
			if (!frame) frame = requestAnimationFrame(flush)
		},
	}
}

export function useScenePointer(options: ScenePointerOptions) {
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
