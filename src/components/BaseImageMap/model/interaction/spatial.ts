import type { Center } from '../../types/imageMapInternal.types'
import type { ImageMapDirection } from '../../types/imageMapModel.types'

const OFF_AXIS_WEIGHT = 2
const MIN_STEP = 1

function axisDistances(from: Center, to: Center, direction: ImageMapDirection): { along: number; across: number } {
	const dx = to.x - from.x
	const dy = to.y - from.y
	if (direction === 'right') return { along: dx, across: Math.abs(dy) }
	if (direction === 'left') return { along: -dx, across: Math.abs(dy) }
	if (direction === 'down') return { along: dy, across: Math.abs(dx) }
	return { along: -dy, across: Math.abs(dx) }
}

export function pickInDirection(from: Center, candidates: Center[], direction: ImageMapDirection): string | undefined {
	let best: { id: string; score: number } | undefined
	for (const candidate of candidates) {
		const { along, across } = axisDistances(from, candidate, direction)
		const score = along + across * OFF_AXIS_WEIGHT
		if (candidate.id !== from.id && along >= MIN_STEP && (!best || score < best.score)) best = { id: candidate.id, score }
	}
	return best?.id
}

export function centerOf(id: string, element: Element): Center {
	const rect = element.getBoundingClientRect()
	return { id, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
}
