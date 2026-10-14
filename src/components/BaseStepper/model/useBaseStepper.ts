import { computed } from 'vue'
import { UI_STEPPER } from '@/locales/messages'
import { useUi } from '@composables/base/useUi'
import { useStepperMotion } from './useStepperMotion'
import { useStepperScroll } from './useStepperScroll'
import { activeStep, useStepRangeWarning } from './stepperStep'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseStepperEmits, BaseStepperProps } from '../types/BaseStepper.types'

const STEPPER_ELEMENTS = [
	'root',
	'header',
	'items',
	'step',
	'trigger',
	'indicatorWrapper',
	'indicator',
	'check',
	'content',
	'label',
	'description',
	'footer',
] as const

function isStepLocked(props: BaseStepperProps, index: number): boolean {
	if (props.items[index]?.isDisabled) return true
	return Boolean(props.isLinear) && index + 1 > activeStep(props) + 1
}

function stepState(props: BaseStepperProps, index: number) {
	const step = index + 1
	return {
		isActive: activeStep(props) === step,
		isCompleted: activeStep(props) > step && !props.items[index]?.isError,
		isError: Boolean(props.items[index]?.isError),
		isDisabled: isStepLocked(props, index),
	}
}

function isStepClickable(props: BaseStepperProps, index: number): boolean {
	const step = index + 1
	if (props.clickable === 'none') return false
	return props.clickable !== 'completed' || step <= activeStep(props)
}

function statusText(state: ReturnType<typeof stepState>): string {
	if (state.isError) return UI_STEPPER.ERROR
	return state.isCompleted ? UI_STEPPER.COMPLETED : ''
}

export function useBaseStepper(props: BaseStepperProps, emit: BaseStepperEmits) {
	useStepRangeWarning(props)
	const scroll = useStepperScroll(props)
	return {
		...useStandardBaseComponent('base-stepper', props, [...STEPPER_ELEMENTS]),
		ui: useUi(props, 'base-stepper'),
		...scroll,
		...useStepperMotion(props, scroll.itemsRef),
		optionalLabel: computed(() => UI_STEPPER.OPTIONAL),
		stepState: (index: number) => stepState(props, index),
		isStepPassed: (index: number): boolean => index + 1 < activeStep(props),
		statusText: (index: number): string => statusText(stepState(props, index)),
		isStepClickable: (index: number): boolean => isStepClickable(props, index),
		handleStepClick(step: number): void {
			if (step === props.modelValue || !isStepClickable(props, step - 1) || isStepLocked(props, step - 1)) return
			emit('update:modelValue', step)
			emit('change', step)
		},
	}
}
