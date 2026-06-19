import type { SearchVariant } from './BaseSearch.types'

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
}

export interface BaseSearchInputEmits {
	(event: 'update:modelValue', value: string): void
	(event: 'keydown', e: KeyboardEvent): void
	(event: 'focus'): void
	(event: 'blur'): void
	(event: 'clear'): void
}

/**
 * Публичный контракт BaseSearchInput (defineExpose)
 */
export interface BaseSearchInputExpose {
	/** Устанавливает фокус на поле ввода */
	focus: () => void
}
