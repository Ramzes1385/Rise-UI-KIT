import type { FlowPoint, FlowRect } from '../../../types/data/flowData.types'
import type { FlowAlignItem } from '../../../types/internal/edit/flowEditApi.types'
import type { FlowEditAlign, FlowEditPositions } from '../../../types/internal/edit/flowEdit.types'

const MIN_ALIGN = 2
const MIN_DISTRIBUTE = 3

function target(items: readonly FlowAlignItem[], mode: FlowEditAlign): number {
	const lefts = items.map(item => item.rect.x)
	const rights = items.map(item => item.rect.x + item.rect.width)
	const tops = items.map(item => item.rect.y)
	const bottoms = items.map(item => item.rect.y + item.rect.height)
	const table: Record<FlowEditAlign, number> = {
		left: Math.min(...lefts),
		right: Math.max(...rights),
		center: (Math.min(...lefts) + Math.max(...rights)) / 2,
		top: Math.min(...tops),
		bottom: Math.max(...bottoms),
		middle: (Math.min(...tops) + Math.max(...bottoms)) / 2,
	}
	return table[mode]
}

function placed(rect: FlowRect, mode: FlowEditAlign, value: number): FlowPoint {
	if (mode === 'left' || mode === 'top') return mode === 'left' ? { x: value, y: rect.y } : { x: rect.x, y: value }
	if (mode === 'right') return { x: value - rect.width, y: rect.y }
	if (mode === 'bottom') return { x: rect.x, y: value - rect.height }
	return mode === 'center' ? { x: value - rect.width / 2, y: rect.y } : { x: rect.x, y: value - rect.height / 2 }
}

export function alignPositions(items: readonly FlowAlignItem[], mode: FlowEditAlign): FlowEditPositions {
	if (items.length < MIN_ALIGN) return {}
	const value = target(items, mode)
	return Object.fromEntries(items.map(item => [item.id, placed(item.rect, mode, value)]))
}

export function distributePositions(items: readonly FlowAlignItem[], axis: 'x' | 'y'): FlowEditPositions {
	if (items.length < MIN_DISTRIBUTE) return {}
	const size = axis === 'x' ? 'width' : 'height'
	const sorted = [...items].sort((first, second) => first.rect[axis] - second.rect[axis])
	const first = sorted[0].rect
	const last = sorted[sorted.length - 1].rect
	const total = sorted.reduce((sum, item) => sum + item.rect[size], 0)
	const gap = (last[axis] + last[size] - first[axis] - total) / (sorted.length - 1)
	let cursor = first[axis]
	const result: FlowEditPositions = {}
	for (const item of sorted) {
		result[item.id] = { x: axis === 'x' ? cursor : item.rect.x, y: axis === 'y' ? cursor : item.rect.y }
		cursor += item.rect[size] + gap
	}
	return result
}
