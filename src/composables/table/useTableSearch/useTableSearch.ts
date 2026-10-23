/** Composable: управление поиском по таблице */
import { getCurrentInstance, onBeforeUnmount, ref } from 'vue'
import type { UseTableSearchOptions, UseTableSearchReturn } from './types/useTableSearch.types'

function useTableSearch(options: UseTableSearchOptions): UseTableSearchReturn {
	const { searchDebounce, onSearch } = options

	const searchQuery = ref('')
	const searchTimeout = ref<ReturnType<typeof setTimeout> | null>(null)

	/** Ввод поиска с дебаунсом */
	function handleSearchInput(value: string, resetPage?: () => void): void {
		searchQuery.value = value
		if (resetPage) resetPage()

		if (searchTimeout.value) {
			clearTimeout(searchTimeout.value)
		}

		searchTimeout.value = setTimeout(() => {
			if (onSearch) onSearch(searchQuery.value)
		}, searchDebounce())
	}

	/** Очистка таймаутов */
	if (getCurrentInstance()) {
		onBeforeUnmount(() => {
			if (searchTimeout.value) {
				clearTimeout(searchTimeout.value)
			}
		})
	}

	return {
		searchQuery,
		handleSearchInput,
	}
}

export { useTableSearch }
