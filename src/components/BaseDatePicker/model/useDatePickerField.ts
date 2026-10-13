import { computed, ref, watchPostEffect } from 'vue'
import type { BaseInput } from '@components/BaseInput'
import { inputUiOf, partClassOf } from './datePickerUi'
import { useCustomClass } from '@composables/base/useCustomClass'
import { useExplicitPropDetection } from '@composables/base/useExplicitPropDetection'
import type { DatePickerFieldEmits, DatePickerFieldProps } from '../types/DatePickerField.types'

function resolveEditingProps(props: DatePickerFieldProps) {
	return { isEditable: props.isEditable ?? false, hasDraft: props.hasDraft ?? false }
}

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
		...resolveEditingProps(props),
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
	const ui = partClassOf(props)

	watchPostEffect(() => {
		const input = inputRef.value?.inputRef
		if (input) input.readOnly = resolvedProps.value.isReadonly
	})

	function handleDraftKey(event: KeyboardEvent): boolean {
		const { isEditable, hasDraft } = resolvedProps.value
		if (!isEditable || !hasDraft) return false
		if (event.key === 'Escape') emit('text-cancel')
		if (event.key === 'Enter') {
			event.preventDefault()
			emit('text-commit')
		}
		return event.key === 'Enter'
	}

	return {
		ui,
		inputUi: computed(() => inputUiOf(ui)),
		resolvedProps,
		classes,
		inputRef,
		handleFieldClick: (): void => emit('field-click'),
		handleClearClick: (): void => emit('clear-click'),
		handleIconClick: (): void => emit('icon-click'),
		handleInput(value: string): void {
			if (resolvedProps.value.isEditable) emit('text-input', value)
		},
		handleBlur(): void {
			if (resolvedProps.value.isEditable) emit('text-commit')
		},
		handleFieldKeydown(event: KeyboardEvent): void {
			if (resolvedProps.value.isDisabled || handleDraftKey(event)) return
			if (event.key !== 'Enter' && event.key !== 'ArrowDown') return
			event.preventDefault()
			emit('keyboard-open')
		},
	}
}
