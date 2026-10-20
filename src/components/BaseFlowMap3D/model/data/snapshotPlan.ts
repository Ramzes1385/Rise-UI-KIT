import type { FlowGroup, FlowRect } from '@components/BaseFlowMap/types/data/flowData.types'
import type { FlowModelInternal } from '@components/BaseFlowMap/types/internal/core/flowRenderInternal.types'

const GROUP_PAD = 28

function union(rects: readonly FlowRect[]): FlowRect | null {
	if (rects.length === 0) return null
	const x0 = Math.min(...rects.map(rect => rect.x))
	const y0 = Math.min(...rects.map(rect => rect.y))
	const x1 = Math.max(...rects.map(rect => rect.x + rect.width))
	const y1 = Math.max(...rects.map(rect => rect.y + rect.height))
	return { x: x0, y: y0, width: x1 - x0, height: y1 - y0 }
}

function contains(outer: FlowRect, inner: FlowRect): boolean {
	return (
		inner.x >= outer.x - 1 &&
		inner.y >= outer.y - 1 &&
		inner.x + inner.width <= outer.x + outer.width + 1 &&
		inner.y + inner.height <= outer.y + outer.height + 1
	)
}

export function contentRect(model: FlowModelInternal): FlowRect {
	const { nodes, bounds } = model.layout.value
	return union(Object.values(nodes)) ?? bounds
}

export function groupRects(model: FlowModelInternal): ReadonlyMap<string, FlowRect> {
	const layout = model.layout.value
	const groups: readonly FlowGroup[] = model.shown.value.groups ?? []
	const result = new Map<string, FlowRect>()
	const members = (group: FlowGroup, depth: number): FlowRect[] => [
		...model.shown.value.nodes.flatMap(node => (node.group === group.id && layout.nodes[node.id] ? [layout.nodes[node.id]] : [])),
		...groups.flatMap(child => (child.parent === group.id ? (rectOf(child, depth + 1) ?? []) : [])),
	]
	function rectOf(group: FlowGroup, depth: number): FlowRect | null {
		const known = result.get(group.id)
		if (known) return known
		const inner = depth < 8 ? members(group, depth) : []
		const own = layout.groups[group.id]
		const box = union(inner)
		const rect = own && (!box || contains(own, box)) ? own : padded(box ?? own)
		if (rect) result.set(group.id, rect)
		return rect
	}
	groups.forEach(group => rectOf(group, 0))
	return result
}

function padded(base: FlowRect | null | undefined): FlowRect | null {
	if (!base) return null
	return { x: base.x - GROUP_PAD, y: base.y - GROUP_PAD, width: base.width + GROUP_PAD * 2, height: base.height + GROUP_PAD * 2 }
}
