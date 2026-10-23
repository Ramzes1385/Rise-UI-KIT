import { computed } from 'vue'
import { useUi } from '@composables/base/useUi'
import { useCustomClass } from '@composables/base/useCustomClass'
import type { BaseAnimationEmits, BaseAnimationProps } from '../types/BaseAnimation.types'

const TRANSITION_PREFIX = 'rise-'

export function useBaseAnimation(props: BaseAnimationProps, emit: BaseAnimationEmits) {
	return {
		...useCustomClass({ getClass: () => props.customClass, elementKeys: ['root'] }),
		ui: useUi(props, 'base-animation'),
		transitionName: computed(() => `${TRANSITION_PREFIX}${props.name}`),
		isCollapse: computed(() => props.name === 'collapse'),
		handleAfterEnter: () => emit('after-enter'),
		handleAfterLeave: () => emit('after-leave'),
	}
}
