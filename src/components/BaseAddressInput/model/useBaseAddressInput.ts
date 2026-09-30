import { useCustomClass } from '@composables/base/useCustomClass'
import { computed, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import type { AddressSuggestion, BaseAddressInputEmits, BaseAddressInputProps } from '../types/BaseAddressInput.types'

function useSuggestions(props: BaseAddressInputProps) {
	const suggestions = shallowRef<AddressSuggestion[]>([])
	const isLoading = ref(false)
	let timer: ReturnType<typeof setTimeout> | undefined
	let controller: AbortController | null = null
	const stop = (): void => {
		clearTimeout(timer)
		controller?.abort()
	}
	const load = async (query: string, current: AbortController): Promise<void> => {
		try {
			const found = await props.source(query, { signal: current.signal })
			if (!current.signal.aborted) suggestions.value = found
		} catch {
			if (!current.signal.aborted) suggestions.value = []
		} finally {
			if (!current.signal.aborted) isLoading.value = false
		}
	}
	onBeforeUnmount(stop)
	return {
		suggestions,
		isLoading,
		search(query: string): void {
			stop()
			const isShort = query.trim().length < (props.minChars ?? 3)
			isLoading.value = !isShort
			if (isShort) suggestions.value = []
			else timer = setTimeout(() => void load(query, (controller = new AbortController())), props.debounce ?? 300)
		},
	}
}

export function useBaseAddressInput(props: BaseAddressInputProps, emit: BaseAddressInputEmits) {
	const { suggestions, isLoading, search } = useSuggestions(props)
	const value = shallowRef(props.modelValue ?? '')
	watch(
		() => props.modelValue,
		next => {
			value.value = next ?? ''
		},
	)
	return {
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
