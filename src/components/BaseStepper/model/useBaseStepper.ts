import { computed } from 'vue'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import type { BaseStepperEmits, BaseStepperProps } from '../types/BaseStepper.types'

const STEPPER_ELEMENTS = [
	'root',
	'header',
	'items',
	'step',
	'indicatorWrapper',
	'indicator',
	'check',
	'content',
	'label',
	'description',
	'footer',
] as const

export function useBaseStepper(props: BaseStepperProps, emit: BaseStepperEmits) {
	return {
		...useStandardBaseComponent('base-stepper', props, [...STEPPER_ELEMENTS]),
		progressStyle: computed(() => {
			const count = props.items.length
			if (count <= 1) return undefined
			return {
				'--stepper-progress-scale': (props.modelValue - 1) / (count - 1),
				'--stepper-line-offset': `${50 / count}%`,
			}
		}),
		handleStepClick(step: number): void {
			if (props.items[step - 1].isDisabled) return
			emit('update:modelValue', step)
			emit('change', step)
		},
	}
}
