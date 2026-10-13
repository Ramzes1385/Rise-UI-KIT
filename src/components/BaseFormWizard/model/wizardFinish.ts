import { nextTick } from 'vue'
import type { useWizardNavigation } from './useWizardNavigation'
import type { useWizardValidation } from './useWizardValidation'
import type { BaseFormWizardEmits, FormWizardProps } from '../types/BaseFormWizard.types'

async function findInvalidStep(
	props: FormWizardProps,
	nav: ReturnType<typeof useWizardNavigation>,
	validation: ReturnType<typeof useWizardValidation>,
): Promise<string | null> {
	const indexes = props.isLinear ? [nav.currentIndex.value] : props.steps.map((_, index) => index)
	for (const index of indexes) {
		if (await validation.check(index)) continue
		if (index !== nav.currentIndex.value) {
			nav.moveTo(index)
			await nextTick()
			await validation.check(index)
		}
		return props.steps[index].id
	}
	return null
}

export async function finishWizard(
	props: FormWizardProps,
	emit: BaseFormWizardEmits,
	deps: { nav: ReturnType<typeof useWizardNavigation>; validation: ReturnType<typeof useWizardValidation> },
): Promise<boolean> {
	const invalidId = await findInvalidStep(props, deps.nav, deps.validation)
	if (invalidId) emit('invalid', invalidId)
	else emit('finish', props.state)
	return invalidId === null
}
