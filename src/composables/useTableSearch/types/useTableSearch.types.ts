/**
 * Опции composable useTableSearch
 */
export interface UseTableSearchOptions {
	/** Дебаунс поиска (мс) */
	searchDebounce: () => number
	/** Callback при поиске */
	onSearch?: (query: string) => void
}

/**
 * Результат composable useTableSearch
 */
export interface UseTableSearchReturn {
	/** Поисковый запрос */
	searchQuery: import('vue').Ref<string>
	/** Обработчик ввода поиска */
	handleSearchInput: (value: string, resetPage?: () => void) => void
}
