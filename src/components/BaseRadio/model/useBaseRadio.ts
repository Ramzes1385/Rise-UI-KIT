import { computed, ref, useId } from 'vue'
import { useFormField } from '@composables/form/useFormField'
import { useFieldControl } from '@composables/form/useFormContext'
import type { BaseRadioEmits, RadioProps } from '../types/BaseRadio.types'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'

const RADIO_ELEMENTS = ['root', 'label', 'options', 'radio', 'wrapper', 'input', 'circle', 'dot', 'optionLabel', 'errorText']

function useRadioGroupField(props: RadioProps) {
	const groupId = useId()
	const labelId = `${groupId}-label`
	const errorId = `${groupId}-error`
	const formField = useFormField({ value: () => props.modelValue, error: () => props.error, isRequired: () => props.isRequired })
	const control = useFieldControl({
		isLabelable: false,
		describedBy: () => (formField.error ? errorId : undefined),
		hasError: () => Boolean(formField.error),
		isRequired: () => props.isRequired,
	})
	const labelledBy = computed(() => (props.label ? labelId : control.fieldLabelId.value))

	return {
		labelId,
		errorId,
		formField,
		control,
		groupAttrs: computed(() => ({
			'aria-labelledby': labelledBy.value,
			'aria-label': labelledBy.value ? undefined : props.ariaLabel,
			...control.aria.value,
		})),
	}
}

export function useBaseRadio(props: RadioProps, emit: BaseRadioEmits) {
	const rootRef = ref<HTMLElement | null>(null)
	const field = useRadioGroupField(props)

	return {
		...useStandardBaseComponent('base-radio', props, RADIO_ELEMENTS),
		...field,
		rootRef,
		handleChange(value: string | number): void {
			emit('update:modelValue', value)
			emit('change', value)
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
