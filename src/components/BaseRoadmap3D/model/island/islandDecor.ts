import { createRoadLayout } from './roadPath'
import { createShoreline, createTerraces } from './islandContour'
import { ISLAND_GOAL_RADIUS, createIslandField, createRoadBuckets, fieldAt, mulberry32, roadDistance } from './islandField'
import type {
	IslandBounds,
	IslandCloud,
	IslandField,
	IslandModel,
	IslandMountain,
	IslandPoint,
	IslandTree,
	RoadLayout,
	TreeContext,
} from '../../types/roadmap3dIsland.types'

export const ISLAND_TREE_BASE = 18
const ISLAND_TREE_PER_STAGE = 2
export const ISLAND_TREE_ROAD_CLEARANCE = 1.1
export const ISLAND_TREE_STAGE_CLEARANCE = 1.6
export const ISLAND_TREE_SPACING = 0.9
const ISLAND_TREE_INLAND = -0.6
const ISLAND_TREE_TRIES = 40
const ISLAND_TREE_KINDS = 3
const ISLAND_GOAL_CLEARANCE = 0.4
const ISLAND_MOUNTAIN_CLEARANCE = 0.4
const ISLAND_TREE_SEED_MASK = 0x9e3779b9
const ISLAND_MOUNTAIN_SEED_MASK = 0x85ebca6b
const ISLAND_CLOUD_SEED_MASK = 0xc2b2ae35

export function islandTreeCount(stageCount: number): number {
	return ISLAND_TREE_BASE + ISLAND_TREE_PER_STAGE * Math.max(0, stageCount)
}

function round3(value: number): number {
	return Math.round(value * 1000) / 1000
}

function isNear(list: IslandPoint[], spot: IslandPoint, radius: number): boolean {
	return list.some(point => Math.hypot(point.x - spot.x, point.z - spot.z) < radius)
}

export function createMountains(layout: RoadLayout, seed: number): IslandMountain[] {
	if (layout.stages.length === 0) return []
	const rand = mulberry32(seed ^ ISLAND_MOUNTAIN_SEED_MASK)
	const last = layout.stages[layout.stages.length - 1]
	const side = layout.goal.x > last.x ? 1 : -1
	const count = 2 + Math.floor(rand() * 3)
	return Array.from({ length: count }, (_, index) => ({
		x: round3(layout.goal.x + side * (3.2 + rand() * 0.6)),
		z: round3(layout.goal.z + (index - (count - 1) / 2) * 2.2 + (rand() - 0.5) * 0.6),
		height: round3(1.8 + rand() * 1.2),
		radius: round3(0.8 + rand() * 0.4),
		snow: round3(0.3 + rand() * 0.1),
	}))
}

function isTreeSpotFree(context: TreeContext, spot: IslandPoint): boolean {
	const { layout, buckets, grid, mountains, placed } = context
	if (fieldAt(grid, spot.x, spot.z) > ISLAND_TREE_INLAND) return false
	if (roadDistance(buckets, spot) < ISLAND_TREE_ROAD_CLEARANCE) return false
	if (isNear(layout.stages, spot, ISLAND_TREE_STAGE_CLEARANCE)) return false
	if (isNear([layout.goal], spot, ISLAND_GOAL_RADIUS + ISLAND_GOAL_CLEARANCE)) return false
	if (mountains.some(mountain => isNear([mountain], spot, mountain.radius + ISLAND_MOUNTAIN_CLEARANCE))) return false
	return !isNear(placed, spot, ISLAND_TREE_SPACING)
}

export function createTrees(layout: RoadLayout, grid: IslandField, seed: number): IslandTree[] {
	if (grid.width === 0) return []
	const rand = mulberry32(seed ^ ISLAND_TREE_SEED_MASK)
	const context: TreeContext = {
		layout,
		grid,
		buckets: createRoadBuckets(layout.road, { x: grid.x0, z: grid.z0 }),
		mountains: createMountains(layout, seed),
		placed: [],
	}
	const count = islandTreeCount(layout.stages.length)
	for (let tries = 0; context.placed.length < count && tries < count * ISLAND_TREE_TRIES; tries++) {
		const x = grid.x0 + rand() * (grid.width - 1) * grid.cellSize
		const z = grid.z0 + rand() * (grid.height - 1) * grid.cellSize
		if (!isTreeSpotFree(context, { x, z })) continue
		const kind = Math.floor(rand() * ISLAND_TREE_KINDS)
		context.placed.push({ x: round3(x), z: round3(z), kind, scale: round3(0.8 + rand() * 0.5) })
	}
	return context.placed
}

function centroid(points: IslandPoint[]): IslandPoint {
	const sum = points.reduce((acc, point) => ({ x: acc.x + point.x, z: acc.z + point.z }), { x: 0, z: 0 })
	return { x: sum.x / points.length, z: sum.z / points.length }
}

export function createClouds(shoreline: IslandPoint[], seed: number): IslandCloud[] {
	if (shoreline.length === 0) return []
	const rand = mulberry32(seed ^ ISLAND_CLOUD_SEED_MASK)
	const center = centroid(shoreline)
	const count = 3 + Math.floor(rand() * 3)
	return Array.from({ length: count }, () => {
		const origin = shoreline[Math.floor(rand() * shoreline.length)]
		const dx = origin.x - center.x
		const dz = origin.z - center.z
		const length = Math.hypot(dx, dz) || 1
		const push = 1.5 + rand() * 1.5
		return {
			x: round3(origin.x + (dx / length) * push),
			z: round3(origin.z + (dz / length) * push),
			y: round3(3 + rand() * 1.5),
			scale: round3(0.8 + rand() * 0.8),
		}
	})
}

function fieldBounds(grid: IslandField): IslandBounds {
	if (grid.width === 0) return { minX: 0, maxX: 0, minZ: 0, maxZ: 0 }
	return {
		minX: grid.x0,
		maxX: grid.x0 + (grid.width - 1) * grid.cellSize,
		minZ: grid.z0,
		maxZ: grid.z0 + (grid.height - 1) * grid.cellSize,
	}
}

export function buildIsland(stageCount: number, perRow: number, seed: number): IslandModel {
	const layout = createRoadLayout(stageCount, perRow)
	const grid = createIslandField(layout, seed)
	const shoreline = createShoreline(grid)
	return {
		seed,
		layout,
		shoreline,
		terraces: createTerraces(grid),
		mountains: createMountains(layout, seed),
		trees: createTrees(layout, grid, seed),
		clouds: createClouds(shoreline, seed),
		bounds: fieldBounds(grid),
	}
}
