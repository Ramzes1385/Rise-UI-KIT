import { inject, proxyRefs } from 'vue'
import type { InjectionKey, ShallowUnwrapRef } from 'vue'
import type { FlowMapContext } from '../../types/internal/flowModel.types'
import type { FlowModesState } from '../../types/internal/core/flowModes.types'
import type { FlowModelInternal } from '../../types/internal/core/flowRenderInternal.types'
import type { FlowCanvasContext, FlowChromeContext } from '../../types/internal/core/flowRenderInternal.types'

export const FLOW_MAP_CONTEXT: InjectionKey<FlowMapContext> = Symbol('flow-map-context')

export const FLOW_CANVAS_CONTEXT: InjectionKey<FlowCanvasContext> = Symbol('flow-canvas-context')

export const FLOW_CHROME_CONTEXT: InjectionKey<FlowChromeContext> = Symbol('flow-chrome-context')

export const FLOW_SHARED_MODEL: InjectionKey<FlowModelInternal> = Symbol('flow-shared-model')

export const FLOW_MODES_CONTEXT: InjectionKey<FlowModesState> = Symbol('flow-modes-context')

export function useFlowMapContext(): FlowMapContext {
	const context = inject(FLOW_MAP_CONTEXT, null)
	if (!context) throw new Error('BaseFlowMap: the part must be rendered inside BaseFlowMap')
	return context
}

export function useFlowCanvasContext(): ShallowUnwrapRef<FlowCanvasContext> {
	const context = inject(FLOW_CANVAS_CONTEXT, null)
	if (!context) throw new Error('BaseFlowMap: the part must be rendered inside BaseFlowMap')
	return proxyRefs(context)
}

export function useFlowChromeContext(): ShallowUnwrapRef<FlowChromeContext> {
	const context = inject(FLOW_CHROME_CONTEXT, null)
	if (!context) throw new Error('BaseFlowMap: the part must be rendered inside BaseFlowMap')
	return proxyRefs(context)
}

export function useFlowModesContext(): ShallowUnwrapRef<FlowModesState> {
	const context = inject(FLOW_MODES_CONTEXT, null)
	if (!context) throw new Error('BaseFlowMap: the part must be rendered inside BaseFlowMap')
	return proxyRefs(context)
}
