import { useFlowModel } from './useFlowModel'
import { UI_FLOW_MAP } from '@/locales/messages'
import { readListeners } from './state/flowListeners'
import { useFlowEditing } from './edit/useFlowEditing'
import { useFlowReview } from './review/useFlowReview'
import { computed, getCurrentInstance, ref } from 'vue'
import { FLOW_MAP_PARTS } from '../types/BaseFlowMap.types'
import { useReducedMotion } from '@composables/app/useReducedMotion'
import type { FlowEmit } from '../types/internal/core/flowModelCore.types'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseFlowMapEmits, BaseFlowMapProps } from '../types/BaseFlowMap.types'

export function useBaseFlowMap(props: BaseFlowMapProps, emit: BaseFlowMapEmits) {
	const instance = getCurrentInstance()
	const announcement = ref('')
	const isReducedMotion = useReducedMotion()
	const model = useFlowModel(props, {
		emit: emit as unknown as FlowEmit,
		listeners: () => readListeners(instance?.vnode.props),
		environment: {
			isVisible: () => true,
			isReducedMotion: () => isReducedMotion.value,
			announce: text => (announcement.value = text),
		},
	})
	const label = computed(() => props.ariaLabel ?? model.data.value.title ?? UI_FLOW_MAP.DEFAULT_LABEL)
	const rootStyle = computed(() => ({ height: props.height }))
	return {
		...useStandardBaseComponent('base-flow-map', props, [...FLOW_MAP_PARTS]),
		model,
		editing: useFlowEditing(model),
		review: useFlowReview(model),
		announcement,
		label,
		rootStyle,
	}
}
