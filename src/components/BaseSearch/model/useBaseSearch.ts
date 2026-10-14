import type { Ref } from 'vue'
import { computed, ref, useId } from 'vue'
import { UI_TEXT } from '@/locales/messages'
import { useUi } from '@composables/base/useUi'
import { useSearchMotion } from './useSearchMotion'
import { getSearchOptionId } from './searchOptionId'
import { getLocale, pluralize } from '@/locales/state'
import type BaseSearchInput from '../ui/BaseSearchInput.vue'
import { useFormField } from '@composables/form/useFormField'
import type BaseSearchOverlay from '../ui/BaseSearchOverlay.vue'
import { useSearchState } from '@composables/form/useSearchState'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import { useRemoteSuggestions } from '@composables/form/useRemoteSuggestions'
import type { BaseSearchEmits, SearchProps, SearchResult } from '../types/BaseSearch.types'

const SEARCH_ELEMENTS = [
	'root',
	'trigger',
	'icon',
	'modalOverlay',
	'modal',
	'modalHeader',
	'modalInput',
	'clear',
	'clearIcon',
	'loading',
	'modalClose',
	'modalCloseIcon',
	'modalResults',
	'result',
	'resultImage',
	'resultIcon',
	'resultContent',
	'resultTitle',
	'resultDesc',
	'resultCategory',
	'empty',
	'emptyText',
	'sidebarOverlay',
	'sidebar',
	'sidebarHeader',
	'sidebarInput',
	'sidebarClose',
	'sidebarCloseIcon',
	'sidebarResults',
	'dropdown',
	'input',
]

function isOverlayMode(props: SearchProps): boolean {
	return props.mode === 'modal' || props.mode === 'sidebar'
}

function blurActiveInput(props: SearchProps, rootRef: Ref<HTMLElement | null>): void {
	if (!isOverlayMode(props)) {
		rootRef.value?.querySelector<HTMLElement>('.base-input')?.blur()
		return
	}
	if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
}

function useSearchInputs(props: SearchProps) {
	const baseInputRef = ref<InstanceType<typeof BaseSearchInput> | null>(null)
	const overlayRef = ref<InstanceType<typeof BaseSearchOverlay> | null>(null)
	return {
		baseInputRef,
		overlayRef,
		focusActiveInput(): void {
			if (isOverlayMode(props)) overlayRef.value?.focus()
			else baseInputRef.value?.focus()
		},
		closeOverlay(): void {
			overlayRef.value?.close()
		},
	}
}

function useSearchSource(props: SearchProps) {
	const remote = useRemoteSuggestions<SearchResult>({
		source: () => props.source as NonNullable<SearchProps['source']>,
		minChars: () => 1,
		debounce: () => 0,
	})
	return {
		results: computed((): SearchResult[] => (props.source ? remote.suggestions.value : props.results)),
		isBusy: computed((): boolean => props.isLoading || (Boolean(props.source) && remote.isLoading.value)),
		hasError: computed((): boolean => Boolean(props.source) && remote.hasError.value),
		run: (query: string): void => {
			if (props.source) remote.search(query)
		},
		reset: (): void => {
			if (props.source) remote.reset()
		},
	}
}

function useSearch(props: SearchProps, emit: BaseSearchEmits, inputs: ReturnType<typeof useSearchInputs>) {
	const source = useSearchSource(props)
	return {
		...useSearchState({
			modelValue: () => props.modelValue,
			mode: () => props.mode,
			results: () => source.results.value,
			isRemote: () => props.isRemote || Boolean(props.source),
			isInstant: () => props.isInstant,
			debounceMs: () => props.debounceMs,
			maxResults: () => props.maxResults,
			isAutofocus: () => props.isAutofocus,
			emit: {
				search: value => {
					emit('search', value)
					source.run(value)
				},
				select: item => emit('select', item),
				updateModelValue: value => {
					emit('update:modelValue', value)
					if (!value.trim()) source.run('')
				},
				clear: () => emit('clear'),
			},
			focusActiveInput: inputs.focusActiveInput,
			closeOverlay: inputs.closeOverlay,
			onExternalChange: source.reset,
		}),
		isBusy: source.isBusy,
		emptyText: computed((): string => (source.hasError.value ? UI_TEXT.SEARCH_FAILED : UI_TEXT.NO_RESULTS)),
	}
}

function useSearchA11y(props: SearchProps, search: ReturnType<typeof useSearch>) {
	const listboxId = `rise-search-${useId()}-listbox`
	const hasListbox = computed((): boolean => {
		const isShown = isOverlayMode(props) ? search.shouldShowResults.value && Boolean(search.query.value) : search.isOpen.value
		return isShown && search.visibleResults.value.length > 0
	})

	return {
		listboxId,
		comboboxAttributes: computed(() => ({
			role: 'combobox',
			'aria-autocomplete': 'list',
			'aria-expanded': hasListbox.value ? 'true' : 'false',
			'aria-controls': hasListbox.value ? listboxId : undefined,
			'aria-activedescendant':
				hasListbox.value && search.highlightedIndex.value >= 0
					? getSearchOptionId(listboxId, search.highlightedIndex.value)
					: undefined,
		})),
		resultsStatus: computed((): string => {
			if (!search.query.value || search.isBusy.value) return ''
			const count = search.visibleResults.value.length
			return count ? pluralize(getLocale().plural.SEARCH_RESULTS, count) : search.emptyText.value
		}),
	}
}

export function useBaseSearch(props: SearchProps, emit: BaseSearchEmits) {
	const rootRef = ref<HTMLElement | null>(null)
	const formField = useFormField({ value: () => props.modelValue, error: () => props.error })
	const standard = useStandardBaseComponent('base-search', props, SEARCH_ELEMENTS)
	const inputs = useSearchInputs(props)
	const resolvedPlaceholder = computed<string>(() => props.placeholder ?? UI_TEXT.SEARCH_PLACEHOLDER)
	const search = useSearch(props, emit, inputs)
	const ui = useUi(props, 'base-search')

	return {
		...standard,
		ui,
		dropdownClass: computed(() => ({ root: standard.classes.value.dropdown, panel: ui('panel') })),
		...useSearchMotion(rootRef),
		rootRef,
		baseInputRef: inputs.baseInputRef,
		overlayRef: inputs.overlayRef,
		resolvedPlaceholder,
		...search,
		...useSearchA11y(props, search),
		exposed: {
			rootRef,
			focus: inputs.focusActiveInput,
			blur: () => blurActiveInput(props, rootRef),
			validate: formField.validate,
			reset: formField.reset,
		},
	}
}
