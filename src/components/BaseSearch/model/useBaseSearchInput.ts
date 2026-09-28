/** Composable: логика BaseSearchInput — атрибуты combobox на нативном поле и события поля поиска */
import { ref } from 'vue'
import { useTriggerAttributes } from '@composables/useTriggerAttributes'
import type { BaseInput } from '@components/BaseInput'
import type { BaseSearchInputEmits, BaseSearchInputExpose, BaseSearchInputProps } from '../types/BaseSearchInput.types'

export function useBaseSearchInput(props: BaseSearchInputProps, emit: BaseSearchInputEmits) {
	const inputRef = ref<InstanceType<typeof BaseInput> | null>(null)
	// Поле — combobox (APG «combobox with listbox popup»): атрибуты ставятся на сам <input> внутри BaseInput
	useTriggerAttributes(
		() => inputRef.value?.$el as HTMLElement | undefined,
		() => props.comboboxAttributes ?? {},
	)

	return {
		inputRef,
		handleInput: (value: string): void => emit('update:modelValue', value),
		handleKeydown: (e: KeyboardEvent): void => emit('keydown', e),
		handleFocus: (): void => emit('focus'),
		handleBlur: (): void => emit('blur'),
		handleClear: (): void => emit('clear'),
		exposed: {
			focus: (): void => inputRef.value?.focus(),
		} satisfies BaseSearchInputExpose,
	}
}
