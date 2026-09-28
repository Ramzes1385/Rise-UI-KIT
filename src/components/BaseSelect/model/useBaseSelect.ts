import type { ComputedRef } from 'vue'
import { computed, ref, useId } from 'vue'
import { UI_TEXT } from '@/locales/messages'
import { useSelect } from '@composables/useSelect'
import { useFormField } from '@composables/useFormField'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import type { BaseSelectEmits, SelectProps } from '../types/BaseSelect.types'
import { useFieldControl, useFormDisabled } from '@composables/useFormContext'

const SELECT_ELEMENTS = [
	'root',
	'dropdown',
	'label',
	'required',
	'trigger',
	'values',
	'tag',
	'tagText',
	'tagClose',
	'placeholder',
	'icon',
	'valueText',
	'arrow',
	'errorText',
	'dropdownContent',
	'search',
	'searchInput',
	'options',
	'option',
	'checkbox',
	'optionIcon',
	'optionContent',
	'optionLabel',
	'optionDesc',
	'noResults',
]

function isPrintableKey(event: KeyboardEvent): boolean {
	return event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey
}

function useSelectField(props: SelectProps) {
	const baseId = useId()
	const labelId = `${baseId}-label`
	const errorId = `${baseId}-error`
	const listboxId = `${baseId}-listbox`
	const formField = useFormField({ value: () => props.modelValue, error: () => props.error, isRequired: () => props.isRequired })
	const isControlDisabled = useFormDisabled(() => props.isDisabled)
	const control = useFieldControl({
		isLabelable: false,
		describedBy: () => (formField.error ? errorId : undefined),
		hasError: () => Boolean(formField.error),
		isRequired: () => props.isRequired,
	})

	return {
		labelId,
		errorId,
		listboxId,
		formField,
		isControlDisabled,
		control,
		getOptionId: (index: number): string => `${listboxId}-option-${index}`,
		triggerLabelledBy: computed(() => (props.label ? labelId : control.fieldLabelId.value)),
	}
}

function createTriggerKeys(select: ReturnType<typeof useSelect>, closeDropdown: () => void): Map<string, (event: KeyboardEvent) => void> {
	const toggleOrSelect = (event: KeyboardEvent): void => {
		event.preventDefault()
		if (select.isOpen.value && select.activeIndex.value >= 0) select.selectActive()
		else select.toggleDropdown()
	}
	const moveOrOpen = (event: KeyboardEvent): void => {
		event.preventDefault()
		if (select.isOpen.value) select.moveActive(event.key === 'ArrowDown' ? 1 : -1)
		else select.openDropdown()
	}
	const openAtEdge = (event: KeyboardEvent): void => {
		event.preventDefault()
		select.openDropdown()
		select.setActiveEdge(event.key === 'Home' ? 'first' : 'last')
	}
	return new Map<string, (event: KeyboardEvent) => void>([
		['Enter', toggleOrSelect],
		[' ', toggleOrSelect],
		['ArrowDown', moveOrOpen],
		['ArrowUp', moveOrOpen],
		['Home', openAtEdge],
		['End', openAtEdge],
		[
			'Tab',
			() => {
				if (select.isOpen.value) closeDropdown()
			},
		],
	])
}

function useSelectKeys(props: SelectProps, select: ReturnType<typeof useSelect>, isDisabled: ComputedRef<boolean>) {
	const closeDropdown = (): void => {
		select.isOpen.value = false
		select.handleClose()
	}
	const triggerKeys = createTriggerKeys(select, closeDropdown)

	return {
		handleTriggerKeydown(event: KeyboardEvent): void {
			if (isDisabled.value) return
			if (event.key === ' ' && select.isTypingAhead()) {
				event.preventDefault()
				select.typeaheadActive(' ')
				return
			}
			const action = triggerKeys.get(event.key)
			if (action) {
				action(event)
				return
			}
			if (props.isSearchable || !isPrintableKey(event)) return
			event.preventDefault()
			select.openDropdown()
			select.typeaheadActive(event.key)
		},
		handleSearchKeydown(event: KeyboardEvent): void {
			if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
				event.preventDefault()
				select.moveActive(event.key === 'ArrowDown' ? 1 : -1)
			} else if (event.key === 'Enter') {
				event.preventDefault()
				select.selectActive()
			} else if (event.key === 'Tab') {
				event.preventDefault()
				closeDropdown()
			}
		},
	}
}

export function useBaseSelect(props: SelectProps, emit: BaseSelectEmits) {
	const standard = useStandardBaseComponent('base-select', props, SELECT_ELEMENTS)
	const field = useSelectField(props)
	const selectRef = ref<HTMLDivElement | null>(null)
	const select = useSelect({ props, emit, onBlur: field.formField.onBlur, isDisabled: () => field.isControlDisabled.value })

	return {
		...standard,
		...field,
		resolvedPlaceholder: computed(() => props.placeholder ?? UI_TEXT.SELECT_PLACEHOLDER),
		selectRef,
		...select,
		hasTags: computed(() => props.isMultiple && Array.isArray(props.modelValue) && props.modelValue.length > 0),
		focusTrigger(): void {
			if (!field.isControlDisabled.value) selectRef.value?.focus()
		},
		...useSelectKeys(props, select, field.isControlDisabled),
		exposed: {
			rootRef: selectRef,
			selectRef,
			focus: () => selectRef.value?.focus(),
			blur: () => selectRef.value?.blur(),
			validate: field.formField.validate,
			reset: field.formField.reset,
		},
	}
}
