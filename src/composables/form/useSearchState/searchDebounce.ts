/** Утилиты: отложенный запуск поиска (debounce) */
import type { SearchDebounce, UseSearchStateOptions } from './types/useSearchState.types'

/** Описание: создаёт отложенный запуск события search; пустой запрос не ищется */
function createSearchDebounce(options: UseSearchStateOptions): SearchDebounce {
	let searchTimeout: ReturnType<typeof setTimeout> | null = null

	function cancel(): void {
		if (searchTimeout) {
			clearTimeout(searchTimeout)
			searchTimeout = null
		}
	}

	function schedule(value: string): void {
		cancel()
		searchTimeout = setTimeout(() => {
			if (value) options.emit.search(value)
		}, options.debounceMs())
	}

	return { schedule, cancel }
}

export { createSearchDebounce }
