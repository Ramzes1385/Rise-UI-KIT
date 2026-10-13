import type { ComputedRef, Ref, ShallowRef } from 'vue'
import type { MapCoordinates, MapMarker, MapView } from './BaseMap.types'

/** Цветовая схема, с которой работает поставщик: `auto` уже разрешена в светлую или тёмную */
export type MapResolvedScheme = 'light' | 'dark'

/** Элементы метки на карте: `anchor` — обёртка (в неё кит кладёт балун), `button` — кнопка метки (в неё — значок или слот) */
export interface MapMarkerHost {
	marker: MapMarker
	anchor: HTMLElement
	button: HTMLButtonElement
}

/** Обработчики событий карты, которые адаптер поставщика вызывает сам */
export interface MapHandlers {
	/** Карта перемещена или масштаб изменён пользователем */
	onViewChange: (view: MapView) => void
	/** Клик по карте */
	onClick: (coordinates: MapCoordinates) => void
	/** Клик по метке или Enter на ней */
	onMarkerClick: (marker: MapMarker) => void
	/** Метки на карте пересозданы: новые элементы для значков, слота и балуна */
	onMarkersRendered: (hosts: MapMarkerHost[]) => void
}

/** Настройки создания карты у поставщика */
interface MapCreateOptions {
	apiKey: string
	language: string
	view: MapView
	mapId?: string
	scheme: MapResolvedScheme
	handlers: MapHandlers
}

/** Линия или контур с готовым цветом (без `var()`): `color` — CSS-цвет, `width` — толщина в px */
export interface MapShapeLine {
	id: string | number
	coordinates: MapCoordinates[]
	color: string
	width: number
}

/** Линии и многоугольники для карты */
export interface MapShapes {
	polylines: MapShapeLine[]
	polygons: MapShapeLine[]
}

/** Карта поставщика за общим интерфейсом: вид, метки, удаление */
export interface MapAdapter {
	setView: (view: MapView) => void
	setMarkers: (markers: readonly MapMarker[]) => void
	setScheme: (scheme: MapResolvedScheme) => void
	setShapes: (shapes: MapShapes) => void
	destroy: () => void
}

/** Создаёт карту поставщика в элементе */
export type MapAdapterFactory = (element: HTMLElement, options: MapCreateOptions) => Promise<MapAdapter>

/** Поставщик: создание карты, язык по тегу Intl (`ru-RU`), название для текстов, нужен ли Map ID */
export interface MapProviderEntry {
	create: MapAdapterFactory
	isMapIdRequired?: boolean
	/** Схема меняется на готовой карте; иначе (Google `colorScheme` задаётся при создании) карта пересоздаётся */
	isSchemeLive: boolean
	language: (intl: string) => string
	name: () => string
}

/** Нужная киту часть Яндекс Карт API v3: `ymaps3` */
export interface YandexMapsApi {
	ready: Promise<void>
	YMap: new (element: HTMLElement, props: { location: { center: [number, number]; zoom: number } }) => YandexMapInstance
	YMapDefaultSchemeLayer: new (props: { theme: MapResolvedScheme }) => YandexSchemeLayer
	YMapDefaultFeaturesLayer: new (props: object) => object
	YMapListener: new (props: YandexListenerProps) => object
	YMapMarker: new (props: { coordinates: [number, number] }, element: HTMLElement) => object
	YMapFeature: new (props: YandexFeatureProps) => object
}

/** Фигура Яндекса: геометрия GeoJSON и стиль (`fillOpacity` — прозрачность заливки) */
export interface YandexFeatureProps {
	geometry: { type: 'LineString'; coordinates: [number, number][] } | { type: 'Polygon'; coordinates: [number, number][][] }
	style: { stroke: { color: string; width: number }[]; fill?: string; fillOpacity?: number }
}

/** Слой схемы Яндекса: `update` меняет тему на месте */
export interface YandexSchemeLayer {
	update: (props: { theme: MapResolvedScheme }) => void
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

/** Линия или многоугольник Google: `setMap(null)` убирает с карты */
export interface GoogleShape {
	setMap: (map: GoogleMapInstance | null) => void
}

/** Параметры линии и многоугольника Google */
export interface GoogleShapeOptions {
	map: GoogleMapInstance
	strokeColor: string
	strokeWeight: number
	fillColor?: string
	fillOpacity?: number
	path?: MapCoordinates[]
	paths?: MapCoordinates[]
}

/** Метка Google: `map = null` убирает её с карты */
export interface GoogleMarker {
	map: GoogleMapInstance | null
}

/** Нужная киту часть Google Maps JavaScript API: `google.maps` с библиотекой `marker` */
export interface GoogleMapsApi {
	Map: new (
		element: HTMLElement,
		options: { center: MapCoordinates; zoom: number; mapId: string; colorScheme: 'LIGHT' | 'DARK' },
	) => GoogleMapInstance
	marker: {
		AdvancedMarkerElement: new (options: {
			map: GoogleMapInstance
			position: MapCoordinates
			title?: string
			content: HTMLElement
		}) => GoogleMarker
	}
	Polyline: new (options: GoogleShapeOptions) => GoogleShape
	Polygon: new (options: GoogleShapeOptions) => GoogleShape
	event: { clearInstanceListeners: (instance: object) => void }
}

/** Загрузка API поставщика для ключа: язык зафиксирован первой загрузкой, `pending` — пока скрипт грузится */
export interface ProviderApiLoad {
	/** Язык, с которым загружен (или грузится) скрипт API */
	language: string
	/** Идущая загрузка; `null` — скрипт уже на странице */
	pending: Promise<void> | null
	/** Языки, о которых уже предупреждали — по одному разу на загрузку */
	warned: Set<string>
}

/** Запрос загрузки API поставщика: `isLoaded` — API уже на странице, `load(language)` — сама загрузка скрипта */
export interface ProviderApiRequest {
	provider: string
	apiKey: string
	language: string
	isLoaded: () => boolean
	load: (language: string) => Promise<void>
}

/** Оформление меток после создания: выбранная метка, слоты и id балуна для `aria-controls` */
export interface MarkerDecoration {
	selectedId: string | number | null
	hasBalloon: boolean
	hasSlot: boolean
	balloonId: string
}

/** Какие слоты передал родитель (нужно только знать, есть ли они) */
export interface MapSlotsInfo {
	marker?: unknown
	balloon?: unknown
}

/** Зависимости адаптера карты: область карты, вид, разрешённая схема и выбор меток */
export interface MapDeps {
	canvasRef: Ref<HTMLElement | null>
	scheme: ComputedRef<MapResolvedScheme>
	selection: {
		hosts: ShallowRef<MapMarkerHost[]>
		dismiss: () => void
		onMarkerClick: (marker: MapMarker) => void
	}
}

/** Размер области карты и отступ для вписывания точек, px */
export interface MapFitBox {
	width: number
	height: number
	padding: number
}

/** Что нужно навигации от карты: адаптер, последний вид и область */
export interface MapNavigationState {
	adapter: Ref<MapAdapter | null>
	lastView: Ref<MapView>
	canvasRef: Ref<HTMLElement | null>
}
