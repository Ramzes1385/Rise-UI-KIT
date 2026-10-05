import { computed, ref, useId } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { UI_TEXT } from '@/locales/messages'
import { useUi } from '@composables/base/useUi'
import { useMotion } from '@composables/app/useMotion'
import { useFormField } from '@composables/form/useFormField'
import { useSelect, useSelectKeys } from '@composables/form/useSelect'
import type { BaseSelectEmits, SelectProps } from '../types/BaseSelect.types'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import { useFieldControl, useFormDisabled } from '@composables/form/useFormContext'

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

function useSelectField(props: SelectProps) {
	const baseId = useId()
	const labelId = `${baseId}-label`
	const errorId = `${baseId}-error`
	const listboxId = `${baseId}-listbox`
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
		labelId,
		errorId,
		listboxId,
		formField,
		isControlDisabled,
		control,
		getOptionId: (index: number): string => `${listboxId}-option-${index}`,
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

function useSelectKeyboard(props: SelectProps, select: ReturnType<typeof useSelect>, isDisabled: ComputedRef<boolean>) {
	const { closeDropdown, handleTriggerKeydown } = useSelectKeys({
		select,
		isDisabled: () => isDisabled.value,
		isSearchable: () => Boolean(props.isSearchable),
	})

	return {
		handleTriggerKeydown,
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

function useSelectMotion(selectRef: Ref<HTMLDivElement | null>) {
	const motion = useMotion(selectRef)

	return {
		isMotionReduced: motion.isReduced,
		holdLeavingTag(element: Element): void {
			const tag = element as HTMLElement
			tag.style.left = `${tag.offsetLeft}px`
			tag.style.top = `${tag.offsetTop}px`
			tag.style.width = `${tag.offsetWidth}px`
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
		ui: useUi(props, 'base-select'),
		...useSelectMotion(selectRef),
		resolvedPlaceholder: computed(() => props.placeholder ?? UI_TEXT.SELECT_PLACEHOLDER),
		selectRef,
		...select,
		hasTags: computed(() => props.isMultiple && Array.isArray(props.modelValue) && props.modelValue.length > 0),
		focusTrigger(): void {
			if (!field.isControlDisabled.value) selectRef.value?.focus()
		},
		...useSelectKeyboard(props, select, field.isControlDisabled),
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
