import type { MapLayer } from '../../types/BaseMap.types'
import type { MapGestures, MapResolvedScheme, YandexMapInstance, YandexMapsApi } from '../../types/providers.types'

const LABELS_ONLY = [{ elements: 'geometry', stylers: [{ visibility: 'off' }] }]

const BEHAVIORS = ['drag', 'scrollZoom', 'pinchZoom', 'dblClick', 'oneFingerZoom', 'mouseRotate', 'mouseTilt', 'panTilt']

export function yandexBehaviors({ isDraggable, isScrollZoom }: MapGestures): string[] {
	return BEHAVIORS.filter(name => (isDraggable || name !== 'drag') && (isScrollZoom || name !== 'scrollZoom'))
}

export function createLayers(api: YandexMapsApi, map: YandexMapInstance, theme: MapResolvedScheme) {
	const scheme = new api.YMapDefaultSchemeLayer({ theme })
	const satellite = api.YMapDefaultSatelliteLayer ? new api.YMapDefaultSatelliteLayer({}) : null
	const shown = new Set<object>()
	let current = theme
	let layer: MapLayer = 'scheme'

	const toggle = (child: object | null, isShown: boolean): void => {
		if (!child || shown.has(child) === isShown) return
		if (isShown) map.addChild(child)
		else map.removeChild(child)
		shown[isShown ? 'add' : 'delete'](child)
	}

	const apply = (): void => {
		const isImagery = layer !== 'scheme' && satellite !== null
		toggle(satellite, isImagery)
		toggle(scheme, !isImagery || layer === 'hybrid')
		scheme.update({ theme: current, customization: isImagery && layer === 'hybrid' ? LABELS_ONLY : [] })
	}

	toggle(scheme, true)
	return {
		setLayer: (next: MapLayer): void => {
			layer = next
			apply()
		},
		setTheme: (next: MapResolvedScheme): void => {
			current = next
			apply()
		},
	}
}
