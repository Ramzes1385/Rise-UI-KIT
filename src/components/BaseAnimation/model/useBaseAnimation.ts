import { useCustomClass } from '@composables/useCustomClass'
import type { BaseAnimationEmits, BaseAnimationProps } from '../types/BaseAnimation.types'

export function useBaseAnimation(props: BaseAnimationProps, emit: BaseAnimationEmits) {
	return {
		...useCustomClass({ getClass: () => props.customClass, elementKeys: ['root'] }),
		handleAfterEnter: () => emit('after-enter'),
		handleAfterLeave: () => emit('after-leave'),
	}
}
