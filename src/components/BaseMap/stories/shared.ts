import { installDemoYandex } from './demoProvider'
import { STORY_YANDEX_MAPS_KEY } from '@/stories/helpers'
import type { MapCoordinates, MapMarker } from '../types/BaseMap.types'

export const MOSCOW = { lat: 55.751244, lng: 37.618423 }

export const OFFICES: MapMarker[] = [
	{ id: 'kremlin', coordinates: { lat: 55.752, lng: 37.6175 }, title: 'Красная площадь' },
	{ id: 'arbat', coordinates: { lat: 55.7494, lng: 37.5912 }, title: 'Арбат', color: 'var(--rise-success)' },
	{ id: 'park', coordinates: { lat: 55.7298, lng: 37.6011 }, title: 'Парк Горького', color: 'var(--rise-warning)' },
	{ id: 'city', coordinates: { lat: 55.7494, lng: 37.5395 }, title: 'Москва-Сити', color: 'var(--rise-info)' },
]

export const CITIES: { name: string; center: MapCoordinates; zoom: number }[] = [
	{ name: 'Москва', center: MOSCOW, zoom: 10 },
	{ name: 'Санкт-Петербург', center: { lat: 59.9343, lng: 30.3351 }, zoom: 11 },
	{ name: 'Казань', center: { lat: 55.7963, lng: 49.1088 }, zoom: 12 },
	{ name: 'Сочи', center: { lat: 43.5855, lng: 39.7231 }, zoom: 13 },
]

export const isLiveMap = STORY_YANDEX_MAPS_KEY !== ''

export const liveOrDemo = {
	args: { apiKey: isLiveMap ? undefined : 'demo' },
	beforeEach: (): (() => void) | undefined => (isLiveMap ? undefined : installDemoYandex()),
}
