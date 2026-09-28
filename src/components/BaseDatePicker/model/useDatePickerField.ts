import { computed, ref, watchPostEffect } from 'vue'
import type { BaseInput } from '@components/BaseInput'
import { useCustomClass } from '@composables/useCustomClass'
import { useExplicitPropDetection } from '@composables/useExplicitPropDetection'
import type { DatePickerFieldEmits, DatePickerFieldProps } from '../types/DatePickerField.types'

function useFieldResolvedProps(props: DatePickerFieldProps) {
	const { resolveBooleanPropDefault } = useExplicitPropDetection()
	return computed(() => ({
		label: props.label ?? '',
		error: props.error ?? '',
		isDisabled: props.isDisabled ?? false,
		isReadonly: resolveBooleanPropDefault('isReadonly', props.isReadonly, true),
		isRequired: props.isRequired ?? false,
		isClearable: props.isClearable ?? false,
		isOpen: props.isOpen ?? false,
		hasValue: props.hasValue ?? false,
		sizeScale: props.sizeScale ?? 100,
	}))
}

export function useDatePickerField(props: DatePickerFieldProps, emit: DatePickerFieldEmits) {
	const resolvedProps = useFieldResolvedProps(props)
	const { classes } = useCustomClass({
		getClass: () => props.customClass,
		elementKeys: ['root', 'input', 'clearBtn', 'clearIcon', 'iconBtn', 'calendarIcon'],
	})
	const inputRef = ref<InstanceType<typeof BaseInput> | null>(null)

	watchPostEffect(() => {
		const input = inputRef.value?.inputRef
		if (input) input.readOnly = resolvedProps.value.isReadonly
	})

	return {
		resolvedProps,
		classes,
		inputRef,
		handleFieldClick: (): void => emit('field-click'),
		handleClearClick: (): void => emit('clear-click'),
		handleIconClick: (): void => emit('icon-click'),
		handleFieldKeydown(event: KeyboardEvent): void {
			if (resolvedProps.value.isDisabled) return
			if (event.key !== 'Enter' && event.key !== 'ArrowDown') return
			event.preventDefault()
			emit('keyboard-open')
		},
	}
}
