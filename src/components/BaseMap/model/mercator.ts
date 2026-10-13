import type { MapCoordinates } from '../types/BaseMap.types'

export const TILE = 256

export const mercatorX = (lng: number): number => (lng + 180) / 360

export const mercatorY = (lat: number): number => {
	const sin = Math.sin((Math.max(-85, Math.min(85, lat)) * Math.PI) / 180)
	return 0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)
}

const round = (value: number): number => Math.round(value * 1e6) / 1e6

export const fromMercator = (x: number, y: number): MapCoordinates => ({
	lat: round((Math.atan(Math.sinh(Math.PI * (1 - 2 * y))) * 180) / Math.PI),
	lng: round(x * 360 - 180),
})
