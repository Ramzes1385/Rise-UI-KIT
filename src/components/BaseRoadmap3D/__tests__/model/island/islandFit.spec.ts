import { createRoadLayout } from '../../../model/island/roadPath'
import { createShoreline } from '../../../model/island/islandContour'
import type { IslandPoint, RoadLayout } from '../../../types/roadmap3dIsland.types'
import { createIslandField, segmentDistance } from '../../../model/island/islandField'

const PEDESTAL_RING = 1.5
const ROAD_CURB_HALF = 0.67
const SHORE_GAP = 0.5
const COUNTS = Array.from({ length: 30 }, (_, index) => index + 1)
const seedsTo = (last: number) => Array.from({ length: last }, (_, index) => index + 1)
const ROAD_STRIDE = 3

function isInside(point: IslandPoint, polygon: IslandPoint[]): boolean {
	let inside = false
	for (let index = 0, prev = polygon.length - 1; index < polygon.length; prev = index++) {
		const a = polygon[index]
		const b = polygon[prev]
		if (a.z > point.z !== b.z > point.z && point.x < ((b.x - a.x) * (point.z - a.z)) / (b.z - a.z) + a.x) inside = !inside
	}
	return inside
}

function shoreClearance(point: IslandPoint, shore: IslandPoint[]): number {
	let best = Infinity
	shore.forEach((a, index) => {
		best = Math.min(best, segmentDistance(point, a, shore[(index + 1) % shore.length]))
	})
	return isInside(point, shore) ? best : -best
}

function roadClearance(layout: RoadLayout, point: IslandPoint): number {
	let best = Infinity
	for (let index = 0; index < layout.road.length - 1; index++) {
		best = Math.min(best, segmentDistance(point, layout.road[index], layout.road[index + 1]))
	}
	return best
}

function shoreFailures(counts: number[], seeds: number[], cellSize: number): string[] {
	const perRows = [2, 3, 4]
	const failures: string[] = []
	for (const [count, perRow] of counts.flatMap(item => perRows.map(row => [item, row] as const))) {
		const layout = createRoadLayout(count, perRow)
		const solids = [
			...layout.road
				.filter((_, index) => index % ROAD_STRIDE === 0)
				.map(point => ({ point, need: ROAD_CURB_HALF + SHORE_GAP, name: 'дорога' })),
			...layout.stages.map(point => ({ point, need: PEDESTAL_RING + SHORE_GAP, name: 'пьедестал' })),
			{ point: layout.goal, need: PEDESTAL_RING + SHORE_GAP, name: 'цель' },
		]
		for (const seed of seeds) {
			const shore = createShoreline(createIslandField(layout, seed, cellSize))
			const worst = solids.map(item => ({ ...item, gap: shoreClearance(item.point, shore) })).sort((a, b) => a.gap - b.gap)[0]
			if (worst.gap < worst.need)
				failures.push(`${count} этапов, в ряду ${perRow}, зерно ${seed}: ${worst.name} ${worst.gap.toFixed(2)} < ${worst.need}`)
		}
	}
	return failures
}

describe('остров по зёрнам и числу этапов', () => {
	it('дорога, пьедесталы и цель внутри берега с запасом: этапов 1-30, в ряду 2-4, зёрно 1, крупная сетка', () => {
		expect(shoreFailures(COUNTS, seedsTo(1), 1)).toEqual([])
	})

	it('то же на сетке сцены для 6, 12 и 24 этапов, в ряду 2-4, зёрна 1-4', () => {
		expect(shoreFailures([6, 12, 24], seedsTo(4), 0.5)).toEqual([])
	})

	it('пьедесталы не пересекаются друг с другом и с дорогой при 2-4 этапах в ряду', () => {
		for (const perRow of [2, 3, 4]) {
			for (const count of COUNTS) {
				const layout = createRoadLayout(count, perRow)
				layout.stages.forEach((stage, index) => {
					expect(roadClearance(layout, stage)).toBeGreaterThanOrEqual(PEDESTAL_RING + ROAD_CURB_HALF)
					layout.stages.slice(index + 1).forEach(other => {
						expect(Math.hypot(stage.x - other.x, stage.z - other.z)).toBeGreaterThanOrEqual(PEDESTAL_RING * 2)
					})
				})
			}
		}
	})
})
