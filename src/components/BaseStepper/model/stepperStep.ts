import { watch } from 'vue'
import { warn } from '@/locales/warn'
import { UI_WARNINGS } from '@/locales/messages'
import type { BaseStepperProps } from '../types/BaseStepper.types'

export function activeStep(props: BaseStepperProps): number {
	const count = props.items.length
	if (count < 1) return props.modelValue
	if (!Number.isFinite(props.modelValue)) return 1
	return Math.min(Math.max(Math.trunc(props.modelValue), 1), count)
}

export function useStepRangeWarning(props: BaseStepperProps): void {
	watch(
		() => [props.modelValue, props.items.length] as const,
		([value, count]) => {
			if (count > 0 && value !== activeStep(props)) warn(UI_WARNINGS.STEPPER_STEP_OUT_OF_RANGE, { value, count })
		},
		{ immediate: true },
	)
}
