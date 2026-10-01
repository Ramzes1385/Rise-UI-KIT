import { computed, ref } from 'vue'
import { createTablePaginationActions, DEFAULT_PAGE_SIZE } from '../createTablePaginationActions'

function setup(mode: string, pageSize: number, onPageSizeChange?: (size: number) => void) {
	const currentPage = ref(3)
	const localPageSize = ref(pageSize)
	const effectivePageSize = computed(() => localPageSize.value || DEFAULT_PAGE_SIZE)
	const loadedCount = ref(7)
	const actions = createTablePaginationActions({
		loadMode: () => mode,
		currentPage,
		localPageSize,
		effectivePageSize,
		loadedCount,
		onPageSizeChange,
	})
	return { currentPage, localPageSize, loadedCount, ...actions }
}

describe('createTablePaginationActions', () => {
	it('loadMore увеличивает счётчик на размер страницы', () => {
		const { loadedCount, loadMore } = setup('button', 0)
		loadMore()
		expect(loadedCount.value).toBe(7 + DEFAULT_PAGE_SIZE)
	})

	it('handlePageSizeChange принимает массив, сбрасывает страницу и вызывает callback', () => {
		const onPageSizeChange = vi.fn()
		const { currentPage, localPageSize, loadedCount, handlePageSizeChange } = setup('pagination', 10, onPageSizeChange)
		handlePageSizeChange(['20'])
		expect(localPageSize.value).toBe(20)
		expect(currentPage.value).toBe(1)
		expect(loadedCount.value).toBe(20)
		expect(onPageSizeChange).toHaveBeenCalledWith(20)
	})

	it('handlePageSizeChange с нулём ставит счётчик по умолчанию и работает без callback', () => {
		const { loadedCount, handlePageSizeChange } = setup('button', 10)
		handlePageSizeChange(0)
		expect(loadedCount.value).toBe(DEFAULT_PAGE_SIZE)
	})

	it('handlePageSizeChange игнорирует тот же размер', () => {
		const onPageSizeChange = vi.fn()
		const { currentPage, handlePageSizeChange } = setup('pagination', 10, onPageSizeChange)
		handlePageSizeChange('10')
		expect(currentPage.value).toBe(3)
		expect(onPageSizeChange).not.toHaveBeenCalled()
	})

	it('resetPage в режиме pagination сбрасывает страницу, иначе — счётчик', () => {
		const paged = setup('pagination', 10)
		paged.resetPage()
		expect(paged.currentPage.value).toBe(1)
		expect(paged.loadedCount.value).toBe(7)

		const infinite = setup('infinite', 4)
		infinite.resetPage()
		expect(infinite.currentPage.value).toBe(3)
		expect(infinite.loadedCount.value).toBe(4)
	})
})
