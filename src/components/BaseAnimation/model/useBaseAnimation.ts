import { computed } from 'vue'
import { useCustomClass } from '@composables/base/useCustomClass'
import type { BaseAnimationEmits, BaseAnimationProps } from '../types/BaseAnimation.types'

export function useBaseAnimation(props: BaseAnimationProps, emit: BaseAnimationEmits) {
	return {
		...useCustomClass({ getClass: () => props.customClass, elementKeys: ['root'] }),
		isCollapse: computed(() => props.name === 'collapse'),
		handleAfterEnter: () => emit('after-enter'),
		handleAfterLeave: () => emit('after-leave'),
	}
}
