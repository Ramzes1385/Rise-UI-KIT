import { computed } from 'vue'
import { warn } from '@/locales/warn'
import type { ComputedRef } from 'vue'
import { computeRoutes } from './flowRoutes'
import { UI_FLOW_MAP } from '@/locales/messages'
import { createLayoutInput } from './flowLayoutInput'
import type { FlowLayoutResult, FlowRoute } from '../../types/api/flowLayout.types'
import type { FlowLayoutRun, FlowLayoutScope } from '../../types/internal/core/flowLayoutScope.types'

const FALLBACK_ALGORITHM = 'layered'

export function runFlowLayout(scope: FlowLayoutScope, run?: FlowLayoutRun): FlowLayoutResult {
	const input = createLayoutInput(scope, run)
	const id = input.settings.algorithm ?? FALLBACK_ALGORITHM
	if (!scope.layouts.has(id)) warn(UI_FLOW_MAP.WARN_UNKNOWN_LAYOUT, { id, fallback: FALLBACK_ALGORITHM })
	const algorithm = scope.layouts.get(id) ?? scope.layouts.get(FALLBACK_ALGORITHM)
	return algorithm ? algorithm.run(input) : { nodes: {}, groups: {}, bounds: { x: 0, y: 0, width: 0, height: 0 } }
}

export function useFlowLayout(scope: ComputedRef<FlowLayoutScope>) {
	const layout = computed(() => runFlowLayout(scope.value))
	const routes = computed<Record<string, FlowRoute>>(() => {
		const current = scope.value
		return computeRoutes(current, layout.value, createLayoutInput(current).edges)
	})
	return { layout, routes }
}
