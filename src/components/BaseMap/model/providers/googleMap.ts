import { loadProviderApi } from './apiScript'
import { loadScript } from '@utils/dom/scriptUtils'
import { createMarkerElement } from './markerElement'
import type {
	GoogleMapInstance,
	GoogleMapsApi,
	GoogleMarker,
	GoogleShape,
	MapAdapterFactory,
	MapGestures,
	MapHandlers,
	MapMarkerItem,
	MapShapeLine,
	MapShapes,
	MapsWindow,
} from '../../types/providers.types'

const CALLBACK = '__riseGoogleMapsReady'

const GOOGLE_SCHEMES = { light: 'LIGHT', dark: 'DARK' } as const

const GOOGLE_TYPES = { scheme: 'roadmap', satellite: 'satellite', hybrid: 'hybrid' } as const

const googleGestures = ({ isDraggable, isScrollZoom }: MapGestures) => ({ draggable: isDraggable, scrollwheel: isScrollZoom })

async function googleApi(apiKey: string, language: string): Promise<GoogleMapsApi> {
	const maps = window as unknown as MapsWindow
	await loadProviderApi({
		provider: 'google',
		apiKey,
		language,
		isLoaded: () => Boolean(maps.google?.maps?.Map),
		load: lang => {
			const query = `key=${encodeURIComponent(apiKey)}&language=${lang}&libraries=marker&loading=async&callback=${CALLBACK}`
			return loadScript(`https://maps.googleapis.com/maps/api/js?${query}`, { callbackName: CALLBACK })
		},
	})
	return maps.google?.maps as GoogleMapsApi
}

function markerLayer(api: GoogleMapsApi, map: GoogleMapInstance, handlers: MapHandlers) {
	let shown: GoogleMarker[] = []
	const clear = (): void => {
		for (const marker of shown) marker.map = null
		shown = []
	}
	const set = (markers: readonly MapMarkerItem[]): void => {
		clear()
		const hosts = markers.map(marker => createMarkerElement(marker, handlers.onMarkerClick))
		shown = hosts.map(host => {
			host.anchor.classList.add('base-map__anchor--anchored')
			const { marker, anchor: content } = host
			return new api.marker.AdvancedMarkerElement({ map, position: marker.coordinates, title: marker.title, content })
		})
		handlers.onMarkersRendered(hosts)
	}
	return { set, clear }
}

const FILL_OPACITY = 0.2

function shapeLayer(api: GoogleMapsApi, map: GoogleMapInstance) {
	let shown: GoogleShape[] = []
	const clear = (): void => {
		for (const shape of shown) shape.setMap(null)
		shown = []
	}
	const set = ({ polylines, polygons }: MapShapes): void => {
		clear()
		const base = (line: MapShapeLine) => ({ map, strokeColor: line.color, strokeWeight: line.width })
		const lines = polylines.map(line => new api.Polyline({ ...base(line), path: line.coordinates }))
		const areas = polygons.map(
			line => new api.Polygon({ ...base(line), paths: line.coordinates, fillColor: line.color, fillOpacity: FILL_OPACITY }),
		)
		shown = [...lines, ...areas]
	}
	return { set, clear }
}

export const createGoogleMap: MapAdapterFactory = async (element, { apiKey, language, view, mapId, scheme, layer, gestures, handlers }) => {
	const api = await googleApi(apiKey, language)
	const map = new api.Map(element, {
		center: view.center,
		zoom: view.zoom,
		mapId: mapId as string,
		colorScheme: GOOGLE_SCHEMES[scheme],
		mapTypeId: GOOGLE_TYPES[layer],
		gestureHandling: 'greedy',
		...googleGestures(gestures),
	})
	map.addListener('idle', () => {
		const center = map.getCenter()
		if (center) handlers.onViewChange({ center: { lat: center.lat(), lng: center.lng() }, zoom: map.getZoom() ?? view.zoom })
	})
	map.addListener('click', event => {
		if (event.latLng) handlers.onClick({ lat: event.latLng.lat(), lng: event.latLng.lng() })
	})
	const markers = markerLayer(api, map, handlers)
	const shapes = shapeLayer(api, map)
	return {
		setView: next => {
			map.setCenter(next.center)
			map.setZoom(next.zoom)
		},
		setMarkers: markers.set,
		setLayer: next => map.setMapTypeId(GOOGLE_TYPES[next]),
		setGestures: next => map.setOptions(googleGestures(next)),
		setShapes: shapes.set,
		destroy: () => {
			markers.clear()
			shapes.clear()
			api.event.clearInstanceListeners(map)
			element.replaceChildren()
		},
	}
}
