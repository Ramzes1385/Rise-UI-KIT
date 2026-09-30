import type { MapCoordinates, MapMarker, MapView } from './BaseMap.types'

/** Обработчики событий карты, которые адаптер поставщика вызывает сам */
export interface MapHandlers {
	/** Карта перемещена или масштаб изменён пользователем */
	onViewChange: (view: MapView) => void
	/** Клик по карте */
	onClick: (coordinates: MapCoordinates) => void
	/** Клик по метке или Enter на ней */
	onMarkerClick: (marker: MapMarker) => void
}

/** Настройки создания карты у поставщика */
interface MapCreateOptions {
	apiKey: string
	language: string
	view: MapView
	mapId?: string
	handlers: MapHandlers
}

/** Карта поставщика за общим интерфейсом: вид, метки, удаление */
export interface MapAdapter {
	setView: (view: MapView) => void
	setMarkers: (markers: readonly MapMarker[]) => void
	destroy: () => void
}

/** Создаёт карту поставщика в элементе */
export type MapAdapterFactory = (element: HTMLElement, options: MapCreateOptions) => Promise<MapAdapter>

/** Поставщик: создание карты, язык по тегу Intl (`ru-RU`), название для текстов, нужен ли Map ID */
export interface MapProviderEntry {
	create: MapAdapterFactory
	isMapIdRequired?: boolean
	language: (intl: string) => string
	name: () => string
}

/** Нужная киту часть Яндекс Карт API v3: `ymaps3` */
export interface YandexMapsApi {
	ready: Promise<void>
	YMap: new (element: HTMLElement, props: { location: { center: [number, number]; zoom: number } }) => YandexMapInstance
	YMapDefaultSchemeLayer: new (props: object) => object
	YMapDefaultFeaturesLayer: new (props: object) => object
	YMapListener: new (props: YandexListenerProps) => object
	YMapMarker: new (props: { coordinates: [number, number] }, element: HTMLElement) => object
}

/** Карта Яндекса */
export interface YandexMapInstance {
	addChild: (child: object) => void
	removeChild: (child: object) => void
	setLocation: (location: { center: [number, number]; zoom: number }) => void
	destroy: () => void
}

/** Обработчики слушателя Яндекса: конец действия пользователя и клик */
interface YandexListenerProps {
	layer: string
	onActionEnd: (event: { location: { center: [number, number]; zoom: number } }) => void
	onClick: (object: unknown, event: { coordinates: [number, number] }) => void
}

/** Окно с загруженными API поставщиков */
export interface MapsWindow {
	ymaps3?: YandexMapsApi
	google?: { maps?: GoogleMapsApi }
}

/** Точка Google Maps */
interface GoogleLatLng {
	lat: () => number
	lng: () => number
}

/** Подписка на событие Google Maps */
interface GoogleListener {
	remove: () => void
}

/** Карта Google */
export interface GoogleMapInstance {
	addListener: (name: string, handler: (event: { latLng?: GoogleLatLng | null }) => void) => GoogleListener
	getCenter: () => GoogleLatLng | undefined
	getZoom: () => number | undefined
	setCenter: (center: MapCoordinates) => void
	setZoom: (zoom: number) => void
}

/** Метка Google: `map = null` убирает её с карты */
export interface GoogleMarker {
	map: GoogleMapInstance | null
}

/** Нужная киту часть Google Maps JavaScript API: `google.maps` с библиотекой `marker` */
export interface GoogleMapsApi {
	Map: new (element: HTMLElement, options: { center: MapCoordinates; zoom: number; mapId: string }) => GoogleMapInstance
	marker: {
		AdvancedMarkerElement: new (options: {
			map: GoogleMapInstance
			position: MapCoordinates
			title?: string
			content: HTMLElement
		}) => GoogleMarker
	}
	event: { clearInstanceListeners: (instance: object) => void }
}
