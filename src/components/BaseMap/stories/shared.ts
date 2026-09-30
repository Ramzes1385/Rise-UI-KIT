import type { MapMarker } from '../types/BaseMap.types'

export const MOSCOW = { lat: 55.751244, lng: 37.618423 }

export const OFFICES: MapMarker[] = [
	{ id: 'kremlin', coordinates: { lat: 55.752, lng: 37.6175 }, title: 'Красная площадь' },
	{ id: 'arbat', coordinates: { lat: 55.7494, lng: 37.5912 }, title: 'Арбат', color: 'var(--rise-success)' },
	{ id: 'park', coordinates: { lat: 55.7298, lng: 37.6011 }, title: 'Парк Горького', color: 'var(--rise-warning)' },
	{ id: 'city', coordinates: { lat: 55.7494, lng: 37.5395 }, title: 'Москва-Сити', color: 'var(--rise-info)' },
]
