import { performance } from 'node:perf_hooks'
import { createRoadLayout } from '../../../model/island/roadPath'
import type { IslandModel } from '../../../types/roadmap3dIsland.types'
import { createIslandField, hashSeed, resolveSeed, segmentDistance } from '../../../model/island/islandField'
import {
	ISLAND_TREE_BASE,
	ISLAND_TREE_ROAD_CLEARANCE,
	ISLAND_TREE_SPACING,
	ISLAND_TREE_STAGE_CLEARANCE,
	buildIsland,
	createClouds,
	createMountains,
	createTrees,
	islandTreeCount,
} from '../../../model/island/islandDecor'

const EXPECTED_HASH: Record<string, number> = {
	'1-3': 753395532,
	'2-3': 3148653614,
	'6-3': 1741303644,
	'12-3': 3212453478,
	'24-4': 384874907,
}

const SEED = resolveSeed(undefined, 'Frontend-разработчик на Vue')

function fingerprint(island: IslandModel): number {
	const round = (value: number) => Math.round(value * 1000) / 1000
	const shore = island.shoreline.map(p => [round(p.x), round(p.z)])
	const terraces = island.terraces.map(t => t.points.map(p => [round(p.x), round(p.z)]))
	return hashSeed(JSON.stringify([shore, terraces, island.mountains, island.trees, island.clouds]))
}

function roadGap(island: IslandModel, x: number, z: number): number {
	const { road } = island.layout
	let best = Infinity
	for (let i = 0; i < road.length - 1; i++) best = Math.min(best, segmentDistance({ x, z }, road[i], road[i + 1]))
	return best
}

describe('islandTreeCount', () => {
	it('18 + 2 на этап, не меньше 18', () => {
		expect(islandTreeCount(0)).toBe(ISLAND_TREE_BASE)
		expect(islandTreeCount(6)).toBe(30)
		expect(islandTreeCount(24)).toBe(66)
		expect(islandTreeCount(-5)).toBe(ISLAND_TREE_BASE)
	})
})

