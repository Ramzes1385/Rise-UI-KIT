import { UI_MAP } from '@/locales/messages'
import { formatMessage } from '@/locales/state'
import type { MapMarker } from '../types/BaseMap.types'
import { TILE, mercatorX, mercatorY } from './mercator'
import type { MapMarkerItem } from '../types/providers.types'

const CELL = 64
const MAX_CLUSTER_ZOOM = 17

function groupOf(members: MapMarker[], key: string): MapMarkerItem {
	const total = members.length
	const mean = (pick: (marker: MapMarker) => number): number => members.reduce((sum, marker) => sum + pick(marker), 0) / total
	return {
		id: `cluster:${key}`,
		coordinates: { lat: mean(marker => marker.coordinates.lat), lng: mean(marker => marker.coordinates.lng) },
		title: formatMessage(UI_MAP.CLUSTER, { count: total }),
		count: total,
		members,
	}
}

export function clusterMarkers(markers: readonly MapMarker[], zoom: number): MapMarkerItem[] {
	if (zoom > MAX_CLUSTER_ZOOM) return [...markers]
	const scale = TILE * 2 ** zoom
	const cells = new Map<string, MapMarker[]>()
	for (const marker of markers) {
		const key = `${Math.floor((mercatorX(marker.coordinates.lng) * scale) / CELL)}:${Math.floor((mercatorY(marker.coordinates.lat) * scale) / CELL)}`
		cells.set(key, [...(cells.get(key) ?? []), marker])
	}
	return [...cells].map(([key, members]) => (members.length === 1 ? members[0]! : groupOf(members, key)))
}
