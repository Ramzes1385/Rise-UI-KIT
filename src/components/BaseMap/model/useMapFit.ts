import { fitView } from './fitView'
import { watchAdapter } from './watchAdapter'
import type { BaseMapProps, MapView } from '../types/BaseMap.types'
import type { MapMarkerItem, MapNavigationState } from '../types/providers.types'

const MAX_ZOOM = 21
const FIT_PADDING = 40
const FALLBACK_SIZE = 400

export function useMapFit(props: BaseMapProps, map: MapNavigationState, goTo: (view: MapView) => void) {
	function boxOf(padding = FIT_PADDING) {
		const area = map.canvasRef.value
		return { width: area?.clientWidth || FALLBACK_SIZE, height: area?.clientHeight || FALLBACK_SIZE, padding }
	}

	function fit(): void {
		const points = (props.markers ?? []).map(marker => marker.coordinates)
		const next = fitView(points, boxOf(props.boundsPadding ?? FIT_PADDING), props.zoom ?? map.lastView.value.zoom)
		if (next) goTo(next)
	}

	function openCluster(item: MapMarkerItem): void {
		const points = (item.members ?? []).map(member => member.coordinates)
		const next = fitView(points, boxOf(), map.lastView.value.zoom)
		if (!next) return
		const minimum = Math.floor(map.lastView.value.zoom) + 1
		goTo({ ...next, zoom: Math.min(MAX_ZOOM, Math.max(next.zoom, minimum)) })
	}

	watchAdapter(map.adapter, {
		source: () => (props.fitMarkers ? [props.markers, props.boundsPadding] : null),
		apply: (_adapter, value) => value && fit(),
		isDeep: true,
	})

	return { openCluster }
}