describe('buildIsland', () => {
	it.each([1, 2, 6, 12, 24])('%i этапов: берег, три уступа, горы, деревья и облака', count => {
		for (const perRow of [2, 3, 4]) {
			const island = buildIsland(count, perRow, SEED)
			expect(island.layout.stages).toHaveLength(count)
			expect(island.shoreline.length).toBeGreaterThan(20)
			expect(island.terraces).toHaveLength(3)
			island.terraces.forEach(terrace => expect(terrace.points.length).toBeGreaterThan(8))
			expect(island.mountains.length).toBeGreaterThanOrEqual(2)
			expect(island.mountains.length).toBeLessThanOrEqual(4)
			expect(island.clouds.length).toBeGreaterThanOrEqual(3)
			expect(island.clouds.length).toBeLessThanOrEqual(5)
			expect(island.trees.length).toBeGreaterThan(5)
			expect(island.trees.length).toBeLessThanOrEqual(islandTreeCount(count))
			expect(island.bounds.maxX).toBeGreaterThan(island.bounds.minX)
		}
	})

	it('деревья держат расстояния до дороги, пьедесталов и друг друга', () => {
		const island = buildIsland(12, 3, SEED)
		island.trees.forEach((tree, index) => {
			expect(roadGap(island, tree.x, tree.z)).toBeGreaterThanOrEqual(ISLAND_TREE_ROAD_CLEARANCE - 0.01)
			island.layout.stages.forEach(stage => {
				expect(Math.hypot(tree.x - stage.x, tree.z - stage.z)).toBeGreaterThanOrEqual(ISLAND_TREE_STAGE_CLEARANCE - 0.01)
			})
			island.trees.slice(index + 1).forEach(other => {
				expect(Math.hypot(tree.x - other.x, tree.z - other.z)).toBeGreaterThanOrEqual(ISLAND_TREE_SPACING - 0.01)
			})
			expect([0, 1, 2]).toContain(tree.kind)
			expect(tree.scale).toBeGreaterThanOrEqual(0.8)
			expect(tree.scale).toBeLessThanOrEqual(1.3)
		})
		const kinds = new Set(island.trees.map(tree => tree.kind))
		expect(kinds.size).toBe(3)
	})

	it('горы стоят за целью по ходу дороги, облака — за берегом', () => {
		const island = buildIsland(6, 3, SEED)
		const side = Math.sign(island.layout.goal.x - island.layout.stages[5].x)
		island.mountains.forEach(mountain => {
			expect(Math.sign(mountain.x - island.layout.goal.x)).toBe(side)
			expect(mountain.height).toBeGreaterThan(1.7)
			expect(mountain.snow).toBeGreaterThan(0.2)
		})
		island.clouds.forEach(cloud => {
			expect(cloud.y).toBeGreaterThanOrEqual(3)
			expect(cloud.scale).toBeGreaterThanOrEqual(0.8)
		})
	})

	it('детерминизм по зерну: тот же результат, другой — другой остров', () => {
		const first = fingerprint(buildIsland(6, 3, SEED))
		expect(fingerprint(buildIsland(6, 3, SEED))).toBe(first)
		expect(fingerprint(buildIsland(6, 3, SEED + 1))).not.toBe(first)
		expect(fingerprint(buildIsland(7, 3, SEED))).not.toBe(first)
	})

	it.each([
		[1, 3],
		[2, 3],
		[6, 3],
		[12, 3],
		[24, 4],
	])('снимок хеша: %i этапов, в ряду %i', (count, perRow) => {
		const hash = fingerprint(buildIsland(count, perRow, SEED))
		expect(hash).toBe(EXPECTED_HASH[`${count}-${perRow}`])
	})

	it('пустой путь — пустой остров', () => {
		const island = buildIsland(0, 3, SEED)
		expect(island.shoreline).toEqual([])
		expect(island.terraces.map(t => t.points)).toEqual([[], [], []])
		expect(island.mountains).toEqual([])
		expect(island.trees).toEqual([])
		expect(island.clouds).toEqual([])
		expect(island.bounds).toEqual({ minX: 0, maxX: 0, minZ: 0, maxZ: 0 })
	})

	it('24 этапа собираются быстрее 120 мс', () => {
		buildIsland(24, 4, SEED)
		const started = performance.now()
		buildIsland(24, 4, SEED + 5)
		expect(performance.now() - started).toBeLessThan(120)
	})
})

describe('createMountains / createClouds / createTrees', () => {
	it('без этапов гор нет, без берега облаков нет, без сетки деревьев нет', () => {
		const empty = createRoadLayout(0, 3)
		expect(createMountains(empty, SEED)).toEqual([])
		expect(createClouds([], SEED)).toEqual([])
		expect(createTrees(empty, createIslandField(empty, SEED), SEED)).toEqual([])
	})

	it('горы слева от последнего этапа, когда ряд идёт влево', () => {
		const layout = createRoadLayout(4, 2)
		const side = Math.sign(layout.goal.x - layout.stages[3].x)
		expect(side).toBe(-1)
		createMountains(layout, SEED).forEach(mountain => expect(mountain.x).toBeLessThan(layout.goal.x))
	})

	it('облако на совпадающей с центром точке не даёт NaN', () => {
		const clouds = createClouds([{ x: 1, z: 1 }], SEED)
		clouds.forEach(cloud => {
			expect(Number.isFinite(cloud.x)).toBe(true)
			expect(Number.isFinite(cloud.z)).toBe(true)
		})
	})

	it('деревья не растут на горах и у площадки цели', () => {
		const layout = createRoadLayout(6, 3)
		const grid = createIslandField(layout, SEED)
		const mountains = createMountains(layout, SEED)
		createTrees(layout, grid, SEED).forEach(tree => {
			expect(Math.hypot(tree.x - layout.goal.x, tree.z - layout.goal.z)).toBeGreaterThanOrEqual(2.99)
			mountains.forEach(m => expect(Math.hypot(tree.x - m.x, tree.z - m.z)).toBeGreaterThanOrEqual(m.radius + 0.39))
		})
	})
})
