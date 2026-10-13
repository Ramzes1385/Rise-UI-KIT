import type { Ref } from 'vue'
import { UI_MAP } from '@/locales/messages'
import { useMapScheme } from './useMapScheme'
import { useUi } from '@composables/base/useUi'
import { useMapSelection } from './useMapSelection'
import { formatMessage, getLocale } from '@/locales/state'
import { MAP_PROVIDER_ENTRIES } from './providers/registry'
import { useStructuredData } from '@composables/seo/useStructuredData'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { StructuredData, StructuredDataObject } from '@utils/seo/structuredDataUtils'
import { computed, markRaw, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import type { MapAdapter, MapDeps, MapHandlers, MapSlotsInfo } from '../types/providers.types'
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

function viewHandlers(emit: BaseMapEmits, lastView: { value: MapView }, selection: MapDeps['selection']): MapHandlers {
	return {
		onViewChange(view) {
			const previous = lastView.value
			lastView.value = view
			if (view.center.lat !== previous.center.lat || view.center.lng !== previous.center.lng) emit('update:center', view.center)
			if (view.zoom !== previous.zoom) emit('update:zoom', view.zoom)
		},
		onClick: coordinates => {
			emit('click', coordinates)
			selection.dismiss()
		},
		onMarkerClick: marker => {
			emit('marker-click', marker)
			selection.onMarkerClick(marker)
		},
		onMarkersRendered: hosts => {
			selection.hosts.value = hosts
		},
	}
}

function useMapAdapter(props: BaseMapProps, emit: BaseMapEmits, deps: MapDeps & { view: () => MapView }) {
	const { canvasRef } = deps
	const status = ref<MapStatus>('no-key')
	const lastView = shallowRef(deps.view())
	const adapter = shallowRef<MapAdapter | null>(null)
	const entry = () => MAP_PROVIDER_ENTRIES[props.provider ?? 'yandex']
	let generation = 0

	function detach(): void {
		generation++
		adapter.value?.destroy()
		adapter.value = null
		deps.selection.hosts.value = []
	}

	const createOptions = () => ({
		apiKey: props.apiKey ?? '',
		language: props.language ?? entry().language(getLocale().intl),
		view: lastView.value,
		mapId: props.mapId,
		scheme: deps.scheme.value,
		handlers: viewHandlers(emit, lastView, deps.selection),
	})

	function show(created: MapAdapter): void {
		adapter.value = markRaw(created)
		status.value = 'ready'
		emit('ready')
	}

	function fail(error: unknown): void {
		status.value = 'error'
		emit('error', error instanceof Error ? error : new Error(String(error)))
	}

	function blocked(): MapStatus | null {
		if (!props.apiKey || !canvasRef.value) return 'no-key'
		return entry().isMapIdRequired && !props.mapId ? 'no-map-id' : null
	}

	async function attach(): Promise<void> {
		detach()
		const current = generation
		const element = canvasRef.value as HTMLElement
		status.value = blocked() ?? 'loading'
		if (status.value !== 'loading') return
		try {
			const created = await entry().create(element, createOptions())
			if (current === generation) show(created)
			else created.destroy()
		} catch (error) {
			if (current === generation) fail(error)
		}
	}

	return { canvasRef, status, lastView, adapter, attach, detach, isSchemeLive: () => entry().isSchemeLive }
}

function watchAdapter<T>(
	adapter: Ref<MapAdapter | null>,
	{ source, apply, isDeep }: { source: () => T; apply: (adapter: MapAdapter, value: T) => void; isDeep?: boolean },
): void {
	const run = (): void => {
		if (adapter.value) apply(adapter.value, source())
	}
	watch(adapter, run, { flush: 'sync' })
	watch(source, run, { deep: isDeep })
}

export function useBaseMap(props: BaseMapProps, emit: BaseMapEmits, slots: MapSlotsInfo) {
	const view = computed<MapView>(() => ({ center: props.center ?? DEFAULT_VIEW.center, zoom: props.zoom ?? DEFAULT_VIEW.zoom }))
	const canvasRef = ref<HTMLElement | null>(null)
	const scheme = useMapScheme(() => props.scheme, canvasRef)
	const selection = useMapSelection(props, emit, slots)
	const map = useMapAdapter(props, emit, { view: () => view.value, scheme, selection, canvasRef })
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
	const providerName = computed(() => MAP_PROVIDER_ENTRIES[props.provider ?? 'yandex'].name())
	return {
		...useStandardBaseComponent('base-map', props, ['root', 'canvas', 'placeholder', 'balloon']),
		ui: useUi(props, 'base-map'),
		...useStructuredData(
			'BaseMap',
			() => props.seo,
			() => placeSchema(props),
		),
		canvasRef,
		status: map.status,
		hosts: selection.hosts,
		selectedHost: selection.selectedHost,
		balloonId: selection.balloonId,
		closeBalloon: selection.close,
		onEscape: selection.onEscape,
		label: computed(() => props.ariaLabel ?? UI_MAP.LABEL),
		rootStyle: computed(() => ({ height: props.height ?? '400px' })),
		isPlaceholder: computed(() => PLACEHOLDER_TEXTS[map.status.value] !== undefined),
		placeholderTitle: computed(() => UI_MAP[PLACEHOLDER_TEXTS[map.status.value]?.[0] ?? 'NO_KEY_TITLE']),
		placeholderText: computed(() =>
			formatMessage(UI_MAP[PLACEHOLDER_TEXTS[map.status.value]?.[1] ?? 'NO_KEY'], { provider: providerName.value }),
		),
	}
}
