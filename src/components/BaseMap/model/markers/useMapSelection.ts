import { decorateHosts } from './markerHosts'
import { computed, ref, shallowRef, useId, watch } from 'vue'
import type { MapMarkerHost, MapSlotsInfo } from '../../types/providers.types'
import type { BaseMapEmits, BaseMapProps, MapMarker } from '../../types/BaseMap.types'

export function useMapSelection(props: BaseMapProps, emit: BaseMapEmits, slots: MapSlotsInfo) {
	const hosts = shallowRef<MapMarkerHost[]>([])
	const current = ref<string | number | null>(props.selected ?? null)
	const balloonId = useId()
	const selectedHost = computed(() => hosts.value.find(host => host.marker.id === current.value) ?? null)

	function select(id: string | number | null): void {
		if (current.value === id) return
		current.value = id
		emit('update:selected', id)
	}

	function close(): void {
		const host = selectedHost.value
		select(null)
		host?.button.focus()
	}

	function decorate(): void {
		decorateHosts(hosts.value, {
			selectedId: current.value,
			hasBalloon: Boolean(slots.balloon),
			hasSlot: Boolean(slots.marker),
			balloonId,
		})
	}

	watch(
		() => props.selected,
		value => {
			current.value = value ?? null
		},
	)
	watch(hosts, list => {
		const isMissing = current.value !== null && !list.some(host => host.marker.id === current.value)
		if (list.length && isMissing) select(null)
	})
	watch([hosts, current], decorate, { flush: 'post' })

	return {
		hosts,
		balloonId,
		selectedHost,
		close,
		onMarkerClick: (marker: MapMarker): void => select(current.value === marker.id ? null : marker.id),
		dismiss: (): void => select(null),
		onEscape: (event: KeyboardEvent): void => {
			if (!selectedHost.value) return
			event.stopPropagation()
			close()
		},
	}
}
