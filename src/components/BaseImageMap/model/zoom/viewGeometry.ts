import type { ImageMapArea } from '../../types/imageMapData.types'
import type { SvgLayerSize } from '../../types/internal/svgViewport.types'
import type { ImageMapBox, ImageMapView } from '../../types/internal/imageMapModel.types'
import type { ElementLayout, Frame, ScreenBox, ScreenPoint } from '../../types/internal/imageMapInternal.types'

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

export function retargetView(view: ImageMapView, from: Frame, to: Frame): ImageMapView {
	if (!from.stageWidth || !from.stageHeight || !to.stageWidth || !to.stageHeight) return view
	const fractionX = (from.viewportWidth / 2 - view.x) / (from.stageWidth * view.scale)
	const fractionY = (from.viewportHeight / 2 - view.y) / (from.stageHeight * view.scale)
	return {
		scale: view.scale,
		x: to.viewportWidth / 2 - fractionX * to.stageWidth * view.scale,
		y: to.viewportHeight / 2 - fractionY * to.stageHeight * view.scale,
	}
}

const ROUNDING_TOLERANCE = 1

function axisRatio(page: number, inner: number): number {
	if (!page || !inner || Math.abs(inner - page) <= ROUNDING_TOLERANCE) return 1
	return inner / page
}

export function pageRatio(box: ImageMapBox, size: SvgLayerSize): ScreenPoint {
	return { x: axisRatio(box.width, size.width), y: axisRatio(box.height, size.height) }
}

export function layoutOf(element: HTMLElement): ElementLayout {
	return { width: element.offsetWidth, height: element.offsetHeight, borderLeft: element.clientLeft, borderTop: element.clientTop }
}

export function toViewportPoint(client: ScreenPoint, box: ImageMapBox, layout: ElementLayout): ScreenPoint {
	const ratio = pageRatio(box, layout)
	return { x: (client.x - box.left) * ratio.x - layout.borderLeft, y: (client.y - box.top) * ratio.y - layout.borderTop }
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

function revealAxis(target: [number, number], bounds: [number, number]): number {
	const [start, end] = target
	const [min, max] = bounds
	if (start < min) return min - start
	if (end > max) return Math.max(max - end, min - start)
	return 0
}

export function revealOffset(target: ScreenBox, viewport: ScreenBox, margin: number): ScreenPoint {
	return {
		x: revealAxis([target.left, target.right], [viewport.left + margin, viewport.right - margin]),
		y: revealAxis([target.top, target.bottom], [viewport.top + margin, viewport.bottom - margin]),
	}
}
