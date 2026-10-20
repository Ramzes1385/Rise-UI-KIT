import type { IslandField, IslandPoint, RoadBuckets, RoadLayout } from '../../types/roadmap3dIsland.types'

const ISLAND_CELL = 0.5
export const ISLAND_CAP = 8
const ISLAND_MARGIN = 3.2
const ISLAND_PEDESTAL_RADIUS = 0.8
export const ISLAND_GOAL_RADIUS = 2.6
const ISLAND_NOISE_SIZE = 16
const ISLAND_NOISE_SCALE = 0.18
const ISLAND_NOISE_AMPLITUDE = 2.2

export function mulberry32(seed: number): () => number {
	let state = seed >>> 0
	return () => {
		state = (state + 0x6d2b79f5) | 0
		let t = Math.imul(state ^ (state >>> 15), 1 | state)
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296
	}
}

export function hashSeed(text: string): number {
	let hash = 2166136261
	for (const char of text) {
		hash ^= char.codePointAt(0) as number
		hash = Math.imul(hash, 16777619)
	}
	return hash >>> 0
}

export function resolveSeed(seed: number | string | null | undefined, fallback: string): number {
	if (typeof seed === 'number' && Number.isFinite(seed)) return seed >>> 0
	if (typeof seed === 'string' && seed !== '') return hashSeed(seed)
	return hashSeed(fallback)
}

export function createValueNoise(rand: () => number, size: number): (x: number, z: number) => number {
	const grid = Array.from({ length: size * size }, rand)
	const wrap = (value: number) => ((value % size) + size) % size
	const at = (i: number, j: number) => grid[wrap(j) * size + wrap(i)]
	const smooth = (t: number) => t * t * (3 - 2 * t)
	return (x, z) => {
		const xi = Math.floor(x)
		const zi = Math.floor(z)
		const sx = smooth(x - xi)
		const sz = smooth(z - zi)
		const a = at(xi, zi)
		const b = at(xi + 1, zi)
		const c = at(xi, zi + 1)
		const d = at(xi + 1, zi + 1)
		return a + (b - a) * sx + (c - a) * sz + (a - b - c + d) * sx * sz
	}
}

export function segmentDistance(point: IslandPoint, a: IslandPoint, b: IslandPoint): number {
	const dx = b.x - a.x
	const dz = b.z - a.z
	const lengthSq = dx * dx + dz * dz || 1
	const t = Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.z - a.z) * dz) / lengthSq))
	return Math.hypot(point.x - a.x - t * dx, point.z - a.z - t * dz)
}

function bucketKey(i: number, j: number): string {
	return `${i},${j}`
}

function addToBucket(cells: Map<string, number[]>, key: string, index: number): void {
	const list = cells.get(key)
	if (list) list.push(index)
	else cells.set(key, [index])
}

export function createRoadBuckets(road: IslandPoint[], origin: IslandPoint): RoadBuckets {
	const cells = new Map<string, number[]>()
	const cell = (value: number, base: number) => Math.floor((value - base) / ISLAND_CAP)
	for (let index = 0; index < road.length - 1; index++) {
		const a = road[index]
		const b = road[index + 1]
		const i1 = cell(Math.max(a.x, b.x), origin.x)
		const j1 = cell(Math.max(a.z, b.z), origin.z)
		for (let i = cell(Math.min(a.x, b.x), origin.x); i <= i1; i++) {
			for (let j = cell(Math.min(a.z, b.z), origin.z); j <= j1; j++) addToBucket(cells, bucketKey(i, j), index)
		}
	}
	return { road, cells, x0: origin.x, z0: origin.z }
}

export function roadDistance(buckets: RoadBuckets, point: IslandPoint): number {
	const bi = Math.floor((point.x - buckets.x0) / ISLAND_CAP)
	const bj = Math.floor((point.z - buckets.z0) / ISLAND_CAP)
	let distance = ISLAND_CAP
	for (let dj = -1; dj <= 1; dj++) {
		for (let di = -1; di <= 1; di++) {
			const list = buckets.cells.get(bucketKey(bi + di, bj + dj)) ?? []
			for (const index of list) {
				distance = Math.min(distance, segmentDistance(point, buckets.road[index], buckets.road[index + 1]))
			}
		}
	}
	return distance
}

function pointsBounds(points: IslandPoint[]): { minX: number; maxX: number; minZ: number; maxZ: number } {
	const bounds = { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity }
	for (const point of points) {
		bounds.minX = Math.min(bounds.minX, point.x)
		bounds.maxX = Math.max(bounds.maxX, point.x)
		bounds.minZ = Math.min(bounds.minZ, point.z)
		bounds.maxZ = Math.max(bounds.maxZ, point.z)
	}
	return bounds
}

function solidDistance(layout: RoadLayout, buckets: RoadBuckets, point: IslandPoint): number {
	let distance = roadDistance(buckets, point)
	for (const stage of layout.stages) {
		distance = Math.min(distance, Math.hypot(point.x - stage.x, point.z - stage.z) - ISLAND_PEDESTAL_RADIUS)
	}
	return Math.min(distance, Math.hypot(point.x - layout.goal.x, point.z - layout.goal.z) - ISLAND_GOAL_RADIUS)
}

function emptyField(cellSize: number): IslandField {
	return { field: new Float32Array(0), width: 0, height: 0, x0: 0, z0: 0, cellSize }
}

function fieldFrame(layout: RoadLayout, cellSize: number): IslandField {
	const bounds = pointsBounds([...layout.road, layout.goal])
	const pad = ISLAND_MARGIN * 2
	const x0 = bounds.minX - pad
	const z0 = bounds.minZ - pad
	const width = Math.ceil((bounds.maxX + pad - x0) / cellSize) + 1
	const height = Math.ceil((bounds.maxZ + pad - z0) / cellSize) + 1
	return { field: new Float32Array(width * height), width, height, x0, z0, cellSize }
}

function fillField(grid: IslandField, layout: RoadLayout, seed: number): void {
	const noise = createValueNoise(mulberry32(seed), ISLAND_NOISE_SIZE)
	const buckets = createRoadBuckets(layout.road, { x: grid.x0, z: grid.z0 })
	for (let j = 0; j < grid.height; j++) {
		for (let i = 0; i < grid.width; i++) {
			const point = { x: grid.x0 + i * grid.cellSize, z: grid.z0 + j * grid.cellSize }
			const wobble = (noise(point.x * ISLAND_NOISE_SCALE, point.z * ISLAND_NOISE_SCALE) - 0.5) * ISLAND_NOISE_AMPLITUDE
			grid.field[j * grid.width + i] = solidDistance(layout, buckets, point) - (ISLAND_MARGIN + wobble)
		}
	}
}

export function createIslandField(layout: RoadLayout, seed: number, cellSize = ISLAND_CELL): IslandField {
	if (layout.road.length < 2) return emptyField(cellSize)
	const grid = fieldFrame(layout, cellSize)
	fillField(grid, layout, seed)
	return grid
}

export function fieldAt(grid: IslandField, x: number, z: number): number {
	const i = Math.round((x - grid.x0) / grid.cellSize)
	const j = Math.round((z - grid.z0) / grid.cellSize)
	if (i < 0 || j < 0 || i >= grid.width || j >= grid.height) return Infinity
	return grid.field[j * grid.width + i]
}
