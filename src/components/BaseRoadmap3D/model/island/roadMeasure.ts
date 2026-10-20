import type { IslandPoint, RoadSample, RoadTable } from '../../types/roadmap3dIsland.types'

export function createRoadTable(road: IslandPoint[]): RoadTable {
	const cumulative = [0]
	for (let index = 1; index < road.length; index++) {
		const a = road[index - 1]
		const b = road[index]
		cumulative.push(cumulative[index - 1] + Math.hypot(b.x - a.x, b.z - a.z))
	}
	return { cumulative, total: cumulative[cumulative.length - 1] }
}

function clamp01(value: number): number {
	return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0
}

function nearestAlong(road: IslandPoint[], table: RoadTable, target: IslandPoint): number {
	let best = Infinity
	let along = 0
	for (let index = 0; index < road.length - 1; index++) {
		const a = road[index]
		const b = road[index + 1]
		const dx = b.x - a.x
		const dz = b.z - a.z
		const lengthSq = dx * dx + dz * dz || 1
		const t = Math.max(0, Math.min(1, ((target.x - a.x) * dx + (target.z - a.z) * dz) / lengthSq))
		const distance = Math.hypot(target.x - a.x - t * dx, target.z - a.z - t * dz)
		if (distance < best) {
			best = distance
			along = table.cumulative[index] + t * Math.sqrt(lengthSq)
		}
	}
	return along
}

export function stageRoadPositions(road: IslandPoint[], stages: IslandPoint[], table = createRoadTable(road)): number[] {
	if (road.length < 2 || table.total === 0) return stages.map(() => 0)
	return stages.map(stage => clamp01(nearestAlong(road, table, stage) / table.total))
}

export function roadSegmentAt(table: RoadTable, distance: number): number {
	const last = table.cumulative.length - 2
	let low = 0
	let high = last
	while (low < high) {
		const middle = (low + high + 1) >> 1
		if (table.cumulative[middle] <= distance) low = middle
		else high = middle - 1
	}
	return Math.max(0, low)
}

export function roadProgress(positions: number[], current: number, share: number): number {
	if (positions.length === 0) return 0
	const index = Math.min(positions.length - 1, Math.max(0, Math.floor(current)))
	const start = positions[index]
	const end = positions[index + 1] ?? 1
	return clamp01(start + (end - start) * clamp01(share))
}

export function samplePoint(road: IslandPoint[], table: RoadTable, fraction: number): RoadSample {
	if (road.length === 0) return { x: 0, z: 0, angle: 0 }
	if (road.length === 1 || table.total === 0) return { ...road[0], angle: 0 }
	const distance = clamp01(fraction) * table.total
	const index = roadSegmentAt(table, distance)
	const a = road[index]
	const b = road[index + 1]
	const length = table.cumulative[index + 1] - table.cumulative[index] || 1
	const t = Math.min(1, Math.max(0, (distance - table.cumulative[index]) / length))
	return {
		x: a.x + (b.x - a.x) * t,
		z: a.z + (b.z - a.z) * t,
		angle: Math.atan2(b.x - a.x, b.z - a.z),
	}
}
