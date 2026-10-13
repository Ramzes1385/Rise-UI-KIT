import { computed } from 'vue'
import { fitView } from './fitView'
import { useMapLocate } from './useMapLocate'
import { useMapNotice } from './useMapNotice'
import { watchAdapter } from './watchAdapter'
import { applyViewChange } from './viewChange'
import type { MapNavigationState } from '../types/providers.types'
import type { BaseMapEmits, BaseMapProps, MapView } from '../types/BaseMap.types'

const MIN_ZOOM = 0
const MAX_ZOOM = 21
const LOCATE_ZOOM = 14
const FIT_PADDING = 40
const FALLBACK_SIZE = 400

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

	function fit(): void {
		const area = map.canvasRef.value
		const box = {
			width: area?.clientWidth || FALLBACK_SIZE,
			height: area?.clientHeight || FALLBACK_SIZE,
			padding: props.boundsPadding ?? FIT_PADDING,
		}
		const points = (props.markers ?? []).map(marker => marker.coordinates)
		const next = fitView(points, box, props.zoom ?? map.lastView.value.zoom)
		if (next) goTo(next)
	}

	const locating = useMapLocate(
		emit,
		point => {
			goTo({ center: point, zoom: Math.max(map.lastView.value.zoom, LOCATE_ZOOM) })
			emit('locate', point)
		},
		show,
	)

	watchAdapter(map.adapter, {
		source: () => (props.fitMarkers ? [props.markers, props.boundsPadding] : null),
		apply: (_adapter, value) => value && fit(),
		isDeep: true,
	})

	return {
		...locating,
		notice,
		zoomBy,
		showNotice: show,
		canZoomIn: computed(() => map.lastView.value.zoom < MAX_ZOOM),
		canZoomOut: computed(() => map.lastView.value.zoom > MIN_ZOOM),
	}
}
