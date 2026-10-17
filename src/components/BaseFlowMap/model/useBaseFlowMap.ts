import { computed } from 'vue'
import { UI_FLOW_MAP } from '@/locales/messages'
import { FLOW_MAP_PARTS } from '../types/BaseFlowMap.types'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseFlowMapEmits, BaseFlowMapProps } from '../types/BaseFlowMap.types'

export function useBaseFlowMap(props: BaseFlowMapProps, _emit: BaseFlowMapEmits) {
	const label = computed(() => props.ariaLabel ?? props.data?.title ?? UI_FLOW_MAP.DEFAULT_LABEL)
	const rootStyle = computed(() => ({ height: props.height }))
	return {
		...useStandardBaseComponent('base-flow-map', props, [...FLOW_MAP_PARTS]),
		label,
		rootStyle,
	}
}
