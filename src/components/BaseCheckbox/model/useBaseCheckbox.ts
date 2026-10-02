import { computed, ref, useId } from 'vue'
import { toHTMLInputElement } from '@utils/dom/domUtils'
import { useFormField } from '@composables/form/useFormField'
import { useFieldControl } from '@composables/form/useFormContext'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseCheckboxEmits, CheckboxProps } from '../types/BaseCheckbox.types'

const CHECKBOX_ELEMENTS = ['root', 'labelWrapper', 'wrapper', 'input', 'box', 'icon', 'label', 'errorText']

function useCheckboxControl(props: CheckboxProps) {
	const errorId = `${useId()}-error`
	const formField = useFormField({ value: () => props.modelValue, error: () => props.error })
	const control = useFieldControl({
		id: () => props.inputAttrs?.id as string | undefined,
		hasOwnLabel: () => Boolean(props.label),
		describedBy: () =>
			[formField.error ? errorId : undefined, props.inputAttrs?.['aria-describedby']].filter(Boolean).join(' ') || undefined,
		hasError: () => Boolean(formField.error),
	})

	return {
		errorId,
		formField,
		control,
		nativeAttrs: computed(() => ({
			...props.inputAttrs,
			...(props.ariaLabel ? { 'aria-label': props.ariaLabel } : {}),
			...control.aria.value,
			id: control.id.value,
		})),
	}
}

export function useBaseCheckbox(props: CheckboxProps, emit: BaseCheckboxEmits) {
	const rootRef = ref<HTMLElement | null>(null)
	const field = useCheckboxControl(props)

	return {
		...useStandardBaseComponent('base-checkbox', props, CHECKBOX_ELEMENTS),
		...field,
		rootRef,
		handleChange(event: Event): void {
			const target = toHTMLInputElement(event.target)
			if (!target) return
			emit('update:modelValue', target.checked)
			emit('change', target.checked)
			target.indeterminate = props.isIndeterminate
		},
		exposed: {
			rootRef,
			focus: () => rootRef.value?.querySelector('input')?.focus(),
			blur: () => rootRef.value?.querySelector('input')?.blur(),
			validate: field.formField.validate,
			reset: field.formField.reset,
		},
	}
}
