import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseRoadmapProps, BaseRoadmapEmits } from '../types/BaseRoadmap.types'

export function useBaseRoadmap(props: BaseRoadmapProps, _emit: BaseRoadmapEmits) {
	return useStandardBaseComponent('base-roadmap', props, ['root'])
}
