import { computed, type Ref } from 'vue'
import { clusterMarkers } from './clusterMarkers'
import type { MapMarkerItem } from '../../types/providers.types'
import type { BaseMapProps, MapView } from '../../types/BaseMap.types'

export function useMapClusters(props: BaseMapProps, lastView: Ref<MapView>) {
	const level = computed(() => Math.round(lastView.value.zoom))
	return computed<MapMarkerItem[]>(() => {
		const markers = props.markers ?? []
		return props.isClustered ? clusterMarkers(markers, level.value) : markers
	})
}
