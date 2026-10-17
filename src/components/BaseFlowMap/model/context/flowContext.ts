import { inject } from 'vue'
import type { InjectionKey } from 'vue'
import type { FlowMapContext } from '../../types/internal/flowModel.types'

const FLOW_MAP_CONTEXT: InjectionKey<FlowMapContext> = Symbol('flow-map-context')

export function useFlowMapContext(): FlowMapContext {
	const context = inject(FLOW_MAP_CONTEXT, null)
	if (!context) throw new Error('BaseFlowMap: the part must be rendered inside BaseFlowMap')
	return context
}
