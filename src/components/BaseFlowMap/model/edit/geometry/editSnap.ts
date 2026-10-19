import { shifted, snapToGrid, unionOf } from './editGeometry'
import type { FlowRect } from '../../../types/data/flowData.types'
import type { FlowEditGuide, FlowEditGuideMark } from '../../../types/internal/edit/flowEdit.types'
import type { FlowSnapAxis, FlowSnapInput, FlowSnapMatch, FlowSnapResult } from '../../../types/internal/edit/flowEditApi.types'

const SIZE_OF: Record<FlowSnapAxis, 'width' | 'height'> = { x: 'width', y: 'height' }

function linesOf(rect: FlowRect, axis: FlowSnapAxis): number[] {
	const size = rect[SIZE_OF[axis]]
	return [rect[axis], rect[axis] + size / 2, rect[axis] + size]
}

function matchesOf(box: FlowRect, other: FlowRect, axis: FlowSnapAxis): FlowSnapMatch[] {
	const own = linesOf(box, axis)
	return linesOf(other, axis).flatMap((target, index) =>
		own.map((line, ownIndex) => ({ shift: target - line, at: target, isCenter: index === 1 && ownIndex === 1 })),
	)
}

function nearest(box: FlowRect, others: readonly FlowRect[], context: { axis: FlowSnapAxis; tolerance: number }): FlowSnapMatch | null {
	const near = others
		.flatMap(other => matchesOf(box, other, context.axis))
		.filter(match => Math.abs(match.shift) <= context.tolerance)
		.sort((first, second) => Math.abs(first.shift) - Math.abs(second.shift))
	return near[0] ?? null
}

function crossAxis(axis: FlowSnapAxis): FlowSnapAxis {
	return axis === 'x' ? 'y' : 'x'
}

function gapMarks(box: FlowRect, aligned: readonly FlowRect[], axis: FlowSnapAxis): FlowEditGuideMark[] {
	const cross = crossAxis(axis)
	const size = SIZE_OF[cross]
	const sorted = [box, ...aligned].sort((first, second) => first[cross] - second[cross])
	const marks: FlowEditGuideMark[] = []
	for (let index = 1; index < sorted.length; index += 1) {
		const gap = sorted[index][cross] - (sorted[index - 1][cross] + sorted[index - 1][size])
		if (gap > 0) marks.push({ at: sorted[index - 1][cross] + sorted[index - 1][size] + gap / 2, size: Math.round(gap) })
	}
	return marks
}

function guideOf(box: FlowRect, match: FlowSnapMatch, context: { axis: FlowSnapAxis; others: readonly FlowRect[] }): FlowEditGuide {
	const { axis, others } = context
	const cross = crossAxis(axis)
	const aligned = others.filter(other => linesOf(other, axis).some(line => Math.abs(line - match.at) < 0.5))
	const spans = [box, ...aligned]
	const from = Math.min(...spans.map(rect => rect[cross]))
	const to = Math.max(...spans.map(rect => rect[cross] + rect[SIZE_OF[cross]]))
	const marks = gapMarks(box, aligned, axis)
	if (match.isCenter) marks.push({ at: (from + to) / 2, size: null })
	return { axis, at: match.at, from, to, marks }
}

function shiftOf(box: FlowRect, match: FlowSnapMatch | null, input: FlowSnapInput & { axis: FlowSnapAxis }): number {
	if (match) return match.shift
	return input.isGrid ? snapToGrid(box[input.axis], input.grid) - box[input.axis] : 0
}

export function snapMove(input: FlowSnapInput): FlowSnapResult {
	const { moving, others, delta, tolerance } = input
	let box = shifted(unionOf(moving), delta)
	const result = { ...delta }
	const guides: FlowEditGuide[] = []
	for (const axis of ['x', 'y'] as const) {
		const match = input.isGuides ? nearest(box, others, { axis, tolerance }) : null
		const shift = shiftOf(box, match, { ...input, axis })
		result[axis] += shift
		box = shifted(box, { x: axis === 'x' ? shift : 0, y: axis === 'y' ? shift : 0 })
		if (match) guides.push(guideOf(box, match, { axis, others }))
	}
	return { delta: result, guides }
}
