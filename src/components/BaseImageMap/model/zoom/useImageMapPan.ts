import type { Ref } from 'vue'
import { ZOOM_STEP } from './useImageMapView'
import { revealOffset } from './viewGeometry'
import type { useImageMapView } from './useImageMapView'

const PAN_SHARE = 0.1
const REVEAL_MARGIN = 16
const PAN_KEYS: Record<string, [number, number]> = { ArrowLeft: [1, 0], ArrowRight: [-1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }

export function useImageMapPan(zoom: ReturnType<typeof useImageMapView>, viewportRef: Ref<HTMLElement | null>) {
	function shift(dx: number, dy: number): void {
		const view = zoom.view.value
		zoom.setView({ ...view, x: view.x + dx, y: view.y + dy }, false)
	}

	return {
		revealElement(element: Element): boolean {
			const viewport = viewportRef.value
			if (!viewport || zoom.isMinZoom.value) return false
			const offset = revealOffset(element.getBoundingClientRect(), viewport.getBoundingClientRect(), REVEAL_MARGIN)
			if (!offset.x && !offset.y) return false
			shift(offset.x, offset.y)
			return true
		},
		zoomAtElement(isZoomIn: boolean, element: Element): void {
			const rect = element.getBoundingClientRect()
			const box = (viewportRef.value as HTMLElement).getBoundingClientRect()
			const point = { x: rect.left + rect.width / 2 - box.left, y: rect.top + rect.height / 2 - box.top }
			zoom.zoomBy(isZoomIn ? ZOOM_STEP : 1 / ZOOM_STEP, point)
		},
		isPanKey: (key: string): boolean => key in PAN_KEYS,
		panByKey(key: string): void {
			const [dx, dy] = PAN_KEYS[key] as [number, number]
			const frame = zoom.frame.value
			shift(dx * frame.viewportWidth * PAN_SHARE, dy * frame.viewportHeight * PAN_SHARE)
		},
	}
}
