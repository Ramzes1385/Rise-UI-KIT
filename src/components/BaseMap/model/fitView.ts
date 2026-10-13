import type { MapFitBox } from '../types/providers.types'
import type { MapCoordinates, MapView } from '../types/BaseMap.types'

const TILE = 256
const MAX_ZOOM = 21
const FIT_MAX_ZOOM = 17

const mercatorX = (lng: number): number => (lng + 180) / 360

const mercatorY = (lat: number): number => {
	const sin = Math.sin((Math.max(-85, Math.min(85, lat)) * Math.PI) / 180)
	return 0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)
}

const round = (value: number): number => Math.round(value * 1e6) / 1e6

const fromMercator = (x: number, y: number): MapCoordinates => ({
	lat: round((Math.atan(Math.sinh(Math.PI * (1 - 2 * y))) * 180) / Math.PI),
	lng: round(x * 360 - 180),
})

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
