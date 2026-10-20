import { inject } from 'vue'
import { FLOW_SHARED_MODEL } from '../context/flowContext'
import type { BaseFlowMapEmits } from '../../types/BaseFlowMap.types'
import type { FlowEmit } from '../../types/internal/core/flowModelCore.types'
import type { FlowModelInternal } from '../../types/internal/core/flowRenderInternal.types'

const OWN_EVENTS = new Set(['ready', 'viewport-change'])

export function useFlowSharedModel(emit: BaseFlowMapEmits): FlowModelInternal | null {
	const shared = inject(FLOW_SHARED_MODEL, null)
	if (!shared) return null
	const own = emit as unknown as FlowEmit
	const send = shared.events.emit
	const route = ((name: string, value: unknown) =>
		OWN_EVENTS.has(name) ? own(name as never, value as never) : send(name as never, value as never)) as FlowEmit
	return { ...shared, events: { ...shared.events, emit: route } }
}
