import { UI_MAP } from '@/locales/messages'
import { useMapScheme } from './useMapScheme'
import { watchAdapter } from './watchAdapter'
import { useMapAdapter } from './useMapAdapter'
import { useUi } from '@composables/base/useUi'
import { useMapClusters } from './useMapClusters'
import { useMapGestures } from './useMapGestures'
import { useMapSelection } from './useMapSelection'
import { useMapNavigation } from './useMapNavigation'
import { useMapPlaceholder } from './useMapPlaceholder'
import { shapeLabels, useMapShapes } from './useMapShapes'
import { useStructuredData } from '@composables/seo/useStructuredData'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import { computed, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import type { StructuredData, StructuredDataObject } from '@utils/seo/structuredDataUtils'
import type { MapGestures, MapMarkerItem, MapResolvedScheme, MapSlotsInfo } from '../types/providers.types'
import type { BaseMapEmits, BaseMapProps, MapCoordinates, MapMarker, MapView } from '../types/BaseMap.types'

const DEFAULT_VIEW: MapView = { center: { lat: 55.751244, lng: 37.618423 }, zoom: 10 }

const gesturesOf = (props: BaseMapProps): MapGestures => ({
	isDraggable: props.isDraggable !== false,
	isScrollZoom: props.isScrollZoom !== false,
})

const sameView = (left: MapView, right: MapView): boolean =>
	left.zoom === right.zoom && left.center.lat === right.center.lat && left.center.lng === right.center.lng

const geoOf = (coordinates: MapCoordinates | undefined): StructuredDataObject | undefined =>
	coordinates && { '@type': 'GeoCoordinates', latitude: coordinates.lat, longitude: coordinates.lng }

const markerPlace = (marker: MapMarker): StructuredDataObject => ({ '@type': 'Place', name: marker.title, geo: geoOf(marker.coordinates) })

function placeSchema(props: BaseMapProps): StructuredData {
	const markers = props.markers ?? []
	if (markers.length === 1) return { ...markerPlace(markers[0]!), '@type': 'Place', name: markers[0]!.title ?? props.ariaLabel }
	return {
		'@type': 'Place',
		name: props.ariaLabel,
		geo: geoOf(props.center),
		containsPlace: markers.length ? markers.map(markerPlace) : undefined,
	}
}

function useMapSync(
	props: BaseMapProps,
	map: ReturnType<typeof useMapAdapter>,
	extra: { scheme: Ref<MapResolvedScheme>; items: Ref<MapMarkerItem[]> },
) {
	const view = computed<MapView>(() => ({ center: props.center ?? DEFAULT_VIEW.center, zoom: props.zoom ?? DEFAULT_VIEW.zoom }))
	onMounted(map.attach)
	onBeforeUnmount(map.detach)
	watch(() => [props.provider, props.apiKey, props.language, props.mapId], map.attach)
	watch(extra.scheme, next => {
		if (!map.adapter.value) return
		if (map.isSchemeLive()) map.adapter.value.setScheme(next)
		else map.attach()
	})
	watch(view, next => {
		if (sameView(next, map.lastView.value)) return
		map.lastView.value = next
		map.adapter.value?.setView(next)
	})
	watchAdapter(map.adapter, { source: () => extra.items.value, apply: (adapter, items) => adapter.setMarkers(items), isDeep: true })
	watchAdapter(map.adapter, { source: () => props.layer ?? 'scheme', apply: (adapter, layer) => adapter.setLayer(layer) })
	watchAdapter(map.adapter, { source: () => gesturesOf(props), apply: (adapter, gestures) => adapter.setGestures(gestures) })
	return view
}

export function useBaseMap(props: BaseMapProps, emit: BaseMapEmits, slots: MapSlotsInfo) {
	const canvasRef = ref<HTMLElement | null>(null)
	const scheme = useMapScheme(() => props.scheme, canvasRef)
	const selection = useMapSelection(props, emit, slots)
	const initial = { center: props.center ?? DEFAULT_VIEW.center, zoom: props.zoom ?? DEFAULT_VIEW.zoom }
	const cluster = { open: (_item: MapMarkerItem): void => undefined }
	const map = useMapAdapter(props, emit, {
		view: () => initial,
		scheme,
		selection,
		canvasRef,
		cluster,
		layer: () => props.layer ?? 'scheme',
		gestures: () => gesturesOf(props),
	})
	const items = useMapClusters(props, map.lastView)
	useMapSync(props, map, { scheme, items })
	useMapShapes(props, map.adapter, { area: canvasRef, scheme })
	const navigation = useMapNavigation(props, emit, map)
	cluster.open = navigation.openCluster
	const gestures = useMapGestures(props, { zoomBy: navigation.zoomBy, notify: navigation.showNotice })
	return {
		...useStandardBaseComponent('base-map', props, ['root', 'canvas', 'placeholder', 'balloon', 'preview']),
		ui: useUi(props, 'base-map'),
		...useStructuredData(
			'BaseMap',
			() => props.seo,
			() => placeSchema(props),
		),
		...navigation,
		...gestures,
		...useMapPlaceholder(props, map.status),
		canvasRef,
		status: map.status,
		hosts: selection.hosts,
		selectedHost: selection.selectedHost,
		balloonId: selection.balloonId,
		closeBalloon: selection.close,
		onEscape: selection.onEscape,
		shapeLabels: computed(() => shapeLabels(props)),
		label: computed(() => props.ariaLabel ?? UI_MAP.LABEL),
		rootStyle: computed(() => ({ height: props.height ?? '400px' })),
	}
}
