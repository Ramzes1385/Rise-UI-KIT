import type { UiClassFn } from '@composables/base/useUi'
import type { BaseSearchPart, SearchVariant } from './BaseSearch.types'

export interface BaseSearchInputProps {
	modelValue: string
	placeholder: string
	variant: SearchVariant
	sizeScale: number
	isDisabled: boolean
	error: string
	hasIcon: boolean
	hasClear: boolean
	isLoading: boolean
	inputClass?: string | Record<string, string | undefined>
	classes: Record<string, string | undefined>
	/** ARIA-атрибуты поля как combobox (role, aria-expanded, aria-controls, aria-activedescendant): ставятся на <input> */
	comboboxAttributes?: Record<string, string | undefined>
	/** Классы частей поиска (`ui` компонента BaseSearch) */
	ui: UiClassFn<BaseSearchPart>
}

export interface BaseSearchInputEmits {
	(event: 'update:modelValue', value: string): void
	(event: 'keydown', e: KeyboardEvent): void
	(event: 'focus'): void
	(event: 'blur'): void
	(event: 'clear'): void
}

export interface BaseSearchInputExpose {
	/** Устанавливает фокус на поле ввода */
	focus: () => void
	/** Снимает фокус с поля ввода */
	blur: () => void
}
