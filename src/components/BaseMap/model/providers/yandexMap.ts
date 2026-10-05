import { loadProviderApi } from './apiScript'
import { loadScript } from '@utils/dom/scriptUtils'
import { createMarkerElement } from './markerElement'
import type { MapCoordinates, MapMarker, MapView } from '../../types/BaseMap.types'
import type { MapAdapterFactory, MapsWindow, YandexMapInstance, YandexMapsApi } from '../../types/providers.types'

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

function markerLayer(api: YandexMapsApi, map: YandexMapInstance, onClick: (marker: MapMarker) => void) {
	let shown: object[] = []
	return (markers: readonly MapMarker[]): void => {
		for (const child of shown) map.removeChild(child)
		shown = markers.map(
			marker => new api.YMapMarker({ coordinates: toYandex(marker.coordinates) }, createMarkerElement(marker, onClick)),
		)
		for (const child of shown) map.addChild(child)
	}
}

export const createYandexMap: MapAdapterFactory = async (element, { apiKey, language, view, handlers }) => {
	const api = await yandexApi(apiKey, language)
	const map = new api.YMap(element, { location: location(view) })
	map.addChild(new api.YMapDefaultSchemeLayer({}))
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
		setMarkers: markerLayer(api, map, handlers.onMarkerClick),
		destroy: () => map.destroy(),
	}
}
