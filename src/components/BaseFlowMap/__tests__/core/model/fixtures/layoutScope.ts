import { flowServices } from '../../../../model/notations/services'
import { createLayoutRegistry } from '../../../../model/layout/registry'
import { createRouterRegistry } from '../../../../model/routing/registry'
import type { FlowLayoutScope } from '../../../../types/internal/core/flowLayoutScope.types'
import type { FlowLayoutAlgorithm, FlowRouter } from '../../../../types/api/flowLayout.types'
import type { FlowNodeKindDef, FlowNotation } from '../../../../types/api/flowNotation.types'
import type { FlowLayoutSettings, FlowMapData, FlowRect } from '../../../../types/data/flowData.types'

interface ScopeOptions {
	layout?: FlowLayoutSettings
	notation?: FlowNotation
	layouts?: FlowLayoutAlgorithm[]
	routers?: FlowRouter[]
	overrides?: FlowLayoutSettings
	isCompact?: boolean
}

export function createScope(data: FlowMapData, options: ScopeOptions = {}): FlowLayoutScope {
	const notation = options.notation ?? flowServices
	return {
		data: { ...data, layout: { gridSize: 0, ...data.layout, ...options.layout } },
		notation,
		registry: new Map([[notation.id, notation]]),
		layouts: createLayoutRegistry(options.layouts ?? []),
		routers: createRouterRegistry(options.routers ?? []),
		overrides: options.overrides,
		isCompact: options.isCompact,
	}
}

export function isInside(inner: FlowRect, outer: FlowRect): boolean {
	return (
		inner.x >= outer.x &&
		inner.y >= outer.y &&
		inner.x + inner.width <= outer.x + outer.width &&
		inner.y + inner.height <= outer.y + outer.height
	)
}

export function isOverlapping(first: FlowRect, second: FlowRect): boolean {
	return (
		first.x < second.x + second.width &&
		second.x < first.x + first.width &&
		first.y < second.y + second.height &&
		second.y < first.y + first.height
	)
}

export function hasOverlaps(rects: readonly FlowRect[]): boolean {
	return rects.some((rect, index) => rects.slice(index + 1).some(other => isOverlapping(rect, other)))
}

export const plainNotation: FlowNotation = { ...flowServices, id: 'plain', groupKinds: undefined, rules: undefined }

function kindOf(extra: Partial<FlowNodeKindDef> = {}): FlowNodeKindDef {
	return { label: () => 'K', render: 'html', shape: { shape: 'rect' }, size: { width: 100, height: 40 }, ...extra }
}

export function notationWith(extra: Partial<FlowNotation> = {}): FlowNotation {
	return {
		id: 'rules',
		label: () => 'Rules',
		nodeKinds: {
			task: kindOf(),
			store: kindOf({
				ports: [
					{ id: 'in', direction: 'in', side: 'left', label: 'Вход', maxEdges: 1 },
					{ id: 'out', direction: 'out', side: 'right' },
				],
			}),
			free: kindOf({ render: 'svg', size: { width: 30, height: 30 } }),
		},
		edgeKinds: { flow: { label: () => 'Flow', stroke: 'solid' }, 'rules:flow': { label: () => 'Flow', stroke: 'solid' } },
		defaultNodeKind: 'task',
		defaultEdgeKind: 'flow',
		...extra,
	}
}
