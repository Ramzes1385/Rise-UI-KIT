/** Composable: логика BaseCheckbox — изменение, частичный выбор и проверка */
import { ref, useId } from 'vue'
import { toHTMLInputElement } from '@utils/domUtils'
import { useFormField } from '@composables/useFormField'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import type { BaseCheckboxEmits, CheckboxProps } from '../types/BaseCheckbox.types'

const CHECKBOX_ELEMENTS = ['root', 'labelWrapper', 'wrapper', 'input', 'box', 'icon', 'label', 'errorText']

export function useBaseCheckbox(props: CheckboxProps, emit: BaseCheckboxEmits) {
	const rootRef = ref<HTMLElement | null>(null)
	const formField = useFormField({ value: () => props.modelValue, error: () => props.error })

	return {
		...useStandardBaseComponent('base-checkbox', props, CHECKBOX_ELEMENTS),
		/** id обёртки ошибки: чекбокс связан с ней через aria-describedby (и для текста error, и для слота error) */
		errorId: `${useId()}-error`,
		formField,
		rootRef,
		handleChange(event: Event): void {
			const target = toHTMLInputElement(event.target)
			if (!target) return
			emit('update:modelValue', target.checked)
			emit('change', target.checked)
			// Клик снимает indeterminate у элемента; вернуть его, если родитель оставил частичный выбор
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
