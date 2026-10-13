import { UI_MAP } from '@/locales/messages'
import { useMapScheme } from './useMapScheme'
import { watchAdapter } from './watchAdapter'
import { useMapAdapter } from './useMapAdapter'
import { formatMessage } from '@/locales/state'
import { useUi } from '@composables/base/useUi'
import { useMapSelection } from './useMapSelection'
import { useMapNavigation } from './useMapNavigation'
import { shapeLabels, useMapShapes } from './useMapShapes'
import { MAP_PROVIDER_ENTRIES } from './providers/registry'
import { useStructuredData } from '@composables/seo/useStructuredData'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { MapResolvedScheme, MapSlotsInfo } from '../types/providers.types'
import { computed, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import type { StructuredData, StructuredDataObject } from '@utils/seo/structuredDataUtils'
import type { BaseMapEmits, BaseMapProps, MapCoordinates, MapMarker, MapStatus, MapView } from '../types/BaseMap.types'

const PLACEHOLDER_TEXTS: Partial<
	Record<MapStatus, readonly ['NO_KEY_TITLE' | 'NO_MAP_ID_TITLE' | 'ERROR_TITLE', 'NO_KEY' | 'NO_MAP_ID' | 'ERROR']>
> = {
	'no-key': ['NO_KEY_TITLE', 'NO_KEY'],
	'no-map-id': ['NO_MAP_ID_TITLE', 'NO_MAP_ID'],
	error: ['ERROR_TITLE', 'ERROR'],
}

const DEFAULT_VIEW: MapView = { center: { lat: 55.751244, lng: 37.618423 }, zoom: 10 }

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

function useMapSync(props: BaseMapProps, map: ReturnType<typeof useMapAdapter>, scheme: Ref<MapResolvedScheme>) {
	const view = computed<MapView>(() => ({ center: props.center ?? DEFAULT_VIEW.center, zoom: props.zoom ?? DEFAULT_VIEW.zoom }))
	onMounted(map.attach)
	onBeforeUnmount(map.detach)
	watch(() => [props.provider, props.apiKey, props.language, props.mapId], map.attach)
	watch(scheme, next => {
		if (!map.adapter.value) return
		if (map.isSchemeLive()) map.adapter.value.setScheme(next)
		else map.attach()
	})
	watch(view, next => {
		if (sameView(next, map.lastView.value)) return
		map.lastView.value = next
		map.adapter.value?.setView(next)
	})
	watchAdapter(map.adapter, { source: () => props.markers ?? [], apply: (adapter, markers) => adapter.setMarkers(markers), isDeep: true })
	return view
}

export function useBaseMap(props: BaseMapProps, emit: BaseMapEmits, slots: MapSlotsInfo) {
	const canvasRef = ref<HTMLElement | null>(null)
	const scheme = useMapScheme(() => props.scheme, canvasRef)
	const selection = useMapSelection(props, emit, slots)
	const initial = { center: props.center ?? DEFAULT_VIEW.center, zoom: props.zoom ?? DEFAULT_VIEW.zoom }
	const map = useMapAdapter(props, emit, { view: () => initial, scheme, selection, canvasRef })
	useMapSync(props, map, scheme)
	useMapShapes(props, map.adapter, { area: canvasRef, scheme })
	const navigation = useMapNavigation(props, emit, map)
	const providerName = computed(() => MAP_PROVIDER_ENTRIES[props.provider ?? 'yandex'].name())
	return {
		...useStandardBaseComponent('base-map', props, ['root', 'canvas', 'placeholder', 'balloon']),
		ui: useUi(props, 'base-map'),
		...useStructuredData(
			'BaseMap',
			() => props.seo,
			() => placeSchema(props),
		),
		...navigation,
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
		isPlaceholder: computed(() => PLACEHOLDER_TEXTS[map.status.value] !== undefined),
		placeholderTitle: computed(() => UI_MAP[PLACEHOLDER_TEXTS[map.status.value]?.[0] ?? 'NO_KEY_TITLE']),
		placeholderText: computed(() =>
			formatMessage(UI_MAP[PLACEHOLDER_TEXTS[map.status.value]?.[1] ?? 'NO_KEY'], { provider: providerName.value }),
		),
	}
}
