import { computed } from 'vue'
import type { useWizardNavigation } from './useWizardNavigation'
import type { useWizardValidation } from './useWizardValidation'
import type { FormWizardProps, FormWizardStepSlot } from '../types/BaseFormWizard.types'

export function useWizardView(
	props: FormWizardProps,
	nav: ReturnType<typeof useWizardNavigation>,
	validation: ReturnType<typeof useWizardValidation>,
) {
	return {
		currentNumber: computed(() => nav.currentIndex.value + 1),
		stepperItems: computed(() =>
			props.steps.map(step => ({
				label: step.title,
				isOptional: step.isOptional,
				isError: validation.failedIds.value.includes(step.id),
			})),
		),
		stepSlot: computed((): FormWizardStepSlot => ({
			step: nav.currentStep.value,
			index: nav.currentIndex.value,
			stepNumber: nav.currentIndex.value + 1,
			isFirst: nav.isFirst.value,
			isLast: nav.isLast.value,
		})),
	}
}
