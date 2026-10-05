import type { ScenePointerOptions } from '../../types/internal/imageMap3dInternal.types'
import { IMAGE_MAP_OBJECT_ATTR } from '@components/BaseImageMap/types/internal/imageMapModel.types'

const DRAG_THRESHOLD = 4

function markerIdOf(target: EventTarget | null): string | null {
	return target instanceof Element ? (target.closest(`[${IMAGE_MAP_OBJECT_ATTR}]`)?.getAttribute(IMAGE_MAP_OBJECT_ATTR) ?? null) : null
}

export function useScenePointer(options: ScenePointerOptions) {
	let start: { x: number; y: number } | null = null

	const pick = (event: MouseEvent): string | null => markerIdOf(event.target) ?? options.pickAt(event.clientX, event.clientY)

	return {
		onPointerDown(event: PointerEvent): void {
			start = { x: event.clientX, y: event.clientY }
		},
		onPointerMove(event: PointerEvent): void {
			if (event.pointerType === 'touch' || event.buttons) return
			options.setHover(pick(event))
		},
		onPointerLeave(): void {
			options.setHover(null)
		},
		onClick(event: MouseEvent): void {
			const from = start
			start = null
			if (from && Math.hypot(event.clientX - from.x, event.clientY - from.y) > DRAG_THRESHOLD) return
			const id = pick(event)
			if (id) options.activate(id, event)
		},
	}
}
