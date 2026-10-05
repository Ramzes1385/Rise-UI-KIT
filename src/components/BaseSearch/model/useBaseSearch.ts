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
import type { BaseSearchEmits, SearchProps } from '../types/BaseSearch.types'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'

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

function useSearch(props: SearchProps, emit: BaseSearchEmits, inputs: ReturnType<typeof useSearchInputs>) {
	return useSearchState({
		modelValue: () => props.modelValue,
		mode: () => props.mode,
		results: () => props.results,
		isRemote: () => props.isRemote,
		isInstant: () => props.isInstant,
		debounceMs: () => props.debounceMs,
		maxResults: () => props.maxResults,
		isAutofocus: () => props.isAutofocus,
		emit: {
			search: value => emit('search', value),
			select: item => emit('select', item),
			updateModelValue: value => emit('update:modelValue', value),
			clear: () => emit('clear'),
		},
		focusActiveInput: inputs.focusActiveInput,
		closeOverlay: inputs.closeOverlay,
	})
}

function useSearchA11y(props: SearchProps, search: ReturnType<typeof useSearchState>) {
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
			if (!search.query.value || props.isLoading) return ''
			const count = search.visibleResults.value.length
			return count ? pluralize(getLocale().plural.SEARCH_RESULTS, count) : UI_TEXT.NO_RESULTS
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
