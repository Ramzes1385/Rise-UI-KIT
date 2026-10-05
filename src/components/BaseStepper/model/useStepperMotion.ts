import type { Ref } from 'vue'
import { computed, ref, watch } from 'vue'
import { useMotion } from '@composables/app/useMotion'
import type { BaseStepperProps } from '../types/BaseStepper.types'

export function useStepperMotion(props: BaseStepperProps, itemsRef: Ref<HTMLElement | null>) {
	const motion = useMotion(itemsRef)
	const hasStepChanged = ref(false)

	watch(
		() => props.modelValue,
		() => {
			hasStepChanged.value = true
		},
	)

	return {
		motionClass: computed(() => ({
			'base-stepper--instant': motion.isReduced.value,
			'base-stepper--stepped': hasStepChanged.value,
		})),
	}
}
