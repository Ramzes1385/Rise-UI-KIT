import { loadProviderApi } from './apiScript'
import { loadScript } from '@utils/dom/scriptUtils'
import { createMarkerElement } from './markerElement'
import type { MapMarker } from '../../types/BaseMap.types'
import type { GoogleMapInstance, GoogleMapsApi, GoogleMarker, MapAdapterFactory, MapsWindow } from '../../types/providers.types'

const CALLBACK = '__riseGoogleMapsReady'

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

function markerLayer(api: GoogleMapsApi, map: GoogleMapInstance, onClick: (marker: MapMarker) => void) {
	let shown: GoogleMarker[] = []
	const clear = (): void => {
		for (const marker of shown) marker.map = null
		shown = []
	}
	const set = (markers: readonly MapMarker[]): void => {
		clear()
		shown = markers.map(marker => {
			const content = createMarkerElement(marker, onClick)
			content.classList.add('base-map__marker--anchored')
			return new api.marker.AdvancedMarkerElement({ map, position: marker.coordinates, title: marker.title, content })
		})
	}
	return { set, clear }
}

export const createGoogleMap: MapAdapterFactory = async (element, { apiKey, language, view, mapId, handlers }) => {
	const api = await googleApi(apiKey, language)
	const map = new api.Map(element, { center: view.center, zoom: view.zoom, mapId: mapId as string })
	map.addListener('idle', () => {
		const center = map.getCenter()
		if (center) handlers.onViewChange({ center: { lat: center.lat(), lng: center.lng() }, zoom: map.getZoom() ?? view.zoom })
	})
	map.addListener('click', event => {
		if (event.latLng) handlers.onClick({ lat: event.latLng.lat(), lng: event.latLng.lng() })
	})
	const markers = markerLayer(api, map, handlers.onMarkerClick)
	return {
		setView: next => {
			map.setCenter(next.center)
			map.setZoom(next.zoom)
		},
		setMarkers: markers.set,
		destroy: () => {
			markers.clear()
			api.event.clearInstanceListeners(map)
			element.replaceChildren()
		},
	}
}
