/** Composable: управление состоянием поиска (запрос, debounce, фильтрация, навигация) */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useListNavigation } from '@composables/useListNavigation'
import type { UseSearchStateOptions } from './useSearchState.types'
import type { SearchResult } from '@components/BaseSearch/model/BaseSearch.types'

/** Описание: управляет состоянием поиска — запрос, debounce, фильтрация результатов, навигация по списку, выбор и очистка */
function useSearchState(options: UseSearchStateOptions) {
	const query = ref(options.modelValue())
	const isFocused = ref(false)
	const isSearchTriggered = ref(false)

	const visibleResults = computed((): SearchResult[] => {
		if (!query.value) return []
		const lowerQuery = query.value.toLowerCase()
		return options.results()
			.filter(item => {
				const matchTitle = item.title.toLowerCase().includes(lowerQuery)
				const matchDesc = item.description?.toLowerCase().includes(lowerQuery) ?? false
				return matchTitle || matchDesc
			})
			.slice(0, options.maxResults())
	})

	const shouldShowResults = computed((): boolean => {
		if (options.isInstant()) return true
		return isSearchTriggered.value
	})

	const isOpen = computed({
		get: (): boolean => {
			if (!isFocused.value || query.value.length === 0) return false
			return shouldShowResults.value
		},
		set: () => {
			isFocused.value = false
			resetHighlight()
		},
	})

	let searchTimeout: ReturnType<typeof setTimeout> | null = null

	function cancelPendingSearch(): void {
		if (searchTimeout) {
			clearTimeout(searchTimeout)
			searchTimeout = null
		}
	}

	function debouncedSearch(value: string): void {
		cancelPendingSearch()
		searchTimeout = setTimeout(() => {
			if (value) options.emit.search(value)
		}, options.debounceMs())
	}

	const {
		highlightedIndex,
		handleKeydown: handleListKeydown,
		reset: resetHighlight,
	} = useListNavigation({
		itemCount: () => visibleResults.value.length,
		onSelect: index => handleSelect(visibleResults.value[index]),
		onEscape: () => {
			if (options.mode() === 'modal' || options.mode() === 'sidebar') options.closeOverlay()
		},
	})

	function handleClose(): void {
		isFocused.value = false
		resetHighlight()
	}

	function handleInput(value: string): void {
		query.value = value
		options.emit.updateModelValue(value)
		isSearchTriggered.value = false
		if (options.isInstant()) {
			debouncedSearch(value)
		}
	}

	function handleFocus(): void {
		isFocused.value = true
	}

	function handleBlur(): void {
		isFocused.value = false
		resetHighlight()
	}

	function handleKeydown(e: KeyboardEvent): void {
		if (e.key === 'Enter' && highlightedIndex.value < 0 && query.value) {
			e.preventDefault()
			cancelPendingSearch()
			isSearchTriggered.value = true
			options.emit.search(query.value)
			return
		}
		handleListKeydown(e)
	}

	function handleClear(): void {
		cancelPendingSearch()
		query.value = ''
		options.emit.updateModelValue('')
		options.emit.clear()
		options.focusActiveInput()
	}

	function handleSelect(item: SearchResult): void {
		cancelPendingSearch()
		query.value = item.title
		options.emit.select(item)
		options.emit.updateModelValue(item.title)
		isFocused.value = false
		if (options.mode() === 'modal' || options.mode() === 'sidebar') options.closeOverlay()
	}

	function handleOverlayClose(): void {
		resetHighlight()
	}

	onMounted(() => {
		if (options.isAutofocus() && options.mode() === 'default') {
			nextTick(() => {
				options.focusActiveInput()
			})
		}
	})

	onBeforeUnmount(() => {
		cancelPendingSearch()
	})

	watch(
		options.modelValue,
		newValue => {
			if (newValue !== query.value) query.value = newValue
		},
	)

	return {
		query,
		isOpen,
		visibleResults,
		shouldShowResults,
		highlightedIndex,
		handleInput,
		handleKeydown,
		handleClear,
		handleSelect,
		handleFocus,
		handleBlur,
		handleClose,
		handleOverlayClose,
	}
}

export { useSearchState }
