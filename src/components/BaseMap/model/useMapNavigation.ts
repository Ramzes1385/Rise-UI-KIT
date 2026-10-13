import { computed } from 'vue'
import { useMapFit } from './useMapFit'
import { useMapLocate } from './useMapLocate'
import { useMapNotice } from './useMapNotice'
import { applyViewChange } from './viewChange'
import type { MapNavigationState } from '../types/providers.types'
import type { BaseMapEmits, BaseMapProps, MapView } from '../types/BaseMap.types'

const MIN_ZOOM = 0
const MAX_ZOOM = 21
const LOCATE_ZOOM = 14

export function useMapNavigation(props: BaseMapProps, emit: BaseMapEmits, map: MapNavigationState) {
	const { notice, show } = useMapNotice()

	function goTo(next: MapView): void {
		if (!map.adapter.value) return
		map.adapter.value.setView(next)
		applyViewChange(emit, map.lastView, next)
	}

	function zoomBy(delta: number): void {
		const { center, zoom } = map.lastView.value
		goTo({ center, zoom: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom + delta)) })
	}

	const locating = useMapLocate(
		emit,
		point => {
			goTo({ center: point, zoom: Math.max(map.lastView.value.zoom, LOCATE_ZOOM) })
			emit('locate', point)
		},
		show,
	)

	return {
		...locating,
		...useMapFit(props, map, goTo),
		notice,
		zoomBy,
		showNotice: show,
		canZoomIn: computed(() => map.lastView.value.zoom < MAX_ZOOM),
		canZoomOut: computed(() => map.lastView.value.zoom > MIN_ZOOM),
	}
}
