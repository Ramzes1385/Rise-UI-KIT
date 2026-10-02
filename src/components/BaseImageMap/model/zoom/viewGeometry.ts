import type { ImageMapArea } from '../../types/imageMapData.types'
import type { ImageMapView } from '../../types/imageMapModel.types'
import type { Frame, ScreenPoint } from '../../types/imageMapInternal.types'

export function fitStage(
	viewport: { width: number; height: number },
	layer: { width: number; height: number },
): { width: number; height: number } {
	if (!viewport.width || !viewport.height || !layer.width || !layer.height) return { width: viewport.width, height: viewport.height }
	const scale = Math.min(viewport.width / layer.width, viewport.height / layer.height)
	return { width: layer.width * scale, height: layer.height * scale }
}

function clampAxis(offset: number, content: number, viewport: number): number {
	if (content <= viewport) return (viewport - content) / 2
	return Math.min(0, Math.max(viewport - content, offset))
}

export function clampView(view: ImageMapView, frame: Frame): ImageMapView {
	return {
		scale: view.scale,
		x: clampAxis(view.x, frame.stageWidth * view.scale, frame.viewportWidth),
		y: clampAxis(view.y, frame.stageHeight * view.scale, frame.viewportHeight),
	}
}

export function zoomAround(view: ImageMapView, point: ScreenPoint, scale: number): ImageMapView {
	const ratio = scale / view.scale
	return { scale, x: point.x - (point.x - view.x) * ratio, y: point.y - (point.y - view.y) * ratio }
}

export function clampScale(scale: number, maxScale: number): number {
	return Math.min(Math.max(scale, 1), Math.max(1, maxScale))
}

export function fitArea(area: ImageMapArea, frame: Frame, scale: number): ImageMapView {
	const centerX = (area.x + area.width / 2) * frame.stageWidth * scale
	const centerY = (area.y + area.height / 2) * frame.stageHeight * scale
	return { scale, x: frame.viewportWidth / 2 - centerX, y: frame.viewportHeight / 2 - centerY }
}

export function scaleForArea(area: ImageMapArea, frame: Frame, share: number): number {
	const byWidth = area.width ? (frame.viewportWidth * share) / (area.width * frame.stageWidth) : Infinity
	const byHeight = area.height ? (frame.viewportHeight * share) / (area.height * frame.stageHeight) : Infinity
	return Math.min(byWidth, byHeight)
}
