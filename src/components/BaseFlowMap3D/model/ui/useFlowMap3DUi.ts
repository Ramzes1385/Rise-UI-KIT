import { useDefaults } from '@composables/base/useDefaults'
import type { UiClassFn, UiProp } from '@composables/base/useUi'
import type { BaseFlowMap3DPart, FlowMap3DProps } from '../../types/BaseFlowMap3D.types'

const BLOCK = 'base-flow-map-3d'

export function useFlowMap3DUi(props: Pick<FlowMap3DProps, 'ui'>): UiClassFn<BaseFlowMap3DPart> {
	const global = useDefaults()?.BaseFlowMap3D?.ui as UiProp<BaseFlowMap3DPart> | undefined
	return part => {
		const own = part === 'root' ? BLOCK : `${BLOCK}__${part}`
		return [own, global?.[part], props.ui?.[part]].filter(Boolean).join(' ')
	}
}
