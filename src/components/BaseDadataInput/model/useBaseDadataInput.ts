import { useUi } from '@composables/base/useUi'
import { computed, nextTick, ref, shallowRef, watch } from 'vue'
import { useCustomClass } from '@composables/base/useCustomClass'
import { DADATA_INPUT_PARTS } from '../types/BaseDadataInput.types'
import { UI_DADATA, UI_REQUISITES, UI_TEXT } from '@/locales/messages'
import type { DadataKind, DadataSuggestion } from '@utils/data/dadataUtils'
import { useRemoteSuggestions } from '@composables/form/useRemoteSuggestions'
import { builtInError, digitError, meetsPrecision, precisionOf } from './dadataChecks'
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

function useSuggestionModel(props: BaseDadataInputProps, emit: BaseDadataInputEmits) {
	const suggestion = shallowRef<DadataSuggestion | null>(props.suggestion ?? null)
	watch(
		() => props.suggestion,
		next => {
			suggestion.value = next ?? null
		},
	)
	return {
		suggestion,
		setSuggestion(next: DadataSuggestion | null): void {
			if (next === suggestion.value) return
			suggestion.value = next
			emit('update:suggestion', next)
		},
	}
}

function useValueModel(props: BaseDadataInputProps, emit: BaseDadataInputEmits) {
	const value = shallowRef(props.modelValue ?? '')
	watch(
		() => props.modelValue,
		next => {
			value.value = next ?? ''
		},
	)
	return {
		value,
		setValue(next: string): void {
			value.value = next
			emit('update:modelValue', next)
		},
	}
}

function useValidation(props: BaseDadataInputProps, value: () => string, suggestion: () => DadataSuggestion | null) {
	const isTouched = ref(false)
	const error = computed(() => builtInError(props, value(), suggestion()))
	return {
		isTouched,
		validity: computed<boolean | null>(() => {
			if (error.value) return false
			return value().trim() ? true : null
		}),
		shownError: computed(() => props.error || (isTouched.value ? error.value : '')),
	}
}

function useDadataState(props: BaseDadataInputProps, emit: BaseDadataInputEmits) {
	const remote = useRemoteSuggestions({
		source: useDadataSource(props),
		minChars: () => props.minChars ?? 3,
		debounce: () => props.debounce ?? 300,
	})
	const valueModel = useValueModel(props, emit)
	const suggestionModel = useSuggestionModel(props, emit)
	const validation = useValidation(
		props,
		() => valueModel.value.value,
		() => suggestionModel.suggestion.value,
	)
	return {
		...remote,
		...valueModel,
		...suggestionModel,
		...validation,
		digitMessage: shallowRef(''),
		isEditing: ref(false),
		autocompleteRef: ref<{ open: () => void } | null>(null),
	}
}

function useHandlers(props: BaseDadataInputProps, emit: BaseDadataInputEmits, state: ReturnType<typeof useDadataState>) {
	const runSearch = (query: string): void => {
		state.digitMessage.value = digitError(props.kind ?? 'address', query)
		if (!state.digitMessage.value) return state.search(query)
		state.cancel()
		state.suggestions.value = []
		state.isLoading.value = false
	}
	const isOpenPending = ref(false)
	const openList = (): void => void nextTick(() => state.autocompleteRef.value?.open())
	watch(state.isLoading, isLoading => {
		if (isLoading || !isOpenPending.value) return
		isOpenPending.value = false
		openList()
	})
	const handleChange = (next: string | number | null): void => {
		const text = String(next ?? '')
		const found = state.suggestions.value.find(item => item.value === text)
		state.isEditing.value = false
		if (found && !meetsPrecision(found, precisionOf(props))) {
			state.setValue(`${text} `)
			state.setSuggestion(null)
			runSearch(state.value.value)
			isOpenPending.value = state.isLoading.value
			return state.isLoading.value ? undefined : openList()
		}
		state.setValue(text)
		state.setSuggestion(found ?? null)
		if (!found) return
		emit('select', found, dadataRequisites(found))
		emit('validate', state.validity.value)
	}
	return {
		handleChange,
		handleSearch(query: string): void {
			state.isEditing.value = true
			state.isTouched.value = false
			isOpenPending.value = false
			if (state.suggestion.value && query !== state.suggestion.value.value) state.setSuggestion(null)
			runSearch(query)
		},
		handleBlur(): void {
			isOpenPending.value = false
			if (state.isEditing.value) handleChange('')
			state.isTouched.value = true
			emit('validate', state.validity.value)
		},
	}
}

function useWrapperUi(props: BaseDadataInputProps) {
	const ui = useUi(props, 'base-dadata-input')
	return {
		ui,
		autocompleteUi: computed(() =>
			Object.fromEntries(DADATA_INPUT_PARTS.map(part => [part, ui(part).slice(`base-dadata-input__${part}`.length).trim()])),
		),
	}
}

export function useBaseDadataInput(props: BaseDadataInputProps, emit: BaseDadataInputEmits) {
	const state = useDadataState(props, emit)
	const kind = computed(() => props.kind ?? 'address')
	return {
		autocompleteRef: state.autocompleteRef,
		...useWrapperUi(props),
		classes: useCustomClass({ getClass: () => props.customClass, elementKeys: ['root', 'field', 'panel', 'option'] }).classes,
		fieldValue: computed(() => (state.isEditing.value ? null : state.value.value || null)),
		isLoading: state.isLoading,
		shownError: state.shownError,
		emptyText: computed(() => state.digitMessage.value || UI_TEXT.NO_RESULTS),
		kindLabel: computed(() => UI_DADATA[KIND_LABELS[kind.value]]),
		inputAttrs: computed(() => INPUT_ATTRS[kind.value]),
		options: computed(() =>
			state.suggestions.value.map(item => ({ value: item.value, label: item.value, description: describe(kind.value, item) })),
		),
		...useHandlers(props, emit, state),
	}
}
