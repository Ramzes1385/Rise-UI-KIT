import type { FlowViewport } from '../../types/api/flowController.types'
import { FLOW_MINIMAP_SIZE } from '../../types/internal/flowPanels.types'
import type { FlowMinimapTransform } from '../../types/internal/flowPanels.types'
import type { FlowPoint, FlowRect, FlowSize } from '../../types/data/flowData.types'

const PADDING = 6
const KEY_STEP = 0.1

const SHIFTS: Record<string, FlowPoint> = {
	ArrowLeft: { x: -1, y: 0 },
	ArrowRight: { x: 1, y: 0 },
	ArrowUp: { x: 0, y: -1 },
	ArrowDown: { x: 0, y: 1 },
}

export function minimapTransform(bounds: FlowRect, size: FlowSize = FLOW_MINIMAP_SIZE): FlowMinimapTransform {
	const width = Math.max(bounds.width, 1)
	const height = Math.max(bounds.height, 1)
	const scale = Math.min((size.width - PADDING * 2) / width, (size.height - PADDING * 2) / height)
	return {
		scale,
		offsetX: (size.width - width * scale) / 2 - bounds.x * scale,
		offsetY: (size.height - height * scale) / 2 - bounds.y * scale,
	}
}

export function toMinimapRect(rect: FlowRect, transform: FlowMinimapTransform): FlowRect {
	return {
		x: rect.x * transform.scale + transform.offsetX,
		y: rect.y * transform.scale + transform.offsetY,
		width: rect.width * transform.scale,
		height: rect.height * transform.scale,
	}
}

export function fromMinimapPoint(point: FlowPoint, transform: FlowMinimapTransform): FlowPoint {
	return { x: (point.x - transform.offsetX) / transform.scale, y: (point.y - transform.offsetY) / transform.scale }
}

export function visibleCanvasRect(viewport: FlowViewport, frame: FlowSize): FlowRect {
	return {
		x: -viewport.x / viewport.zoom,
		y: -viewport.y / viewport.zoom,
		width: frame.width / viewport.zoom,
		height: frame.height / viewport.zoom,
	}
}

export function viewportCenteredOn(center: FlowPoint, viewport: FlowViewport, frame: FlowSize): FlowViewport {
	return {
		zoom: viewport.zoom,
		x: frame.width / 2 - center.x * viewport.zoom,
		y: frame.height / 2 - center.y * viewport.zoom,
	}
}

export function viewportShiftedByKey(key: string, viewport: FlowViewport, frame: FlowSize): FlowViewport | null {
	const shift = SHIFTS[key]
	if (!shift) return null
	return {
		zoom: viewport.zoom,
		x: viewport.x - shift.x * frame.width * KEY_STEP,
		y: viewport.y - shift.y * frame.height * KEY_STEP,
	}
}

export function pointInMinimap(event: { clientX: number; clientY: number }, box: { left: number; top: number }): FlowPoint {
	return { x: event.clientX - box.left, y: event.clientY - box.top }
}
