import { filterSearchResults } from './searchResults'
import { createSearchDebounce } from './searchDebounce'
import { useSearchNavigation } from './useSearchNavigation'
import { createSearchHandlers, selectResult } from './searchActions'
/** Composable: управление состоянием поиска (запрос, debounce, фильтрация, навигация) */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { SearchResult } from '@components/BaseSearch/types/BaseSearch.types'
import type { SearchStateContext, UseSearchStateOptions } from './types/useSearchState.types'

/** Описание: управляет состоянием поиска — запрос, debounce, фильтрация результатов, навигация по списку, выбор и очистка */
function useSearchState(options: UseSearchStateOptions) {
	const query = ref(options.modelValue())
	const isFocused = ref(false)
	const isSearchTriggered = ref(false)
	const ctx: SearchStateContext = { options, query, isFocused, isSearchTriggered, debounce: createSearchDebounce(options) }

	const visibleResults = computed((): SearchResult[] => filterSearchResults(options, query.value))
	const shouldShowResults = computed((): boolean => options.isInstant() || isSearchTriggered.value)
	const nav = useSearchNavigation(ctx, visibleResults)
	const { handleInput, handleKeydown, handleClear, handleClose } = createSearchHandlers(ctx, nav)

	const isOpen = computed({
		get: (): boolean => isFocused.value && query.value.length > 0 && shouldShowResults.value,
		set: handleClose,
	})

	onMounted(() => {
		if (options.isAutofocus() && options.mode() === 'default') {
			nextTick(() => {
				options.focusActiveInput()
			})
		}
	})

	onBeforeUnmount(ctx.debounce.cancel)

	watch(options.modelValue, newValue => {
		if (newValue !== query.value) query.value = newValue
	})

	return {
		query,
		isOpen,
		visibleResults,
		shouldShowResults,
		highlightedIndex: nav.highlightedIndex,
		handleInput,
		handleKeydown,
		handleClear,
		handleSelect: (item: SearchResult): void => selectResult(ctx, item),
		handleFocus: (): void => {
			isFocused.value = true
		},
		handleBlur: handleClose,
		handleClose,
		handleOverlayClose: nav.reset,
	}
}

export { useSearchState }
