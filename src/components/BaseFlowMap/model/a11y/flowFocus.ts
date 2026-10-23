import type { FlowRect } from '../../types/data/flowData.types'
import type { FlowArrowDirection } from '../../types/internal/core/flowRenderInternal.types'

const CROSS_WEIGHT = 2

export const ARROW_DIRECTIONS: Record<string, FlowArrowDirection> = {
	ArrowLeft: 'left',
	ArrowRight: 'right',
	ArrowUp: 'up',
	ArrowDown: 'down',
}

function centerOf(rect: FlowRect): { x: number; y: number } {
	return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
}

function offsets(from: FlowRect, to: FlowRect, direction: FlowArrowDirection): { along: number; across: number } {
	const first = centerOf(from)
	const second = centerOf(to)
	const dx = second.x - first.x
	const dy = second.y - first.y
	if (direction === 'left') return { along: -dx, across: Math.abs(dy) }
	if (direction === 'right') return { along: dx, across: Math.abs(dy) }
	if (direction === 'up') return { along: -dy, across: Math.abs(dx) }
	return { along: dy, across: Math.abs(dx) }
}

export function nearestInDirection(
	from: FlowRect,
	candidates: readonly { id: string; rect: FlowRect }[],
	direction: FlowArrowDirection,
): string | null {
	let best: string | null = null
	let bestScore = Infinity
	for (const candidate of candidates) {
		const { along, across } = offsets(from, candidate.rect, direction)
		if (along <= 0) continue
		const score = along + across * CROSS_WEIGHT
		if (score < bestScore) {
			bestScore = score
			best = candidate.id
		}
	}
	return best
}

export function typeaheadMatch(items: readonly { id: string; label: string }[], buffer: string, current: string | null): string | null {
	const isRepeat = [...buffer].every(char => char === buffer[0])
	const query = (isRepeat ? buffer[0] : buffer).toLowerCase()
	const start = Math.max(0, items.findIndex(item => item.id === current) + (isRepeat ? 1 : 0))
	const ordered = [...items.slice(start), ...items.slice(0, start)]
	return ordered.find(item => item.label.toLowerCase().startsWith(query))?.id ?? null
}

export function isPrintable(event: KeyboardEvent): boolean {
	return event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey && event.key !== ' '
}
