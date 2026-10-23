import type {
	RoadmapLayoutGeometry,
	RoadmapLayoutOptions,
	RoadmapLayoutStageInput,
	RoadmapPoint,
	RoadmapSpine,
} from '../../types/internal/roadmapLayout.types'
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

const ROADMAP_HORIZONTAL_STEP = 276
const ROADMAP_HORIZONTAL_PAD = 64
const ROAD_Y = 60
const BOTTOM_CLEARANCE = 32

function stationCenter(index: number): RoadmapPoint {
	return { x: ROADMAP_HORIZONTAL_PAD + ROADMAP_HORIZONTAL_STEP * (index + 0.5), y: ROAD_Y }
}

function buildSpine(centers: RoadmapPoint[]): RoadmapSpine {
	return {
		start: { x: ROADMAP_HORIZONTAL_PAD, y: ROAD_Y },
		segments: centers.map(center => ({ kind: 'L' as const, to: center })),
		stops: centers.map((_, index) => index),
	}
}

export function computeHorizontalLayout(stages: RoadmapLayoutStageInput[], options: RoadmapLayoutOptions): RoadmapLayoutGeometry {
	const stations = stages.length + 1
	const width = 2 * ROADMAP_HORIZONTAL_PAD + stations * ROADMAP_HORIZONTAL_STEP
	if (stages.length === 0) return emptyGeometry(width)
	const mirror = createMirror(width, options.isRtl)
	const centers = Array.from({ length: stations }, (_, index) => stationCenter(index))
	const spine = finishSpine(buildSpine(centers), mirror)
	const stack = stages.reduce((height, stage) => Math.max(height, stage.isExpanded ? stackHeight(stage.topics) : 0), 0)
	const below = stack > 0 ? ROADMAP_STACK_GAP + stack : 0
	return {
		width,
		height: ROAD_Y + ROADMAP_STAGE_HEIGHT / 2 + below + BOTTOM_CLEARANCE,
		stages: stages.map((stage, index) => {
			const card = stageBox(centers[index])
			return stageSlot(card, index, stackTopics(card, stage.topics, mirror))
		}),
		spine: spine.d,
		fractions: spine.fractions,
		start: { x: ROADMAP_HORIZONTAL_PAD, y: ROAD_Y },
		goal: centers[centers.length - 1],
	}
}
