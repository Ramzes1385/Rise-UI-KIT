import { watch } from 'vue'
import { warn } from '@/locales/warn'
import { formatMessage } from '@/locales/state'
import { UI_STEPPER, UI_WARNINGS } from '@/locales/messages'
import type { BaseStepperProps } from '../types/BaseStepper.types'

export function activeStep(props: BaseStepperProps): number {
	const count = props.items.length
	if (count < 1) return props.modelValue
	if (!Number.isFinite(props.modelValue)) return 1
	return Math.min(Math.max(Math.trunc(props.modelValue), 1), count)
}

export function stepSummary(props: BaseStepperProps): string {
	const step = props.items[activeStep(props) - 1]
	if (!step || props.summary === 'none') return ''
	const params = { current: activeStep(props), total: props.items.length, title: step.label }
	const isTitled = props.summary !== 'count' && step.label
	return formatMessage(isTitled ? UI_STEPPER.PROGRESS_TITLED : UI_STEPPER.PROGRESS, params)
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
