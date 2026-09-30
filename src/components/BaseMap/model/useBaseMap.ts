import { UI_MAP } from '@/locales/messages'
import { formatMessage, getLocale } from '@/locales/state'
import { MAP_PROVIDER_ENTRIES } from './providers/registry'
import type { MapAdapter, MapHandlers } from '../types/providers.types'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import type { BaseMapEmits, BaseMapProps, MapStatus, MapView } from '../types/BaseMap.types'

const DEFAULT_VIEW: MapView = { center: { lat: 55.751244, lng: 37.618423 }, zoom: 10 }

const sameView = (left: MapView, right: MapView): boolean =>
	left.zoom === right.zoom && left.center.lat === right.center.lat && left.center.lng === right.center.lng

function viewHandlers(emit: BaseMapEmits, lastView: { value: MapView }): MapHandlers {
	return {
		onViewChange(view) {
			const previous = lastView.value
			lastView.value = view
			if (view.center.lat !== previous.center.lat || view.center.lng !== previous.center.lng) emit('update:center', view.center)
			if (view.zoom !== previous.zoom) emit('update:zoom', view.zoom)
		},
		onClick: coordinates => emit('click', coordinates),
		onMarkerClick: marker => emit('marker-click', marker),
	}
}

function useMapAdapter(props: BaseMapProps, emit: BaseMapEmits, view: () => MapView) {
	const canvasRef = ref<HTMLElement | null>(null)
	const status = ref<MapStatus>('no-key')
	const lastView = shallowRef(view())
	const entry = () => MAP_PROVIDER_ENTRIES[props.provider ?? 'yandex']
	let adapter: MapAdapter | null = null
	let generation = 0

	function detach(): void {
		generation++
		adapter?.destroy()
		adapter = null
	}

	const createOptions = () => ({
		apiKey: props.apiKey ?? '',
		language: props.language ?? entry().language(getLocale().intl),
		view: view(),
		mapId: props.mapId,
		handlers: viewHandlers(emit, lastView),
	})

	function show(created: MapAdapter): void {
		adapter = created
		adapter.setMarkers(props.markers ?? [])
		status.value = 'ready'
		emit('ready')
	}

	function fail(error: unknown): void {
		status.value = 'error'
		emit('error', error instanceof Error ? error : new Error(String(error)))
	}

	async function attach(): Promise<void> {
		detach()
		const current = generation
		const element = canvasRef.value
		status.value = props.apiKey && element ? 'loading' : 'no-key'
		if (!props.apiKey || !element) return
		try {
			const created = await entry().create(element, createOptions())
			if (current === generation) show(created)
			else created.destroy()
		} catch (error) {
			if (current === generation) fail(error)
		}
	}

	return { canvasRef, status, lastView, attach, detach, getAdapter: () => adapter }
}

export function useBaseMap(props: BaseMapProps, emit: BaseMapEmits) {
	const view = computed<MapView>(() => ({ center: props.center ?? DEFAULT_VIEW.center, zoom: props.zoom ?? DEFAULT_VIEW.zoom }))
	const map = useMapAdapter(props, emit, () => view.value)
	onMounted(map.attach)
	onBeforeUnmount(map.detach)
	watch(() => [props.provider, props.apiKey, props.language, props.mapId], map.attach)
	watch(view, next => {
		if (sameView(next, map.lastView.value)) return
		map.lastView.value = next
		map.getAdapter()?.setView(next)
	})
	watch(
		() => props.markers,
		markers => map.getAdapter()?.setMarkers(markers ?? []),
		{ deep: true },
	)
	const providerName = computed(() => MAP_PROVIDER_ENTRIES[props.provider ?? 'yandex'].name())
	return {
		...useStandardBaseComponent('base-map', props, ['root', 'canvas', 'placeholder']),
		canvasRef: map.canvasRef,
		status: map.status,
		label: computed(() => props.ariaLabel ?? UI_MAP.LABEL),
		rootStyle: computed(() => ({ height: props.height ?? '400px' })),
		placeholderTitle: computed(() => (map.status.value === 'error' ? UI_MAP.ERROR_TITLE : UI_MAP.NO_KEY_TITLE)),
		placeholderText: computed(() =>
			formatMessage(map.status.value === 'error' ? UI_MAP.ERROR : UI_MAP.NO_KEY, { provider: providerName.value }),
		),
	}
}
