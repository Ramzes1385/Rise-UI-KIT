import { ref } from 'vue'
import type { BaseInput } from '@components/BaseInput'
import { useTriggerAttributes } from '@composables/overlay/useTriggerAttributes'
import type { BaseSearchInputEmits, BaseSearchInputExpose, BaseSearchInputProps } from '../types/BaseSearchInput.types'

export function useBaseSearchInput(props: BaseSearchInputProps, emit: BaseSearchInputEmits) {
	const inputRef = ref<InstanceType<typeof BaseInput> | null>(null)
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
			blur: (): void => inputRef.value?.blur(),
		} satisfies BaseSearchInputExpose,
	}
}
