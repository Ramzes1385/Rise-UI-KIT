import { ref, useId } from 'vue'
import { toHTMLInputElement } from '@utils/dom/domUtils'
import { useFormField } from '@composables/form/useFormField'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseCheckboxEmits, CheckboxProps } from '../types/BaseCheckbox.types'

const CHECKBOX_ELEMENTS = ['root', 'labelWrapper', 'wrapper', 'input', 'box', 'icon', 'label', 'errorText']

export function useBaseCheckbox(props: CheckboxProps, emit: BaseCheckboxEmits) {
	const rootRef = ref<HTMLElement | null>(null)
	const formField = useFormField({ value: () => props.modelValue, error: () => props.error })

	return {
		...useStandardBaseComponent('base-checkbox', props, CHECKBOX_ELEMENTS),
		errorId: `${useId()}-error`,
		formField,
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
			validate: formField.validate,
			reset: formField.reset,
		},
	}
}
