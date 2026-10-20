import type { FlowMap3DEdgeItem } from '../../../types/internal/flowMap3dInternal.types'
import type { FlowMap3DSpot, FlowMap3DTrack } from '../../../types/internal/flowMap3dBuild.types'

function trackOf(points: FlowMap3DEdgeItem['points']): FlowMap3DTrack {
	const lengths = [0]
	points.forEach((point, index) => {
		const before = points[index - 1]
		if (before) lengths.push(lengths[index - 1] + Math.hypot(point.x - before.x, point.y - before.y, point.z - before.z))
	})
	return { points, lengths, total: lengths[lengths.length - 1] }
}

export function tracksOf(items: readonly FlowMap3DEdgeItem[]): Map<string, FlowMap3DTrack> {
	const tracks = new Map<string, FlowMap3DTrack>()
	items.forEach(item => {
		if (item.points.length < 2) return
		const track = trackOf(item.points)
		if (track.total > 0) tracks.set(item.id, track)
	})
	return tracks
}

export function sampleTrack(track: FlowMap3DTrack, distance: number, out: FlowMap3DSpot): void {
	let index = 1
	while (index < track.lengths.length - 1 && track.lengths[index] < distance) index += 1
	const [from, to] = [track.points[index - 1], track.points[index]]
	const span = track.lengths[index] - track.lengths[index - 1] || 1
	const ratio = Math.min(1, Math.max(0, (distance - track.lengths[index - 1]) / span))
	out.x = from.x + (to.x - from.x) * ratio
	out.y = from.y + (to.y - from.y) * ratio
	out.z = from.z + (to.z - from.z) * ratio
}
