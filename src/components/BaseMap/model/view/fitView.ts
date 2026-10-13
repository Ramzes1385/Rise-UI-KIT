import type { MapFitBox } from '../../types/providers.types'
import type { MapCoordinates, MapView } from '../../types/BaseMap.types'
import { TILE, fromMercator, mercatorX, mercatorY } from '../markers/mercator'
const MAX_ZOOM = 21
const FIT_MAX_ZOOM = 17

function zoomFor(extent: number, space: number): number {
	if (extent <= 0) return FIT_MAX_ZOOM
	return Math.log2(Math.max(space, 1) / (extent * TILE))
}

export function fitView(points: readonly MapCoordinates[], box: MapFitBox, single: number): MapView | null {
	if (!points.length) return null
	const xs = points.map(point => mercatorX(point.lng))
	const ys = points.map(point => mercatorY(point.lat))
	const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]
	const center = fromMercator((minX + maxX) / 2, (minY + maxY) / 2)
	if (maxX === minX && maxY === minY) return { center, zoom: single }
	const zoom = Math.min(zoomFor(maxX - minX, box.width - box.padding * 2), zoomFor(maxY - minY, box.height - box.padding * 2))
	return { center, zoom: Math.max(0, Math.min(FIT_MAX_ZOOM, MAX_ZOOM, Math.floor(zoom))) }
}
