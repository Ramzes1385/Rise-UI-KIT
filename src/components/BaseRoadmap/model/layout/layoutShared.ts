import type {
	RoadmapBox,
	RoadmapLayoutGeometry,
	RoadmapPoint,
	RoadmapRequirementLink,
	RoadmapSegment,
	RoadmapSlotRef,
	RoadmapSpine,
	RoadmapSpinePath,
	RoadmapStageSlot,
	RoadmapTopicSlot,
} from '../../types/internal/roadmapLayout.types'

const ROADMAP_STAGE_WIDTH = 228
export const ROADMAP_STAGE_HEIGHT = 54
export const ROADMAP_TOPIC_WIDTH = 200
export const ROADMAP_TOPIC_HEIGHT = 34
const ROADMAP_STACK_INDENT = 32
const ROADMAP_STACK_PITCH = 40
export const ROADMAP_STACK_GAP = 16

const CURVE_SAMPLES = 24

export function roundCoord(value: number): number {
	return Math.round(value * 100) / 100
}

function roundFraction(value: number): number {
	return Math.round(value * 10000) / 10000
}

export function createMirror(width: number, isRtl: boolean): (x: number) => number {
	return isRtl ? x => roundCoord(width - x) : x => roundCoord(x)
}

export function stageBox(center: RoadmapPoint): RoadmapBox {
	return {
		x: roundCoord(center.x - ROADMAP_STAGE_WIDTH / 2),
		y: roundCoord(center.y - ROADMAP_STAGE_HEIGHT / 2),
		width: ROADMAP_STAGE_WIDTH,
		height: ROADMAP_STAGE_HEIGHT,
	}
}

function boxCenter(box: RoadmapBox): RoadmapPoint {
	return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
}

function formatPoint(point: RoadmapPoint, mirror: (x: number) => number): string {
	return `${mirror(point.x)} ${roundCoord(point.y)}`
}

function formatSegment(segment: RoadmapSegment, mirror: (x: number) => number): string {
	if (segment.kind === 'L') return `L${formatPoint(segment.to, mirror)}`
	const points = [segment.control1, segment.control2, segment.to].map(point => formatPoint(point, mirror))
	return `C${points.join(', ')}`
}

export function segmentsToPath(start: RoadmapPoint, segments: RoadmapSegment[], mirror: (x: number) => number): string {
	return [`M${formatPoint(start, mirror)}`, ...segments.map(segment => formatSegment(segment, mirror))].join(' ')
}

function cubicPoint(points: RoadmapPoint[], t: number): RoadmapPoint {
	const [a, b, c, d] = points
	const k = 1 - t
	const weights = [k * k * k, 3 * k * k * t, 3 * k * t * t, t * t * t]
	return {
		x: weights[0] * a.x + weights[1] * b.x + weights[2] * c.x + weights[3] * d.x,
		y: weights[0] * a.y + weights[1] * b.y + weights[2] * c.y + weights[3] * d.y,
	}
}

function distance(a: RoadmapPoint, b: RoadmapPoint): number {
	return Math.hypot(b.x - a.x, b.y - a.y)
}

function segmentLength(from: RoadmapPoint, segment: RoadmapSegment): number {
	if (segment.kind === 'L') return distance(from, segment.to)
	const points = [from, segment.control1, segment.control2, segment.to]
	let length = 0
	let previous = from
	for (let step = 1; step <= CURVE_SAMPLES; step++) {
		const next = cubicPoint(points, step / CURVE_SAMPLES)
		length += distance(previous, next)
		previous = next
	}
	return length
}

function cumulativeLengths(spine: RoadmapSpine): number[] {
	let from = spine.start
	let total = 0
	return spine.segments.map(segment => {
		total += segmentLength(from, segment)
		from = segment.to
		return total
	})
}

export function finishSpine(spine: RoadmapSpine, mirror: (x: number) => number): RoadmapSpinePath {
	const lengths = cumulativeLengths(spine)
	const total = lengths.length ? lengths[lengths.length - 1] : 0
	const fractions = spine.stops.map(stop => (total > 0 ? roundCoord((lengths[stop] / total) * 1000) / 1000 : 0))
	return { d: segmentsToPath(spine.start, spine.segments, mirror), fractions }
}

