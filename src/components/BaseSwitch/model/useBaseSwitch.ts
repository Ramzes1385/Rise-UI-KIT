import { ref, useId } from 'vue'
import { toHTMLInputElement } from '@utils/domUtils'
import { useFormField } from '@composables/useFormField'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import type { BaseSwitchEmits, SwitchProps } from '../types/BaseSwitch.types'

const SWITCH_ELEMENTS = ['root', 'row', 'wrapper', 'input', 'slider', 'handle', 'content', 'label', 'required', 'errorText']

export function useBaseSwitch(props: SwitchProps, emit: BaseSwitchEmits) {
	const inputId = useId()
	const rootRef = ref<HTMLElement | null>(null)
	const formField = useFormField({ value: () => props.modelValue, error: () => props.error, isRequired: () => props.isRequired })

	return {
		...useStandardBaseComponent('base-switch', props, SWITCH_ELEMENTS),
		inputId,
		errorId: `${inputId}-error`,
		rootRef,
		formField,
		handleChange(event: Event): void {
			const target = toHTMLInputElement(event.target)
			if (!target) return
			emit('update:modelValue', target.checked)
			emit('change', target.checked)
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
