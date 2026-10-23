import { computed, useId } from 'vue'
import { UI_TEXT } from '@/locales/messages'
import { useFormField } from '@composables/form/useFormField'
import type { CascaderProps } from '../types/BaseCascader.types'
import { useFieldControl, useFormDisabled } from '@composables/form/useFormContext'

export function useCascaderField(props: CascaderProps) {
	const baseId = useId()
	const labelId = `${baseId}-label`
	const errorId = `${baseId}-error`
	const formField = useFormField({ value: () => props.modelValue, error: () => props.error, isRequired: () => props.isRequired })
	const isControlDisabled = useFormDisabled(() => props.isDisabled)
	const control = useFieldControl({
		id: () => props.triggerAttrs?.id as string | undefined,
		isLabelable: false,
		describedBy: () =>
			[formField.error ? errorId : undefined, props.triggerAttrs?.['aria-describedby']].filter(Boolean).join(' ') || undefined,
		hasError: () => Boolean(formField.error),
		isRequired: () => props.isRequired,
	})
	const triggerLabelledBy = computed(() => (props.label ? labelId : control.fieldLabelId.value))
	const unlabelledName = computed(() => props.ariaLabel || props.placeholder || UI_TEXT.SELECT_PLACEHOLDER)

	return {
		baseId,
		labelId,
		errorId,
		formField,
		isControlDisabled,
		control,
		triggerLabelledBy,
		unlabelledName,
		triggerAttrs: computed(() => ({
			...props.triggerAttrs,
			id: control.id.value,
			'aria-labelledby': triggerLabelledBy.value,
			'aria-label': triggerLabelledBy.value ? undefined : unlabelledName.value,
			...control.aria.value,
		})),
	}
}
