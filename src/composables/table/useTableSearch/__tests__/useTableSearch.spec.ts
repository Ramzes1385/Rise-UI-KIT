import { createApp, h } from 'vue'
import { useTableSearch } from '../useTableSearch'

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

	it('вызывает resetPage сразу при вводе, onSearch — после debounce', () => {
		vi.useFakeTimers()
		const onSearch = vi.fn()
		const resetPage = vi.fn()
		const { handleSearchInput } = useTableSearch({ searchDebounce: () => 100, onSearch })

		handleSearchInput('запрос', resetPage)
		expect(resetPage).toHaveBeenCalledTimes(1)
		expect(onSearch).not.toHaveBeenCalled()

		vi.advanceTimersByTime(100)
		expect(resetPage).toHaveBeenCalledTimes(1)
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

	it('без resetPage ввод только откладывает onSearch', () => {
		vi.useFakeTimers()
		const onSearch = vi.fn()
		const { handleSearchInput, searchQuery } = useTableSearch({ searchDebounce: () => 100, onSearch })
		handleSearchInput('запрос')
		expect(searchQuery.value).toBe('запрос')
		vi.advanceTimersByTime(100)
		expect(onSearch).toHaveBeenCalledWith('запрос')
		vi.useRealTimers()
	})

	it('без onSearch запрос применяется и после debounce ничего не падает', () => {
		vi.useFakeTimers()
		const resetPage = vi.fn()
		const { handleSearchInput, searchQuery } = useTableSearch({ searchDebounce: () => 50 })
		handleSearchInput('а', resetPage)
		vi.advanceTimersByTime(50)
		expect(searchQuery.value).toBe('а')
		expect(resetPage).toHaveBeenCalledTimes(1)
		vi.useRealTimers()
	})
})
