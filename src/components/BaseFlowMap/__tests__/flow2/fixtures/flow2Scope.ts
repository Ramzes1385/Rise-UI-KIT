import { flowServices } from '../../../model/notations/services'
import { createLayoutRegistry } from '../../../model/layout/registry'
import { createRouterRegistry } from '../../../model/routing/registry'
import type { FlowNotation } from '../../../types/api/flowNotation.types'
import type { FlowLayoutAlgorithm } from '../../../types/api/flowLayout.types'
import type { FlowLayoutSettings, FlowMapData } from '../../../types/data/flowData.types'
import type { FlowLayoutScope } from '../../../types/internal/core/layout/flowLayoutScope.types'

interface ScopeOptions {
	layout?: FlowLayoutSettings
	notation?: FlowNotation
	layouts?: FlowLayoutAlgorithm[]
	registry?: FlowNotation[]
}

export function createScope(data: FlowMapData, options: ScopeOptions = {}): FlowLayoutScope {
	const notation = options.notation ?? flowServices
	const notations = [notation, ...(options.registry ?? [])]
	return {
		data: { ...data, layout: { gridSize: 0, ...data.layout, ...options.layout } },
		notation,
		registry: new Map(notations.map(item => [item.id, item])),
		layouts: createLayoutRegistry([
			...((notation as FlowNotation & { layouts?: FlowLayoutAlgorithm[] }).layouts ?? []),
			...(options.layouts ?? []),
		]),
		routers: createRouterRegistry([]),
	}
}
