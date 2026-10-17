import {
	ROADMAP_STAGE_HEIGHT,
	ROADMAP_TOPIC_HEIGHT,
	ROADMAP_TOPIC_WIDTH,
	createMirror,
	emptyGeometry,
	finishSpine,
	roundCoord,
	segmentsToPath,
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
	RoadmapTopicPlacement,
	RoadmapTopicSlot,
} from '../../types/internal/roadmapLayout.types'

const AMPLITUDE = 50
const BRANCH_START = 114
const BRANCH_END = 158
const MIN_STEP = 142
const STEP_GAP = 10
const FIRST_MIN_Y = 80
const START_OFFSET = 56
const GOAL_MIN_GAP = 60
const GOAL_MARGIN = 14
const BOTTOM_MARGIN = 30

export const ROADMAP_PATH_WIDTH = 2 * (AMPLITUDE + BRANCH_END + ROADMAP_TOPIC_WIDTH)

function topicPitch(count: number): number {
	return count === 2 ? 48 : 44
}

function topicOffset(count: number, index: number): number {
	return (index - (count - 1) / 2) * topicPitch(count)
}

function sideCounts(count: number): { start: number; end: number } {
	const start = Math.ceil(count / 2)
	return { start, end: count - start }
}

function halfSpan(count: number): number {
	const { start } = sideCounts(count)
	if (start === 0) return ROADMAP_STAGE_HEIGHT / 2
	const span = (Math.abs(topicOffset(start, 0)) * 2 + ROADMAP_TOPIC_HEIGHT) / 2
	return Math.max(span, ROADMAP_STAGE_HEIGHT / 2)
}

function stageCenterX(index: number): number {
	return ROADMAP_PATH_WIDTH / 2 + (index % 2 === 0 ? -AMPLITUDE : AMPLITUDE)
}

function stageCenters(stages: RoadmapLayoutStageInput[]): RoadmapPoint[] {
	let y = Math.max(FIRST_MIN_Y, halfSpan(stages[0].topics) + STEP_GAP)
	return stages.map((stage, index) => {
		if (index > 0) y += Math.max(MIN_STEP, halfSpan(stages[index - 1].topics) + halfSpan(stage.topics) + STEP_GAP)
		return { x: stageCenterX(index), y }
	})
}

function topicSlot(placement: RoadmapTopicPlacement, mirror: (x: number) => number): RoadmapTopicSlot {
	const { center, count, index } = placement
	const { start } = sideCounts(count)
	const isStart = index < start
	const sign = isStart ? -1 : 1
	const sideCount = isStart ? start : count - start
	const y = center.y + topicOffset(sideCount, isStart ? index : index - start)
	const from = { x: center.x + sign * BRANCH_START, y: center.y }
	const to = { x: center.x + sign * BRANCH_END, y }
	const middle = (from.x + to.x) / 2
	const segment: RoadmapSegment = {
		kind: 'C',
		control1: { x: middle, y: from.y },
		control2: { x: middle, y: to.y },
		to,
	}
	const x = isStart ? to.x - ROADMAP_TOPIC_WIDTH : to.x
	return {
		index,
		box: { x: roundCoord(x), y: roundCoord(y - ROADMAP_TOPIC_HEIGHT / 2), width: ROADMAP_TOPIC_WIDTH, height: ROADMAP_TOPIC_HEIGHT },
		side: isStart ? 'start' : 'end',
		branch: segmentsToPath(from, [segment], mirror),
	}
}

function buildSlots(centers: RoadmapPoint[], stages: RoadmapLayoutStageInput[], mirror: (x: number) => number): RoadmapStageSlot[] {
	return centers.map((center, index) => {
		const count = stages[index].topics
		const topics = Array.from({ length: count }, (_, topic) => topicSlot({ center, count, index: topic }, mirror))
		return stageSlot(stageBox(center), index, topics)
	})
}

function buildSpine(centers: RoadmapPoint[], start: RoadmapPoint, goal: RoadmapPoint): RoadmapSpine {
	const segments: RoadmapSegment[] = [{ kind: 'L', to: centers[0] }]
	const stops = [0]
	for (let index = 1; index < centers.length; index++) {
		const from = centers[index - 1]
		const to = centers[index]
		const half = (to.y - from.y) / 2
		segments.push({ kind: 'C', control1: { x: from.x, y: from.y + half }, control2: { x: to.x, y: to.y - half }, to })
		stops.push(segments.length - 1)
	}
	segments.push({ kind: 'L', to: goal })
	stops.push(segments.length - 1)
	return { start, segments, stops }
}

export function computePathLayout(stages: RoadmapLayoutStageInput[], options: RoadmapLayoutOptions): RoadmapLayoutGeometry {
	if (stages.length === 0) return emptyGeometry(ROADMAP_PATH_WIDTH)
	const mirror = createMirror(ROADMAP_PATH_WIDTH, options.isRtl)
	const centers = stageCenters(stages)
	const last = centers[centers.length - 1]
	const start = { x: centers[0].x, y: centers[0].y - START_OFFSET }
	const goal = { x: last.x, y: last.y + Math.max(GOAL_MIN_GAP, halfSpan(stages[stages.length - 1].topics) + GOAL_MARGIN) }
	const spine = finishSpine(buildSpine(centers, start, goal), mirror)
	return {
		width: ROADMAP_PATH_WIDTH,
		height: goal.y + BOTTOM_MARGIN,
		stages: buildSlots(centers, stages, mirror),
		spine: spine.d,
		fractions: spine.fractions,
		start,
		goal,
	}
}
