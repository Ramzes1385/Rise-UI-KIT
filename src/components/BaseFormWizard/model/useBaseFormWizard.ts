import { computed, ref, useId } from 'vue'
import { useWizardView } from './useWizardView'
import { useUi } from '@composables/base/useUi'
import { useWizardActions } from './useWizardActions'
import { useWizardAnnounce } from './useWizardAnnounce'
import { useWizardNavigation } from './useWizardNavigation'
import { useWizardValidation } from './useWizardValidation'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseFormExpose } from '@components/BaseForm/types/BaseForm.types'
import type { BaseFormWizardEmits, BaseFormWizardExpose, FormWizardProps } from '../types/BaseFormWizard.types'

const WIZARD_ELEMENTS = ['root', 'header', 'content', 'title', 'description', 'error', 'actions', 'back', 'skip', 'next']

export function useBaseFormWizard(props: FormWizardProps, emit: BaseFormWizardEmits) {
	const id = useId()
	const formRef = ref<BaseFormExpose | null>(null)
	const nav = useWizardNavigation(props, emit)
	const validation = useWizardValidation(props, nav, formRef)
	const actions = useWizardActions(props, emit, { nav, validation })

	return {
		...useStandardBaseComponent('base-form-wizard', props, WIZARD_ELEMENTS),
		ui: useUi(props, 'base-form-wizard'),
		...useWizardAnnounce(props, nav),
		...useWizardView(props, nav, validation),
		formRef,
		titleId: `${id}-title`,
		descriptionId: `${id}-description`,
		formId: `${id}-form`,
		currentStep: nav.currentStep,
		isFirst: nav.isFirst,
		isLast: nav.isLast,
		isLocked: actions.isLocked,
		isBusy: computed(() => props.isLoading || validation.isChecking.value),
		stepError: validation.stepError,
		skip: actions.skip,
		back: actions.back,
		handleStepper(stepNumber: number): void {
			void actions.goTo(props.steps[stepNumber - 1].id)
		},
		handleSubmit(): void {
			void actions.next()
		},
		handleInvalid(): void {
			validation.markInvalid(nav.currentStep.value.id)
			emit('invalid', nav.currentStep.value.id)
		},
		exposed: {
			next: actions.next,
			back: actions.back,
			goTo: actions.goTo,
			validate: (): Promise<boolean> => validation.check(nav.currentIndex.value),
		} satisfies BaseFormWizardExpose,
	}
}
