import { computed, useId } from 'vue'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { useFieldControl, useFormDisabled } from '@composables/useFormContext'
import type { BaseSegmentedEmits, BaseSegmentedProps } from '../types/BaseSegmented.types'

export function useBaseSegmented(props: BaseSegmentedProps, emit: BaseSegmentedEmits) {
	const ownId = useId()
	const labelId = `${ownId}-label`
	const errorId = `${ownId}-error`
	const control = useFieldControl({
		isLabelable: false,
		describedBy: () => (props.error ? errorId : undefined),
		hasError: () => Boolean(props.error),
	})

	return {
		...useStandardBaseComponent('base-segmented', props, ['root', 'label', 'track', 'segment', 'error']),
		labelId,
		errorId,
		radioName: computed(() => props.name ?? `rise-segmented-${ownId}`),
		isControlDisabled: useFormDisabled(() => props.isDisabled),
		control,
		labelledBy: computed(() => (props.label ? labelId : control.fieldLabelId.value)),
		select(value: string | number): void {
			emit('update:modelValue', value)
			emit('change', value)
		},
	}
}
