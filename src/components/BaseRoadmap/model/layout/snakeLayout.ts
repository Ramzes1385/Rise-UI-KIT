import {
	ROADMAP_STACK_GAP,
	ROADMAP_STAGE_HEIGHT,
	createMirror,
	emptyGeometry,
	finishSpine,
	stackHeight,
	stackTopics,
	stageBox,
	stageSlot,
} from './layoutShared'
import type {
	RoadmapLayoutGeometry,
	RoadmapLayoutOptions,
	RoadmapLayoutStageInput,
	RoadmapPoint,
	RoadmapSegment,
	RoadmapSpine,
	RoadmapStageSlot,
} from '../../types/internal/roadmapLayout.types'

export const ROADMAP_SNAKE_COLUMNS = 3
export const ROADMAP_SNAKE_STEP = 276
export const ROADMAP_SNAKE_PAD = 64
const ROW_MIN = 150
const ROW_TOP = 60
const AFTER_STACK = ROADMAP_STAGE_HEIGHT + ROADMAP_STACK_GAP + 24
const BULGE_MAX = 60
const BULGE_RATIO = 0.4
const BOTTOM_MIN = 90
const BOTTOM_CLEARANCE = 24

function columnsFor(stations: number): number {
	return Math.min(ROADMAP_SNAKE_COLUMNS, stations)
}

function rowStackHeight(stages: RoadmapLayoutStageInput[], row: number, columns: number): number {
	return stages
		.slice(row * columns, (row + 1) * columns)
		.reduce((height, stage) => Math.max(height, stage.isExpanded ? stackHeight(stage.topics) : 0), 0)
}

function rowCenters(stages: RoadmapLayoutStageInput[], rows: number, columns: number): number[] {
	const centers = [ROW_TOP]
	for (let row = 1; row < rows; row++) {
		const stack = rowStackHeight(stages, row - 1, columns)
		const needed = stack > 0 ? stack + AFTER_STACK : 0
		centers.push(centers[row - 1] + Math.max(ROW_MIN, needed))
	}
	return centers
}

function stationCenter(index: number, columns: number, rowsY: number[]): RoadmapPoint {
	const row = Math.floor(index / columns)
	const column = index % columns
	const slot = row % 2 === 0 ? column : columns - 1 - column
	return { x: ROADMAP_SNAKE_PAD + ROADMAP_SNAKE_STEP * (slot + 0.5), y: rowsY[row] }
}

function turnSegment(from: RoadmapPoint, to: RoadmapPoint, direction: number): RoadmapSegment {
	const bulge = Math.min(BULGE_MAX, (to.y - from.y) * BULGE_RATIO) * direction
	return {
		kind: 'C',
		control1: { x: from.x + bulge, y: from.y },
		control2: { x: to.x + bulge, y: to.y },
		to,
	}
}

function buildSpine(centers: RoadmapPoint[], columns: number, rowsY: number[]): RoadmapSpine {
	const start = { x: ROADMAP_SNAKE_PAD, y: ROW_TOP }
	const segments: RoadmapSegment[] = []
	const stops: number[] = []
	const edge = ROADMAP_SNAKE_PAD + columns * ROADMAP_SNAKE_STEP
	centers.forEach((center, index) => {
		const column = index % columns
		const row = Math.floor(index / columns)
		segments.push({ kind: 'L', to: center })
		stops.push(segments.length - 1)
		if (column === columns - 1 && index < centers.length - 1) {
			const direction = row % 2 === 0 ? 1 : -1
			const turnX = direction > 0 ? edge : ROADMAP_SNAKE_PAD
			segments.push({ kind: 'L', to: { x: turnX, y: rowsY[row] } })
			segments.push(turnSegment({ x: turnX, y: rowsY[row] }, { x: turnX, y: rowsY[row + 1] }, direction))
		}
	})
	return { start, segments, stops }
}

function buildSlots(centers: RoadmapPoint[], stages: RoadmapLayoutStageInput[], mirror: (x: number) => number): RoadmapStageSlot[] {
	return stages.map((stage, index) => {
		const card = stageBox(centers[index])
		return stageSlot(card, index, stackTopics(card, stage.topics, mirror))
	})
}

export function computeSnakeLayout(stages: RoadmapLayoutStageInput[], options: RoadmapLayoutOptions): RoadmapLayoutGeometry {
	const stations = stages.length + 1
	const columns = columnsFor(stations)
	const width = 2 * ROADMAP_SNAKE_PAD + columns * ROADMAP_SNAKE_STEP
	if (stages.length === 0) return emptyGeometry(width)
	const mirror = createMirror(width, options.isRtl)
	const rows = Math.ceil(stations / columns)
	const rowsY = rowCenters(stages, rows, columns)
	const centers = Array.from({ length: stations }, (_, index) => stationCenter(index, columns, rowsY))
	const spine = finishSpine(buildSpine(centers, columns, rowsY), mirror)
	const lastStack = rowStackHeight(stages, rows - 1, columns)
	const bottom = Math.max(BOTTOM_MIN, ROADMAP_STAGE_HEIGHT / 2 + ROADMAP_STACK_GAP + lastStack + BOTTOM_CLEARANCE)
	return {
		width,
		height: rowsY[rows - 1] + bottom,
		stages: buildSlots(centers, stages, mirror),
		spine: spine.d,
		fractions: spine.fractions,
		start: { x: ROADMAP_SNAKE_PAD, y: ROW_TOP },
		goal: centers[centers.length - 1],
	}
}
