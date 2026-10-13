import { getLocale } from '@/locales/state'
import { applyViewChange } from './view/viewChange'
import { markRaw, ref, shallowRef, type Ref } from 'vue'
import { MAP_PROVIDER_ENTRIES } from './providers/registry'
import type { MapAdapter, MapDeps, MapHandlers } from '../types/providers.types'
import type { BaseMapEmits, BaseMapProps, MapStatus, MapView } from '../types/BaseMap.types'

function viewHandlers(emit: BaseMapEmits, lastView: Ref<MapView>, { selection, cluster }: MapDeps): MapHandlers {
	return {
		onViewChange: view => applyViewChange(emit, lastView, view),
		onClick: coordinates => {
			emit('click', coordinates)
			selection.dismiss()
		},
		onMarkerClick: marker => {
			if (marker.count) return cluster.open(marker)
			emit('marker-click', marker)
			selection.onMarkerClick(marker)
		},
		onMarkersRendered: hosts => {
			selection.hosts.value = hosts
		},
	}
}

function adapterOptions(props: BaseMapProps, deps: MapDeps) {
	return {
		apiKey: props.apiKey ?? '',
		mapId: props.mapId,
		scheme: deps.scheme.value,
		layer: deps.layer(),
		gestures: deps.gestures(),
	}
}

export function useMapAdapter(props: BaseMapProps, emit: BaseMapEmits, deps: MapDeps & { view: () => MapView }) {
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
		...adapterOptions(props, deps),
		language: props.language ?? entry().language(getLocale().intl),
		view: lastView.value,
		handlers: viewHandlers(emit, lastView, deps),
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

	return { canvasRef, status, lastView, adapter, attach, detach }
}
