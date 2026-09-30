import { computed, shallowRef, watch } from 'vue'
import { UI_DADATA, UI_REQUISITES } from '@/locales/messages'
import { useCustomClass } from '@composables/base/useCustomClass'
import type { DadataKind, DadataSuggestion } from '@utils/data/dadataUtils'
import { useRemoteSuggestions } from '@composables/form/useRemoteSuggestions'
import type { BaseDadataInputEmits, BaseDadataInputProps } from '../types/BaseDadataInput.types'
import { createDadataSource, dadataAddressText, dadataRequisites } from '@utils/data/dadataUtils'

const KIND_LABELS = { address: 'ADDRESS', party: 'PARTY', bank: 'BANK', fio: 'FIO', email: 'EMAIL' } as const

const INPUT_ATTRS: Record<DadataKind, Record<string, string>> = {
	address: { autocomplete: 'off' },
	party: { autocomplete: 'off' },
	bank: { autocomplete: 'off' },
	fio: { autocomplete: 'off', spellcheck: 'false' },
	email: { autocomplete: 'off', inputmode: 'email', spellcheck: 'false' },
}

function describe(kind: DadataKind, suggestion: DadataSuggestion): string | undefined {
	const requisites = dadataRequisites(suggestion)
	const address = dadataAddressText(suggestion)
	if (kind === 'party' && requisites.inn) return [`${UI_REQUISITES.INN} ${requisites.inn}`, address].filter(Boolean).join(' · ')
	if (kind === 'bank' && requisites.bik) return [`${UI_REQUISITES.BIK} ${requisites.bik}`, address].filter(Boolean).join(' · ')
	if (kind === 'address' && suggestion.unrestrictedValue !== suggestion.value) return suggestion.unrestrictedValue
	return undefined
}

function useDadataSource(props: BaseDadataInputProps) {
	const builtIn = computed(() =>
		createDadataSource(props.kind ?? 'address', {
			token: props.token,
			baseUrl: props.baseUrl,
			count: props.count,
			params: props.params,
		}),
	)
	return () => props.source ?? builtIn.value
}

export function useBaseDadataInput(props: BaseDadataInputProps, emit: BaseDadataInputEmits) {
	const { suggestions, isLoading, search } = useRemoteSuggestions({
		source: useDadataSource(props),
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
	const kind = computed(() => props.kind ?? 'address')
	return {
		classes: useCustomClass({ getClass: () => props.customClass, elementKeys: ['root', 'field', 'panel', 'option'] }).classes,
		value,
		isLoading,
		kindLabel: computed(() => UI_DADATA[KIND_LABELS[kind.value]]),
		inputAttrs: computed(() => INPUT_ATTRS[kind.value]),
		options: computed(() =>
			suggestions.value.map(item => ({ value: item.value, label: item.value, description: describe(kind.value, item) })),
		),
		search,
		handleChange(next: string | number | null): void {
			value.value = String(next ?? '')
			emit('update:modelValue', value.value)
			const suggestion = suggestions.value.find(item => item.value === value.value)
			if (suggestion) emit('select', suggestion, dadataRequisites(suggestion))
		},
	}
}
