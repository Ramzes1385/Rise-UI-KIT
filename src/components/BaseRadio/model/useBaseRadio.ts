import { ref, useId } from 'vue'
import { useFormField } from '@composables/form/useFormField'
import type { BaseRadioEmits, RadioProps } from '../types/BaseRadio.types'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'

const RADIO_ELEMENTS = ['root', 'label', 'options', 'radio', 'wrapper', 'input', 'circle', 'dot', 'optionLabel', 'errorText']

export function useBaseRadio(props: RadioProps, emit: BaseRadioEmits) {
	const rootRef = ref<HTMLElement | null>(null)
	const groupId = useId()
	const formField = useFormField({ value: () => props.modelValue, error: () => props.error, isRequired: () => props.isRequired })

	return {
		...useStandardBaseComponent('base-radio', props, RADIO_ELEMENTS),
		rootRef,
		labelId: `${groupId}-label`,
		errorId: `${groupId}-error`,
		formField,
		handleChange(value: string | number): void {
			emit('update:modelValue', value)
			emit('change', value)
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
