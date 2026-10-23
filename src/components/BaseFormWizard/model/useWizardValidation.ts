import type { Ref } from 'vue'
import { ref, watch } from 'vue'
import { UI_FORM_WIZARD } from '@/locales/messages'
import { validateSchema } from '@utils/form/formUtils'
import type { useWizardNavigation } from './useWizardNavigation'
import type { BaseFormExpose } from '@components/BaseForm/types/BaseForm.types'
import type { FormWizardProps, FormWizardStep } from '../types/BaseFormWizard.types'

async function customMessage(step: FormWizardStep): Promise<string> {
	const result = await step.validate?.()
	if (result === false) return UI_FORM_WIZARD.STEP_INVALID
	return typeof result === 'string' ? result : ''
}

export function useWizardValidation(
	props: FormWizardProps,
	nav: ReturnType<typeof useWizardNavigation>,
	formRef: Ref<BaseFormExpose | null>,
) {
	const stepError = ref('')
	const failedIds = ref<string[]>([])
	const isChecking = ref(false)

	watch(nav.currentId, () => {
		stepError.value = ''
	})

	function mark(id: string, isFailed: boolean): void {
		const others = failedIds.value.filter(item => item !== id)
		failedIds.value = isFailed ? [...others, id] : others
	}

	async function checkSchema(step: FormWizardStep, isCurrent: boolean): Promise<boolean> {
		if (!step.schema) return true
		const result = isCurrent && formRef.value ? await formRef.value.validate() : await validateSchema(step.schema, props.state)
		return result.issues.length === 0
	}

	async function check(index: number): Promise<boolean> {
		const step = props.steps[index]
		if (!step) return true
		isChecking.value = true
		try {
			const isSchemaOk = await checkSchema(step, index === nav.currentIndex.value)
			const message = isSchemaOk ? await customMessage(step) : ''
			if (index === nav.currentIndex.value) stepError.value = message
			mark(step.id, !isSchemaOk || message !== '')
			return isSchemaOk && message === ''
		} finally {
			isChecking.value = false
		}
	}

	return {
		stepError,
		failedIds,
		isChecking,
		check,
		markInvalid: (id: string): void => mark(id, true),
		clear(id: string): void {
			mark(id, false)
			stepError.value = ''
		},
	}
}
