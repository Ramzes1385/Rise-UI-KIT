import { useUi } from '@composables/base/useUi'
import { computed, shallowRef, watch } from 'vue'
import { useCustomClass } from '@composables/base/useCustomClass'
import { ADDRESS_INPUT_PARTS } from '../types/BaseAddressInput.types'
import { useRemoteSuggestions } from '@composables/form/useRemoteSuggestions'
import type { BaseAddressInputEmits, BaseAddressInputProps } from '../types/BaseAddressInput.types'

function useWrapperUi(props: BaseAddressInputProps) {
	const ui = useUi(props, 'base-address-input')
	return {
		ui,
		autocompleteUi: computed(() =>
			Object.fromEntries(ADDRESS_INPUT_PARTS.map(part => [part, ui(part).slice(`base-address-input__${part}`.length).trim()])),
		),
	}
}

export function useBaseAddressInput(props: BaseAddressInputProps, emit: BaseAddressInputEmits) {
	const { suggestions, isLoading, search } = useRemoteSuggestions({
		source: () => props.source,
		minChars: () => props.minChars ?? 3,
		debounce: () => props.debounce ?? 300,
	})
	const value = shallowRef(props.modelValue ?? '')
	watch(
		() => props.modelValue,
		next => {
			value.value = next ?? ''
		},
	)
	return {
		...useWrapperUi(props),
		classes: useCustomClass({ getClass: () => props.customClass, elementKeys: ['root', 'field', 'panel', 'option'] }).classes,
		value,
		isLoading,
		options: computed(() =>
			suggestions.value.map(item => ({ value: item.value, label: item.value, description: item.unrestrictedValue })),
		),
		search,
		handleChange(next: string | number | null): void {
			value.value = String(next ?? '')
			emit('update:modelValue', value.value)
			const suggestion = suggestions.value.find(item => item.value === value.value)
			if (suggestion) emit('select', suggestion)
		},
	}
}
