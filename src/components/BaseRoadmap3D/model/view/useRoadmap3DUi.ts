import { useDefaults } from '@composables/base/useDefaults'
import type { UiClassFn, UiProp } from '@composables/base/useUi'
import type { BaseRoadmapPart } from '@components/BaseRoadmap/types/BaseRoadmap.types'
import type { BaseRoadmap3DPart, Roadmap3DProps } from '../../types/BaseRoadmap3D.types'

const BLOCK = 'base-roadmap-3d'

export function useRoadmap3DUi(props: Pick<Roadmap3DProps, 'ui'>): UiClassFn<BaseRoadmap3DPart> {
	const global = useDefaults()?.BaseRoadmap3D?.ui as UiProp<BaseRoadmap3DPart> | undefined
	return part => {
		const own = part === 'root' ? BLOCK : `${BLOCK}__${part}`
		return [own, global?.[part], props.ui?.[part]].filter(Boolean).join(' ')
	}
}

export const roadmapPanelUi: UiClassFn<BaseRoadmapPart> = part => `base-roadmap__${part}`
