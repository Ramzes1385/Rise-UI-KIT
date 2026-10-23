import { provide, ref } from 'vue'
import { FLOW_MAP_CONTEXT, useFlowMapContext } from '@components/BaseFlowMap/model/context/flowContext'

export function useFlowMap3DCompactScope(): void {
	provide(FLOW_MAP_CONTEXT, { ...useFlowMapContext(), isCompact: ref(true) })
}
