/**
 * Unit-тесты для useTableSearch.
 */

import { createApp, h } from 'vue'

import { useTableSearch } from './useTableSearch'

function withSetup<T>(composable: () => T): [T, () => void] {
	let result: T
	const app = createApp({
		setup() {
			result = composable()
			return () => h('div')
		},
	})
	const el = document.createElement('div')
	app.mount(el)
	return [result!, () => app.unmount()]
}

describe('useTableSearch', () => {
	it('обновляет searchQuery', () => {
		const { searchQuery, handleSearchInput } = useTableSearch({ searchDebounce: () => 300 })
		handleSearchInput('тест')
		expect(searchQuery.value).toBe('тест')
	})

	it('вызывает onSearch после дебаунса', () => {
		vi.useFakeTimers()
		const onSearch = vi.fn()
		const { handleSearchInput } = useTableSearch({ searchDebounce: () => 100, onSearch })

		handleSearchInput('запрос')
		expect(onSearch).not.toHaveBeenCalled()

		vi.advanceTimersByTime(100)
		expect(onSearch).toHaveBeenCalledWith('запрос')

		vi.useRealTimers()
	})

	it('вызывает resetPage перед onSearch', () => {
		vi.useFakeTimers()
		const onSearch = vi.fn()
		const resetPage = vi.fn()
		const { handleSearchInput } = useTableSearch({ searchDebounce: () => 100, onSearch })

		handleSearchInput('запрос', resetPage)
		expect(resetPage).not.toHaveBeenCalled()

		vi.advanceTimersByTime(100)
		expect(resetPage).toHaveBeenCalled()
		expect(onSearch).toHaveBeenCalledWith('запрос')

		vi.useRealTimers()
	})

	it('очищает таймаут при unmount', () => {
		vi.useFakeTimers()
		const onSearch = vi.fn()
		const [result, unmount] = withSetup(() => useTableSearch({ searchDebounce: () => 100, onSearch }))

		result.handleSearchInput('запрос')
		unmount()
		vi.advanceTimersByTime(100)

		expect(onSearch).not.toHaveBeenCalled()
		vi.useRealTimers()
	})
})
