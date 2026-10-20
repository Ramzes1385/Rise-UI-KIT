import type { IslandCell, IslandEdgePair, IslandField, IslandPoint, IslandTerrace } from '../../types/roadmap3dIsland.types'

export const ISLAND_TERRACE_LEVELS = [-0.5, -1.1, -1.8] as const
export const ISLAND_SIMPLIFY_STEP = 2

const CASE_EDGES: Record<number, IslandEdgePair[]> = {
	1: [[0, 3]],
	2: [[0, 1]],
	3: [[1, 3]],
	4: [[1, 2]],
	5: [
		[0, 1],
		[2, 3],
	],
	6: [[0, 2]],
	7: [[2, 3]],
	8: [[2, 3]],
	9: [[0, 2]],
	10: [
		[0, 3],
		[1, 2],
	],
	11: [[1, 2]],
	12: [[1, 3]],
	13: [[0, 1]],
	14: [[0, 3]],
}

function cellCase(grid: IslandField, cell: IslandCell, level: number): number {
	const { i, j } = cell
	const { field, width } = grid
	const inside = (di: number, dj: number) => (field[(j + dj) * width + i + di] < level ? 1 : 0)
	return inside(0, 0) | (inside(1, 0) << 1) | (inside(1, 1) << 2) | (inside(0, 1) << 3)
}

function cellEdgeId(grid: IslandField, cell: IslandCell, edge: number): number {
	const { i, j } = cell
	const base = (edge === 2 ? j + 1 : j) * grid.width + (edge === 1 ? i + 1 : i)
	return edge % 2 === 0 ? base * 2 : base * 2 + 1
}

function addLink(links: Map<number, number[]>, from: number, to: number): void {
	const list = links.get(from)
	if (list) list.push(to)
	else links.set(from, [to])
}

function collectLinks(grid: IslandField, level: number): Map<number, number[]> {
	const links = new Map<number, number[]>()
	for (let j = 0; j < grid.height - 1; j++) {
		for (let i = 0; i < grid.width - 1; i++) {
			for (const [a, b] of CASE_EDGES[cellCase(grid, { i, j }, level)] ?? []) {
				const from = cellEdgeId(grid, { i, j }, a)
				const to = cellEdgeId(grid, { i, j }, b)
				addLink(links, from, to)
				addLink(links, to, from)
			}
		}
	}
	return links
}

function edgePoint(grid: IslandField, edgeId: number, level: number): IslandPoint {
	const index = Math.floor(edgeId / 2)
	const i = index % grid.width
	const j = Math.floor(index / grid.width)
	const vertical = edgeId % 2 === 1
	const i2 = vertical ? i : i + 1
	const j2 = vertical ? j + 1 : j
	const a = grid.field[j * grid.width + i] - level
	const b = grid.field[j2 * grid.width + i2] - level
	const t = a / (a - b)
	return {
		x: grid.x0 + (i + (i2 - i) * t) * grid.cellSize,
		z: grid.z0 + (j + (j2 - j) * t) * grid.cellSize,
	}
}

function walkLoop(links: Map<number, number[]>, start: number, visited: Set<number>): number[] {
	const loop: number[] = []
	let current: number | undefined = start
	while (current !== undefined) {
		visited.add(current)
		loop.push(current)
		current = (links.get(current) as number[]).find(next => !visited.has(next))
	}
	return loop
}

export function contourArea(points: IslandPoint[]): number {
	let area = 0
	for (let index = 0; index < points.length; index++) {
		const a = points[index]
		const b = points[(index + 1) % points.length]
		area += a.x * b.z - b.x * a.z
	}
	return area / 2
}

export function orientContour(points: IslandPoint[]): IslandPoint[] {
	return contourArea(points) < 0 ? [...points].reverse() : points
}

export function traceContours(grid: IslandField, level = 0): IslandPoint[][] {
	const links = collectLinks(grid, level)
	const visited = new Set<number>()
	const loops: IslandPoint[][] = []
	for (const start of links.keys()) {
		if (visited.has(start)) continue
		loops.push(walkLoop(links, start, visited).map(edgeId => edgePoint(grid, edgeId, level)))
	}
	return loops
}

export function traceContour(grid: IslandField, level = 0): IslandPoint[] {
	let best: IslandPoint[] = []
	for (const loop of traceContours(grid, level)) if (loop.length > best.length) best = loop
	return orientContour(best)
}

export function simplifyContour(points: IslandPoint[], step = ISLAND_SIMPLIFY_STEP): IslandPoint[] {
	const every = Math.max(1, Math.floor(step))
	return points.filter((_, index) => index % every === 0)
}

export function createShoreline(grid: IslandField, step = ISLAND_SIMPLIFY_STEP): IslandPoint[] {
	return simplifyContour(traceContour(grid, 0), step)
}

export function createTerraces(grid: IslandField, step = ISLAND_SIMPLIFY_STEP): IslandTerrace[] {
	return ISLAND_TERRACE_LEVELS.map(level => ({ level, points: simplifyContour(traceContour(grid, level), step) }))
}
