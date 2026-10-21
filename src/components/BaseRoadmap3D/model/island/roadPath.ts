import type { IslandPoint, RoadLayout } from '../../types/roadmap3dIsland.types'

export const ROAD_STAGE_GAP = 6
export const ROAD_ROW_GAP = 5.5
export const ROAD_MIN_PER_ROW = 2
export const ROAD_MAX_PER_ROW = 4
const ROAD_DEFAULT_PER_ROW = 3
export const ROAD_STAGE_OFFSET = 2.3
const ROAD_CURVE_SEGMENTS = 12

export function clampPerRow(perRow: number): number {
	if (!Number.isFinite(perRow)) return ROAD_DEFAULT_PER_ROW
	return Math.min(ROAD_MAX_PER_ROW, Math.max(ROAD_MIN_PER_ROW, Math.round(perRow)))
}

export function rowDirection(row: number): 1 | -1 {
	return row % 2 === 0 ? 1 : -1
}

export function stagePosition(index: number, perRow: number): IslandPoint {
	const row = Math.floor(index / perRow)
	const slot = index % perRow
	const column = rowDirection(row) > 0 ? slot : perRow - 1 - slot
	return { x: (column - (perRow - 1) / 2) * ROAD_STAGE_GAP, z: row * ROAD_ROW_GAP }
}

function controlPoints(stages: IslandPoint[], perRow: number): IslandPoint[] {
	const last = stages.length - 1
	const points: IslandPoint[] = [{ x: stages[0].x - ROAD_STAGE_GAP * 0.7, z: stages[0].z + ROAD_STAGE_OFFSET }]
	stages.forEach((stage, index) => {
		points.push({ x: stage.x, z: stage.z + ROAD_STAGE_OFFSET })
		if (index < last && (index + 1) % perRow === 0) {
			const side = rowDirection(Math.floor(index / perRow))
			points.push(
				{ x: stage.x + side * ROAD_STAGE_GAP * 0.85, z: stage.z + ROAD_ROW_GAP / 2 },
				{ x: stage.x + side * ROAD_STAGE_GAP * 0.5, z: stage.z + ROAD_ROW_GAP + ROAD_STAGE_OFFSET },
			)
		}
	})
	const side = rowDirection(Math.floor(last / perRow))
	points.push({ x: stages[last].x + side * ROAD_STAGE_GAP * 0.8, z: stages[last].z + ROAD_STAGE_OFFSET })
	return points
}

function splineValue(values: [number, number, number, number], t: number): number {
	const [a, b, c, d] = values
	const t2 = t * t
	const t3 = t2 * t
	return 0.5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (3 * b - a - 3 * c + d) * t3)
}

function splinePoint(points: IslandPoint[], index: number, t: number): IslandPoint {
	const last = points.length - 1
	const p0 = points[Math.max(index - 1, 0)]
	const p1 = points[index]
	const p2 = points[index + 1]
	const p3 = points[Math.min(index + 2, last)]
	return {
		x: splineValue([p0.x, p1.x, p2.x, p3.x], t),
		z: splineValue([p0.z, p1.z, p2.z, p3.z], t),
	}
}

export function smoothPath(points: IslandPoint[], segments = ROAD_CURVE_SEGMENTS): IslandPoint[] {
	if (points.length < 2) return points.map(point => ({ ...point }))
	const result: IslandPoint[] = []
	for (let index = 0; index < points.length - 1; index++) {
		for (let step = 0; step < segments; step++) result.push(splinePoint(points, index, step / segments))
	}
	result.push({ ...points[points.length - 1] })
	return result
}

export function createRoadLayout(stageCount: number, perRow: number): RoadLayout {
	const count = Math.max(0, Math.floor(Number.isFinite(stageCount) ? stageCount : 0))
	if (count === 0) return { stages: [], road: [], goal: { x: 0, z: 0 } }
	const columns = clampPerRow(perRow)
	const stages = Array.from({ length: count }, (_, index) => stagePosition(index, columns))
	const last = stages[count - 1]
	const side = rowDirection(Math.floor((count - 1) / columns))
	return {
		stages,
		road: smoothPath(controlPoints(stages, columns)),
		goal: { x: last.x + side * ROAD_STAGE_GAP * 1.3, z: last.z },
	}
}
