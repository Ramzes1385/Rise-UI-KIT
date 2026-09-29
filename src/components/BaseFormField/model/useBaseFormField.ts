import { useFormField } from '@composables/form/useFormField'
import { computed, provide, ref, shallowRef, useId } from 'vue'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { FormFieldControl, FormFieldProps } from '../types/BaseFormField.types'
import { FORM_FIELD_CONTEXT_KEY, useFormContext } from '@composables/form/useFormContext'

const FIELD_ELEMENTS = ['root', 'header', 'label', 'required', 'content', 'description', 'animation', 'error']

function useFieldIds() {
	const fieldId = useId()
	return { labelId: `${fieldId}-label`, descriptionId: `${fieldId}-description`, errorId: `${fieldId}-error` }
}

function useFieldError(props: FormFieldProps) {
	const form = useFormContext()
	const formError = computed(() => (props.name ? form?.errors.value[props.name] : undefined))
	const formField = useFormField({ value: () => undefined, error: () => props.error || formError.value })
	return { formField, error: computed(() => formField.error) }
}

function useControlRegistry() {
	const control = shallowRef<FormFieldControl | null>(null)
	return {
		control,
		register(getId: () => string, isLabelable: boolean): (() => void) | undefined {
			if (control.value) return undefined
			const entry = { getId, isLabelable }
			control.value = entry
			return () => {
				if (control.value === entry) control.value = null
			}
		},
	}
}

export function useBaseFormField(props: FormFieldProps) {
	const standard = useStandardBaseComponent('base-form-field', props, FIELD_ELEMENTS)
	const rootRef = ref<HTMLElement | null>(null)
	const { labelId, descriptionId, errorId } = useFieldIds()
	const { formField, error } = useFieldError(props)
	const { control, register } = useControlRegistry()
	const describedBy = computed(() => {
		if (error.value) return errorId
		return props.description ? descriptionId : undefined
	})

	provide(FORM_FIELD_CONTEXT_KEY, {
		labelId,
		hasLabel: computed(() => Boolean(props.label)),
		describedBy,
		hasError: computed(() => Boolean(error.value)),
		isRequired: computed(() => props.isRequired),
		register,
	})

	return {
		...standard,
		rootRef,
		labelId,
		descriptionId,
		errorId,
		error,
		describedBy,
		controlId: computed(() => props.for ?? (control.value?.isLabelable ? control.value.getId() : undefined)),
		isGroup: computed(() => Boolean(props.label) && !props.for && !control.value),
		exposed: { rootRef, validate: formField.validate, reset: formField.reset },
	}
}
