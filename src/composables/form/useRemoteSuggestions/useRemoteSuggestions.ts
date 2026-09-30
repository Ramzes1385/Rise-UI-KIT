/** Composable: подсказки с сервера — пауза после ввода, отмена устаревшего запроса, признак загрузки */
import { onScopeDispose, ref, shallowRef } from 'vue'
import type { UseRemoteSuggestionsOptions } from './types/useRemoteSuggestions.types'

/** Описание: загружает подсказки по запросу после паузы; новый запрос отменяет прежний, ошибка очищает список */
export function useRemoteSuggestions<T>(options: UseRemoteSuggestionsOptions<T>) {
	const suggestions = shallowRef<T[]>([])
	const isLoading = ref(false)
	let timer: ReturnType<typeof setTimeout> | undefined
	let controller: AbortController | null = null

	function cancel(): void {
		clearTimeout(timer)
		controller?.abort()
		controller = null
	}

	async function load(query: string, current: AbortController): Promise<void> {
		try {
			const found = await options.source()(query, { signal: current.signal })
			if (!current.signal.aborted) suggestions.value = found
		} catch {
			if (!current.signal.aborted) suggestions.value = []
		} finally {
			if (!current.signal.aborted) isLoading.value = false
		}
	}

	function search(query: string): void {
		cancel()
		const isShort = query.trim().length < options.minChars()
		isLoading.value = !isShort
		if (isShort) {
			suggestions.value = []
			return
		}
		timer = setTimeout(() => void load(query, (controller = new AbortController())), options.debounce())
	}

	onScopeDispose(cancel)
	return { suggestions, isLoading, search, cancel }
}
