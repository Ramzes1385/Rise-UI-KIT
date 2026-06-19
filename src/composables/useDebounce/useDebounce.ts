/** Composable: дебаунс значения и функции */
import { customRef, onBeforeUnmount } from 'vue'

/**
 * Composable для дебаунса значения.
 * Возвращает ref, который обновляется с задержкой.
 *
 * @example
 * ```ts
 * const debouncedQuery = useDebounce(searchQuery, 300)
 * watch(debouncedQuery, (val) => { emit('search', val) })
 * ```
 */
function useDebounce<T>(value: T, delay: number) {
	let timeout: ReturnType<typeof setTimeout> | null = null

	const debouncedRef = customRef<T>((track, trigger) => {
		return {
			get() {
				track()
				return value
			},
			set(newValue: T) {
				if (timeout) clearTimeout(timeout)
				timeout = setTimeout(() => {
					value = newValue
					trigger()
				}, delay)
			},
		}
	})

	onBeforeUnmount(() => {
		if (timeout) clearTimeout(timeout)
	})

	return debouncedRef
}

/**
 * Composable для дебаунса функции.
 * Возвращает обёрнутую функцию, которая вызывается с задержкой.
 *
 * @example
 * ```ts
 * const debouncedSearch = useDebounceFn((query: string) => {
 *   emit('search', query)
 * }, 300)
 *
 * function handleInput(value: string): void {
 *   query.value = value
 *   debouncedSearch(value)
 * }
 * ```
 */
function useDebounceFn<A extends unknown[]>(fn: (...args: A) => void, delay: number): (...args: A) => void {
	let timeout: ReturnType<typeof setTimeout> | null = null

	function debouncedFn(...args: A): void {
		if (timeout) clearTimeout(timeout)
		timeout = setTimeout(() => {
			fn(...args)
		}, delay)
	}

	onBeforeUnmount(() => {
		if (timeout) clearTimeout(timeout)
	})

	return debouncedFn
}

export { useDebounce, useDebounceFn }