export function solidFraction(progress: number, fractions: number[]): number {
	const stages = fractions.length - 1
	if (stages < 1) return 0
	const units = Math.min(Math.max(progress, 0), 1) * stages
	const index = Math.min(Math.floor(units), stages - 1)
	const from = fractions[index]
	return roundFraction(from + (fractions[index + 1] - from) * (units - index))
}

export function emptyGeometry(width: number): RoadmapLayoutGeometry {
	const origin = { x: width / 2, y: 0 }
	return { width, height: 0, stages: [], spine: '', fractions: [], start: origin, goal: origin }
}

export function stackHeight(count: number): number {
	return count > 0 ? (count - 1) * ROADMAP_STACK_PITCH + ROADMAP_TOPIC_HEIGHT : 0
}

function stackTopic(card: RoadmapBox, index: number, mirror: (x: number) => number): RoadmapTopicSlot {
	const trunk = card.x + ROADMAP_STACK_INDENT / 2
	const top = card.y + card.height + ROADMAP_STACK_GAP + index * ROADMAP_STACK_PITCH
	const centerY = top + ROADMAP_TOPIC_HEIGHT / 2
	const startY = index === 0 ? card.y + card.height : centerY - ROADMAP_STACK_PITCH
	const box = {
		x: card.x + ROADMAP_STACK_INDENT,
		y: top,
		width: card.width - ROADMAP_STACK_INDENT,
		height: ROADMAP_TOPIC_HEIGHT,
	}
	const segments: RoadmapSegment[] = [
		{ kind: 'L', to: { x: trunk, y: centerY - 12 } },
		{ kind: 'C', control1: { x: trunk, y: centerY }, control2: { x: trunk + 5, y: centerY }, to: { x: box.x, y: centerY } },
	]
	return { index, box, side: 'below', branch: segmentsToPath({ x: trunk, y: startY }, segments, mirror) }
}

export function stackTopics(card: RoadmapBox, count: number, mirror: (x: number) => number): RoadmapTopicSlot[] {
	return Array.from({ length: count }, (_, index) => stackTopic(card, index, mirror))
}

export function stageSlot(card: RoadmapBox, index: number, topics: RoadmapTopicSlot[]): RoadmapStageSlot {
	return { index, box: card, topics }
}

function resolveBox(geometry: RoadmapLayoutGeometry, ref: RoadmapSlotRef): RoadmapBox | null {
	const stage = geometry.stages[ref.stage]
	if (!stage) return null
	if (ref.topic === null) return stage.box
	return stage.topics[ref.topic]?.box ?? null
}

function linkAnchors(from: RoadmapBox, to: RoadmapBox): [RoadmapPoint, RoadmapPoint, boolean] {
	const a = boxCenter(from)
	const b = boxCenter(to)
	const reach = (from.width + to.width) / 2
	if (Math.abs(b.x - a.x) >= reach) {
		const sign = Math.sign(b.x - a.x)
		return [{ x: a.x + (sign * from.width) / 2, y: a.y }, { x: b.x - (sign * to.width) / 2, y: b.y }, true]
	}
	const sign = b.y >= a.y ? 1 : -1
	return [{ x: a.x, y: a.y + (sign * from.height) / 2 }, { x: b.x, y: b.y - (sign * to.height) / 2 }, false]
}

function linkPath(from: RoadmapBox, to: RoadmapBox, mirror: (x: number) => number): string {
	const [start, end, isHorizontal] = linkAnchors(from, to)
	const middleX = (start.x + end.x) / 2
	const middleY = (start.y + end.y) / 2
	const control1 = isHorizontal ? { x: middleX, y: start.y } : { x: start.x, y: middleY }
	const control2 = isHorizontal ? { x: middleX, y: end.y } : { x: end.x, y: middleY }
	return segmentsToPath(start, [{ kind: 'C', control1, control2, to: end }], mirror)
}

export function buildRequirementLinks(
	geometry: RoadmapLayoutGeometry,
	links: RoadmapRequirementLink[],
	mirror: (x: number) => number,
): string[] {
	return links.flatMap(link => {
		const from = resolveBox(geometry, link.from)
		const to = resolveBox(geometry, link.to)
		return from && to ? [linkPath(from, to, mirror)] : []
	})
}
