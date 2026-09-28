import type { ComputedRef, Ref } from 'vue'
import type { FormValidationResult } from '@utils/formUtils'
import { computed, nextTick, provide, ref, watch } from 'vue'
import { FORM_CONTEXT_KEY } from '@composables/useFormContext'
import { issuesToErrors, validateSchema } from '@utils/formUtils'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import type { BaseFormEmits, BaseFormExpose, FormProps } from '../types/BaseForm.types'

function useLockFocus(isLocked: ComputedRef<boolean>, formRef: Ref<HTMLFormElement | null>): void {
	let focusedBeforeLock: HTMLElement | null = null

	watch(isLocked, locked => {
		if (!locked) return
		const active = document.activeElement
		focusedBeforeLock = active instanceof HTMLElement && formRef.value?.contains(active) ? active : null
	})

	watch(
		isLocked,
		locked => {
			const target = focusedBeforeLock
			if (locked || !target) return
			focusedBeforeLock = null
			const active = document.activeElement
			if (target.isConnected && (!active || active === document.body)) target.focus()
		},
		{ flush: 'post' },
	)
}

function useSchemaValidation(props: FormProps) {
	const errors = ref<Record<string, string>>({})
	const isSubmitted = ref(false)
	let validationRun = 0

	const validate = async (): Promise<FormValidationResult> => {
		const run = ++validationRun
		if (!props.schema) {
			errors.value = {}
			return { value: props.state, issues: [] }
		}
		const result = await validateSchema(props.schema, props.state)
		if (run === validationRun) errors.value = issuesToErrors(result.issues)
		return result
	}

	watch(
		() => props.state,
		() => {
			if (isSubmitted.value) void validate()
		},
		{ deep: true },
	)

	return {
		errors,
		isSubmitted,
		validate,
		reset(): void {
			validationRun++
			isSubmitted.value = false
			errors.value = {}
		},
	}
}

export function useBaseForm(props: FormProps, emit: BaseFormEmits) {
	const standard = useStandardBaseComponent('base-form', props, ['root', 'overlay', 'content'])
	const formRef = ref<HTMLFormElement | null>(null)
	const isLocked = computed(() => props.isLoading || props.isDisabled)
	useLockFocus(isLocked, formRef)
	const { errors, isSubmitted, validate, reset } = useSchemaValidation(props)

	const focusFirstInvalid = async (): Promise<void> => {
		await nextTick()
		formRef.value?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
	}

	provide(FORM_CONTEXT_KEY, { isDisabled: isLocked, errors: computed(() => errors.value) })

	return {
		...standard,
		formRef,
		isLocked,
		async handleSubmit(e: Event): Promise<void> {
			if (isLocked.value) return
			if (!props.schema) {
				emit('submit', e, props.state)
				return
			}
			isSubmitted.value = true
			const result = await validate()
			if (result.issues.length > 0) {
				emit('invalid', result.issues)
				await focusFirstInvalid()
				return
			}
			emit('submit', e, result.value)
		},
		exposed: {
			validate,
			reset,
			get errors() {
				return errors.value
			},
		} satisfies BaseFormExpose,
	}
}
