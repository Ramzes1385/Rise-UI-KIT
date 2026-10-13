import { loadProviderApi } from './apiScript'
import { loadScript } from '@utils/dom/scriptUtils'
import { createMarkerElement } from './markerElement'
import type { MapCoordinates, MapMarker, MapView } from '../../types/BaseMap.types'
import type {
	MapAdapterFactory,
	MapHandlers,
	MapShapeLine,
	MapShapes,
	MapsWindow,
	YandexFeatureProps,
	YandexMapInstance,
	YandexMapsApi,
} from '../../types/providers.types'

const toYandex = (point: MapCoordinates): [number, number] => [point.lng, point.lat]

const fromYandex = ([lng, lat]: [number, number]): MapCoordinates => ({ lat, lng })

const location = (view: MapView) => ({ center: toYandex(view.center), zoom: view.zoom })

async function yandexApi(apiKey: string, language: string): Promise<YandexMapsApi> {
	const maps = window as unknown as MapsWindow
	await loadProviderApi({
		provider: 'yandex',
		apiKey,
		language,
		isLoaded: () => Boolean(maps.ymaps3),
		load: lang => loadScript(`https://api-maps.yandex.ru/v3/?apikey=${encodeURIComponent(apiKey)}&lang=${lang}`),
	})
	const api = maps.ymaps3 as YandexMapsApi
	await api.ready
	return api
}

function markerLayer(api: YandexMapsApi, map: YandexMapInstance, handlers: MapHandlers) {
	let shown: object[] = []
	return (markers: readonly MapMarker[]): void => {
		for (const child of shown) map.removeChild(child)
		const hosts = markers.map(marker => createMarkerElement(marker, handlers.onMarkerClick))
		shown = hosts.map(host => new api.YMapMarker({ coordinates: toYandex(host.marker.coordinates) }, host.anchor))
		for (const child of shown) map.addChild(child)
		handlers.onMarkersRendered(hosts)
	}
}

const FILL_OPACITY = 0.2

function featureOf(line: MapShapeLine, isPolygon: boolean): YandexFeatureProps {
	const points = line.coordinates.map(toYandex)
	const stroke = [{ color: line.color, width: line.width }]
	if (isPolygon)
		return {
			geometry: { type: 'Polygon', coordinates: [[...points, points[0]!]] },
			style: { stroke, fill: line.color, fillOpacity: FILL_OPACITY },
		}
	return { geometry: { type: 'LineString', coordinates: points }, style: { stroke } }
}

function shapeLayer(api: YandexMapsApi, map: YandexMapInstance) {
	let shown: object[] = []
	return ({ polylines, polygons }: MapShapes): void => {
		for (const child of shown) map.removeChild(child)
		const features = [...polylines.map(line => featureOf(line, false)), ...polygons.map(line => featureOf(line, true))]
		shown = features.map(feature => new api.YMapFeature(feature))
		for (const child of shown) map.addChild(child)
	}
}

export const createYandexMap: MapAdapterFactory = async (element, { apiKey, language, view, scheme, handlers }) => {
	const api = await yandexApi(apiKey, language)
	const map = new api.YMap(element, { location: location(view) })
	const schemeLayer = new api.YMapDefaultSchemeLayer({ theme: scheme })
	map.addChild(schemeLayer)
	map.addChild(new api.YMapDefaultFeaturesLayer({}))
	map.addChild(
		new api.YMapListener({
			layer: 'any',
			onActionEnd: event => handlers.onViewChange({ center: fromYandex(event.location.center), zoom: event.location.zoom }),
			onClick: (_object, event) => handlers.onClick(fromYandex(event.coordinates)),
		}),
	)
	return {
		setView: next => map.setLocation(location(next)),
		setMarkers: markerLayer(api, map, handlers),
		setShapes: shapeLayer(api, map),
		setScheme: next => schemeLayer.update({ theme: next }),
		destroy: () => map.destroy(),
	}
}
