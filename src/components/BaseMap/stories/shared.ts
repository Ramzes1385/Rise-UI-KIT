import { installDemoYandex } from './demoProvider'
import { STORY_YANDEX_MAPS_KEY } from '@/stories/helpers'
import type { MapCoordinates, MapMarker, MapPolygon, MapPolyline } from '../types/BaseMap.types'

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

export const ICON_MARKERS: MapMarker[] = [
	{ id: 'office', coordinates: { lat: 55.752, lng: 37.6175 }, title: 'Офис', icon: 'home', size: 36 },
	{ id: 'shop', coordinates: { lat: 55.7494, lng: 37.5912 }, title: 'Магазин', icon: 'star', size: 32, color: 'var(--rise-warning)' },
	{
		id: 'point',
		coordinates: { lat: 55.7298, lng: 37.6011 },
		title: 'Пункт выдачи',
		icon: 'map-pin',
		size: 28,
		color: 'var(--rise-success)',
	},
	{ id: 'alert', coordinates: { lat: 55.7494, lng: 37.5395 }, title: 'Уведомления', icon: 'bell', color: 'var(--rise-info)' },
]

export const NUMBERED_MARKERS: MapMarker[] = [
	{ id: 1, coordinates: { lat: 55.752, lng: 37.6175 }, title: 'Остановка 1', size: 32 },
	{ id: 2, coordinates: { lat: 55.7494, lng: 37.5912 }, title: 'Остановка 2', size: 32 },
	{ id: 3, coordinates: { lat: 55.7298, lng: 37.6011 }, title: 'Остановка 3', size: 32 },
]

export const ROUTE: MapPolyline[] = [
	{
		id: 'courier',
		title: 'Маршрут курьера',
		color: 'var(--rise-primary)',
		width: 5,
		coordinates: [
			{ lat: 55.752, lng: 37.6175 },
			{ lat: 55.7494, lng: 37.5912 },
			{ lat: 55.7298, lng: 37.6011 },
		],
	},
	{
		id: 'walk',
		color: 'rgb(232, 89, 12)',
		coordinates: [
			{ lat: 55.7298, lng: 37.6011 },
			{ lat: 55.7345, lng: 37.62 },
			{ lat: 55.7425, lng: 37.64 },
		],
	},
]

export const ZONES: MapPolygon[] = [
	{
		id: 'delivery',
		title: 'Зона доставки',
		color: 'var(--rise-success)',
		coordinates: [
			{ lat: 55.77, lng: 37.56 },
			{ lat: 55.77, lng: 37.64 },
			{ lat: 55.725, lng: 37.64 },
			{ lat: 55.725, lng: 37.56 },
		],
	},
	{
		id: 'closed',
		title: 'Закрытая зона',
		color: 'rgb(112, 72, 232)',
		width: 3,
		coordinates: [
			{ lat: 55.7, lng: 37.66 },
			{ lat: 55.72, lng: 37.7 },
			{ lat: 55.69, lng: 37.71 },
		],
	},
]

export const REGION_MARKERS: MapMarker[] = [
	...OFFICES,
	{ id: 'tver', coordinates: { lat: 56.8587, lng: 35.9176 }, title: 'Тверь' },
	{ id: 'tula', coordinates: { lat: 54.1961, lng: 37.6182 }, title: 'Тула' },
	{ id: 'vladimir', coordinates: { lat: 56.129, lng: 40.4066 }, title: 'Владимир' },
]

export const CROWD: MapMarker[] = Array.from({ length: 14 }, (_, index) => ({
	id: index + 1,
	coordinates: { lat: 55.73 + ((index * 7) % 10) * 0.006, lng: 37.56 + ((index * 5) % 12) * 0.008 },
	title: `Точка ${index + 1}`,
}))
