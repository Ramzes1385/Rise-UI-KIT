/**
 * Unit-тесты для composable useTableData.
 * Покрывает все публичные методы и computed-свойства.
 */

import '@testing-library/jest-dom/vitest'
import { computed, createApp, h, nextTick, ref } from 'vue'
import { useTableData } from './useTableData'
import type { UseTableDataOptions } from './useTableData.types'
import type { ColumnFilter, TableColumn, TableRow } from '@components/BaseTable/model/BaseTable.types'

// ============================================================
// Фикстура
// ============================================================

/** Строки для большинства тестов */
const testRows = computed((): TableRow[] => [
	{ id: 1, data: { name: 'Анна', age: 25, city: 'Москва' }, isSelected: false },
	{ id: 2, data: { name: 'Борис', age: 30, city: 'Питер' }, isSelected: false },
	{ id: 3, data: { name: 'Вика', age: 20, city: 'Казань' }, isSelected: true },
	{ id: 4, data: { name: 'Глеб', age: 35, city: 'Москва' }, isSelected: false, isDisabled: true },
])

/** Колонки для большинства тестов */
const testColumns = ref<TableColumn[]>([
	{ key: 'name', label: 'Имя', isSortable: true, sortType: 'string' },
	{ key: 'age', label: 'Возраст', isSortable: true, sortType: 'number' },
	{ key: 'city', label: 'Город', isSortable: true, sortType: 'string' },
])

/** Создать опции по умолчанию для useTableData */
function createDefaultOptions(overrides: Partial<UseTableDataOptions> = {}): UseTableDataOptions {
	return {
		rows: testRows,
		columns: testColumns,
		loadMode: () => 'default',
		pageSize: ref(10),
		isMultiSort: () => false,
		searchDebounce: () => 300,
		...overrides,
	}
}

/** Вызвать composable в контексте компонента для тестирования lifecycle-хуков */
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
	function unmount() {
		app.unmount()
	}
	return [result!, unmount]
}

// ============================================================
// Тесты
// ============================================================

describe('useTableData', () => {
	// ============================================================
	// Поиск
	// ============================================================

	describe('Поиск (handleSearchInput, searchQuery)', () => {
		it('фильтрует строки по поисковому запросу (case-insensitive)', () => {
			const { processedRows, handleSearchInput } = useTableData(createDefaultOptions())

			handleSearchInput('анна')

			expect(processedRows.value).toHaveLength(1)
			expect(processedRows.value[0].data.name).toBe('Анна')
		})

		it('возвращает все строки при пустом поисковом запросе', () => {
			const { processedRows, handleSearchInput } = useTableData(createDefaultOptions())

			handleSearchInput('')

			expect(processedRows.value).toHaveLength(4)
		})

		it('сбрасывает currentPage в 1 после debounce', () => {
			vi.useFakeTimers()
			const { currentPage, handleSearchInput } = useTableData(
				createDefaultOptions({
					loadMode: () => 'pagination',
					pageSize: ref(2),
				}),
			)
			currentPage.value = 2

			handleSearchInput('тест')
			expect(currentPage.value).toBe(2)

			vi.advanceTimersByTime(300)
			expect(currentPage.value).toBe(1)

			vi.useRealTimers()
		})

		it('вызывает onSearch с query после debounce', () => {
			vi.useFakeTimers()
			const onSearch = vi.fn()
			const { handleSearchInput } = useTableData(createDefaultOptions({ onSearch }))

			handleSearchInput('запрос')
			expect(onSearch).not.toHaveBeenCalled()

			vi.advanceTimersByTime(300)
			expect(onSearch).toHaveBeenCalledWith('запрос')

			vi.useRealTimers()
		})

		it('очищает предыдущий таймаут при повторном вызове', () => {
			vi.useFakeTimers()
			const onSearch = vi.fn()
			const { handleSearchInput } = useTableData(createDefaultOptions({ onSearch }))

			handleSearchInput('первый')
			vi.advanceTimersByTime(100)
			handleSearchInput('второй')
			vi.advanceTimersByTime(300)

			expect(onSearch).toHaveBeenCalledTimes(1)
			expect(onSearch).toHaveBeenCalledWith('второй')

			vi.useRealTimers()
		})
	})

	// ============================================================
	// Фильтры
	// ============================================================

	describe('Фильтры (addFilter, removeFilter, activeFilters, getFilterLabel)', () => {
		it('addFilter с operator=eq фильтрует точное совпадение', () => {
			const { processedRows, addFilter } = useTableData(createDefaultOptions())

			addFilter(ref('city'), ref('eq'), ref('москва'))

			// Москва: Анна и Глеб
			expect(processedRows.value).toHaveLength(2)
			expect(processedRows.value.every(r => String(r.data.city).toLowerCase() === 'москва')).toBe(true)
		})

		it('addFilter с operator=ne фильтрует неравенство', () => {
			const { processedRows, addFilter } = useTableData(createDefaultOptions())

			addFilter(ref('city'), ref('ne'), ref('москва'))

			// Не Москва: Борис (Питер) и Вика (Казань)
			expect(processedRows.value).toHaveLength(2)
			expect(processedRows.value.every(r => String(r.data.city).toLowerCase() !== 'москва')).toBe(true)
		})

		it('addFilter с operator=contains фильтрует вхождение подстроки', () => {
			const { processedRows, addFilter } = useTableData(createDefaultOptions())

			addFilter(ref('name'), ref('contains'), ref('ан'))

			// 'ан' есть в 'Анна' (анна)
			expect(processedRows.value).toHaveLength(1)
			expect(processedRows.value[0].data.name).toBe('Анна')
		})

		it('addFilter с операторами gt/lt/gte/lte — числовое сравнение', () => {
			const { processedRows, addFilter } = useTableData(createDefaultOptions())

			addFilter(ref('age'), ref('gt'), ref('25'))

			// age > 25: Борис (30) и Глеб (35)
			expect(processedRows.value).toHaveLength(2)
		})

		it('addFilter с пустым column или value не добавляет фильтр', () => {
			const { activeFilters, addFilter } = useTableData(createDefaultOptions())

			addFilter(ref(''), ref('eq'), ref('москва'))
			expect(activeFilters.value).toHaveLength(0)

			addFilter(ref('city'), ref('eq'), ref(''))
			expect(activeFilters.value).toHaveLength(0)
		})

		it('removeFilter удаляет фильтр и пересчитывает строки', () => {
			const { processedRows, activeFilters, addFilter, removeFilter } = useTableData(createDefaultOptions())

			addFilter(ref('city'), ref('eq'), ref('москва'))
			expect(activeFilters.value).toHaveLength(1)
			expect(processedRows.value).toHaveLength(2)

			removeFilter(0)
			expect(activeFilters.value).toHaveLength(0)
			expect(processedRows.value).toHaveLength(4)
		})

		it('getFilterLabel возвращает формат "Колонка оператор значение"', () => {
			const { addFilter, activeFilters, getFilterLabel } = useTableData(createDefaultOptions())

			addFilter(ref('city'), ref('eq'), ref('Москва'))

			const label = getFilterLabel(activeFilters.value[0])
			expect(label).toBe('Город = Москва')
		})

		it('addFilter вызывает onFilter и сбрасывает currentPage', () => {
			const onFilter = vi.fn()
			const { currentPage, addFilter } = useTableData(
				createDefaultOptions({
					onFilter,
					loadMode: () => 'pagination',
					pageSize: ref(2),
				}),
			)
			currentPage.value = 3

			addFilter(ref('city'), ref('eq'), ref('москва'))

			expect(onFilter).toHaveBeenCalledTimes(1)
			expect(currentPage.value).toBe(1)
		})
	})

	// ============================================================
	// Пагинация
	// ============================================================

	describe('Пагинация (currentPage, totalPages, visiblePages, displayedRows)', () => {
		it('при loadMode=pagination и pageSize=2 отображает 2 строки на странице 1', () => {
			const { displayedRows } = useTableData(
				createDefaultOptions({
					loadMode: () => 'pagination',
					pageSize: ref(2),
				}),
			)

			expect(displayedRows.value).toHaveLength(2)
		})

		it('при переключении currentPage отображает следующие строки', () => {
			const { displayedRows, currentPage } = useTableData(
				createDefaultOptions({
					loadMode: () => 'pagination',
					pageSize: ref(2),
				}),
			)

			currentPage.value = 2

			expect(displayedRows.value).toHaveLength(2)
			expect(displayedRows.value[0].data.name).toBe('Вика')
		})

		it('при pageSize=0 отображает все processedRows', () => {
			const { displayedRows } = useTableData(
				createDefaultOptions({
					loadMode: () => 'pagination',
					pageSize: ref(0),
				}),
			)

			expect(displayedRows.value).toHaveLength(4)
		})

		it('totalPages при pageSize=2 и 4 строках равен 2', () => {
			const { totalPages } = useTableData(
				createDefaultOptions({
					loadMode: () => 'pagination',
					pageSize: ref(2),
				}),
			)

			expect(totalPages.value).toBe(2)
		})

		it('visiblePages возвращает массив видимых номеров страниц', () => {
			const { visiblePages } = useTableData(
				createDefaultOptions({
					loadMode: () => 'pagination',
					pageSize: ref(2),
				}),
			)

			expect(visiblePages.value).toEqual([1, 2])
		})

		it('при loadMode=default отображает все processedRows', () => {
			const { displayedRows } = useTableData(
				createDefaultOptions({
					loadMode: () => 'default',
				}),
			)

			expect(displayedRows.value).toHaveLength(4)
		})
	})

	// ============================================================
	// Подгрузка
	// ============================================================

	describe('Подгрузка (loadMore, hasMoreRows)', () => {
		it('при loadMode=button отображает первые effectivePageSize строк', () => {
			const { displayedRows } = useTableData(
				createDefaultOptions({
					loadMode: () => 'button',
					pageSize: ref(2),
				}),
			)

			expect(displayedRows.value).toHaveLength(2)
			expect(displayedRows.value[0].data.name).toBe('Анна')
			expect(displayedRows.value[1].data.name).toBe('Борис')
		})

		it('loadMore увеличивает количество отображаемых строк', () => {
			const { displayedRows, loadMore } = useTableData(
				createDefaultOptions({
					loadMode: () => 'button',
					pageSize: ref(2),
				}),
			)

			expect(displayedRows.value).toHaveLength(2)

			loadMore()

			expect(displayedRows.value).toHaveLength(4)
		})

		it('hasMoreRows=true если есть ещё строки, false если все загружены', () => {
			const { hasMoreRows, loadMore } = useTableData(
				createDefaultOptions({
					loadMode: () => 'button',
					pageSize: ref(2),
				}),
			)

			expect(hasMoreRows.value).toBe(true)

			loadMore()

			expect(hasMoreRows.value).toBe(false)
		})

		it('hasMoreRows всегда false при loadMode=pagination', () => {
			const { hasMoreRows } = useTableData(
				createDefaultOptions({
					loadMode: () => 'pagination',
					pageSize: ref(2),
				}),
			)

			expect(hasMoreRows.value).toBe(false)
		})
	})

	// ============================================================
	// Сортировка
	// ============================================================

	describe('Сортировка (handleSort, getSortDirection, getSortIndex)', () => {
		it('handleSort переключает asc → desc → null (удаление)', () => {
			const { sortStates, handleSort } = useTableData(createDefaultOptions())
			const nameCol = testColumns.value[0]

			handleSort(nameCol)
			expect(sortStates.value).toHaveLength(1)
			expect(sortStates.value[0].direction).toBe('asc')

			handleSort(nameCol)
			expect(sortStates.value[0].direction).toBe('desc')

			handleSort(nameCol)
			expect(sortStates.value).toHaveLength(0)
		})

		it('handleSort по не-sortable колонке не меняет sortStates', () => {
			const nonSortableCols = ref<TableColumn[]>([{ key: 'name', label: 'Имя', isSortable: false }])
			const { sortStates, handleSort } = useTableData(createDefaultOptions({ columns: nonSortableCols }))

			handleSort(nonSortableCols.value[0])

			expect(sortStates.value).toHaveLength(0)
		})

		it('при isMultiSort=true сортировка по 2 колонкам добавляет 2 записи', () => {
			const { sortStates, handleSort } = useTableData(createDefaultOptions({ isMultiSort: () => true }))

			handleSort(testColumns.value[0]) // name: asc
			handleSort(testColumns.value[1]) // age: asc

			expect(sortStates.value).toHaveLength(2)
			expect(sortStates.value[0].key).toBe('name')
			expect(sortStates.value[1].key).toBe('age')
		})

		it('при isMultiSort=true удаление одной сортировки оставляет другую', () => {
			const { sortStates, handleSort } = useTableData(createDefaultOptions({ isMultiSort: () => true }))

			handleSort(testColumns.value[0]) // name: asc
			handleSort(testColumns.value[1]) // age: asc
			handleSort(testColumns.value[0]) // name: desc
			handleSort(testColumns.value[0]) // name: null → удаление

			expect(sortStates.value).toHaveLength(1)
			expect(sortStates.value[0].key).toBe('age')
		})

		it('getSortDirection возвращает направление сортировки колонки', () => {
			const { handleSort, getSortDirection } = useTableData(createDefaultOptions())

			expect(getSortDirection('name')).toBe(null)

			handleSort(testColumns.value[0]) // asc
			expect(getSortDirection('name')).toBe('asc')

			handleSort(testColumns.value[0]) // desc
			expect(getSortDirection('name')).toBe('desc')
		})

		it('getSortIndex при isMultiSort=true возвращает индекс+1 или 0', () => {
			const { handleSort, getSortIndex } = useTableData(createDefaultOptions({ isMultiSort: () => true }))

			expect(getSortIndex('name')).toBe(0)

			handleSort(testColumns.value[0]) // name: asc
			handleSort(testColumns.value[1]) // age: asc

			expect(getSortIndex('name')).toBe(1)
			expect(getSortIndex('age')).toBe(2)
			expect(getSortIndex('city')).toBe(0)
		})

		it('handleSort вызывает onSort с sortStates', () => {
			const onSort = vi.fn()
			const { handleSort } = useTableData(createDefaultOptions({ onSort }))

			handleSort(testColumns.value[0])

			expect(onSort).toHaveBeenCalledTimes(1)
			expect(onSort.mock.calls[0][0]).toHaveLength(1)
			expect(onSort.mock.calls[0][0][0].key).toBe('name')
		})

		it('сортировка по sortType=number — числовой порядок', () => {
			const numberRows = computed((): TableRow[] => [
				{ id: 1, data: { value: 2 } },
				{ id: 2, data: { value: 10 } },
				{ id: 3, data: { value: 1 } },
			])
			const numberCols = ref<TableColumn[]>([{ key: 'value', label: 'Значение', isSortable: true, sortType: 'number' }])

			const { processedRows, handleSort } = useTableData(
				createDefaultOptions({ rows: numberRows, columns: numberCols }),
			)

			handleSort(numberCols.value[0]) // asc

			expect(processedRows.value[0].data.value).toBe(1)
			expect(processedRows.value[1].data.value).toBe(2)
			expect(processedRows.value[2].data.value).toBe(10)
		})

		it('сортировка по sortType=date — порядок по дате', () => {
			const dateRows = computed((): TableRow[] => [
				{ id: 1, data: { date: '2024-03-15' } },
				{ id: 2, data: { date: '2024-01-01' } },
				{ id: 3, data: { date: '2024-06-20' } },
			])
			const dateCols = ref<TableColumn[]>([{ key: 'date', label: 'Дата', isSortable: true, sortType: 'date' }])

			const { processedRows, handleSort } = useTableData(createDefaultOptions({ rows: dateRows, columns: dateCols }))

			handleSort(dateCols.value[0]) // asc

			expect(processedRows.value[0].data.date).toBe('2024-01-01')
			expect(processedRows.value[1].data.date).toBe('2024-03-15')
			expect(processedRows.value[2].data.date).toBe('2024-06-20')
		})
	})

	// ============================================================
	// Размер страницы
	// ============================================================

	describe('Размер страницы (handlePageSizeChange, resetPage)', () => {
		it('handlePageSizeChange устанавливает localPageSize и сбрасывает currentPage', () => {
			const { localPageSize, currentPage, handlePageSizeChange } = useTableData(
				createDefaultOptions({
					loadMode: () => 'pagination',
					pageSize: ref(10),
				}),
			)
			currentPage.value = 3

			handlePageSizeChange(5)

			expect(localPageSize.value).toBe(5)
			expect(currentPage.value).toBe(1)
		})

		it('handlePageSizeChange с массивом берёт первый элемент', () => {
			const { localPageSize, handlePageSizeChange } = useTableData(createDefaultOptions({ pageSize: ref(10) }))

			handlePageSizeChange([5, 10, 20])

			expect(localPageSize.value).toBe(5)
		})

		it('handlePageSizeChange вызывает onPageSizeChange', () => {
			const onPageSizeChange = vi.fn()
			const { handlePageSizeChange } = useTableData(createDefaultOptions({ pageSize: ref(10), onPageSizeChange }))

			handlePageSizeChange(5)

			expect(onPageSizeChange).toHaveBeenCalledWith(5)
		})

		it('resetPage при loadMode=pagination сбрасывает currentPage в 1', () => {
			const { currentPage, resetPage } = useTableData(
				createDefaultOptions({
					loadMode: () => 'pagination',
					pageSize: ref(2),
				}),
			)
			currentPage.value = 3

			resetPage()

			expect(currentPage.value).toBe(1)
		})

		it('resetPage при loadMode=button сбрасывает displayedRows до effectivePageSize', () => {
			const { displayedRows, loadMore, resetPage } = useTableData(
				createDefaultOptions({
					loadMode: () => 'button',
					pageSize: ref(2),
				}),
			)

			loadMore()
			expect(displayedRows.value).toHaveLength(4)

			resetPage()

			expect(displayedRows.value).toHaveLength(2)
		})
	})

	// ============================================================
	// Жизненный цикл
	// ============================================================

	describe('Жизненный цикл (watchers, onBeforeUnmount)', () => {
		it('изменение rows.value.length сбрасывает loadedCount', async () => {
			const rows = ref<TableRow[]>([
				{ id: 1, data: { name: 'Анна' } },
				{ id: 2, data: { name: 'Борис' } },
			])
			const { displayedRows, loadMore } = useTableData(
				createDefaultOptions({
					rows,
					loadMode: () => 'button',
					pageSize: ref(1),
				}),
			)

			loadMore()
			expect(displayedRows.value).toHaveLength(2)

			rows.value = [
				{ id: 1, data: { name: 'Анна' } },
				{ id: 2, data: { name: 'Борис' } },
				{ id: 3, data: { name: 'Вика' } },
				{ id: 4, data: { name: 'Глеб' } },
				{ id: 5, data: { name: 'Дима' } },
			]

			await nextTick()

			// loadedCount сбрасывается в effectivePageSize (1)
			expect(displayedRows.value).toHaveLength(1)
		})

		it('изменение pageSize синхронизирует localPageSize', async () => {
			const pageSize = ref(10)
			const { localPageSize } = useTableData(createDefaultOptions({ pageSize }))

			pageSize.value = 25

			await nextTick()

			expect(localPageSize.value).toBe(25)
		})

		it('onBeforeUnmount очищает таймаут поиска', () => {
			vi.useFakeTimers()
			const onSearch = vi.fn()

			const [result, unmount] = withSetup(() => useTableData(createDefaultOptions({ onSearch })))

			result.handleSearchInput('тест')

			unmount()

			vi.advanceTimersByTime(300)

			expect(onSearch).not.toHaveBeenCalled()

			vi.useRealTimers()
		})
	})

	describe('Multi-sort', () => {
		it('должен добавить второй критерий сортировки в multi-sort', () => {
			const { handleSort, sortStates } = useTableData(createDefaultOptions({ isMultiSort: () => true }))

			handleSort({ key: 'name', label: 'Имя', isSortable: true, sortType: 'string' })
			handleSort({ key: 'age', label: 'Возраст', isSortable: true, sortType: 'number' })

			expect(sortStates.value).toHaveLength(2)
			expect(sortStates.value[0].key).toBe('name')
			expect(sortStates.value[1].key).toBe('age')
		})

		it('должен сменить направление при повторном клике в multi-sort', () => {
			const { handleSort, sortStates } = useTableData(createDefaultOptions({ isMultiSort: () => true }))

			handleSort({ key: 'name', label: 'Имя', isSortable: true, sortType: 'string' })
			expect(sortStates.value[0].direction).toBe('asc')

			handleSort({ key: 'name', label: 'Имя', isSortable: true, sortType: 'string' })
			expect(sortStates.value[0].direction).toBe('desc')
		})

		it('должен удалить критерий при третьем клике в multi-sort', () => {
			const { handleSort, sortStates } = useTableData(createDefaultOptions({ isMultiSort: () => true }))

			handleSort({ key: 'name', label: 'Имя', isSortable: true, sortType: 'string' }) // asc
			handleSort({ key: 'name', label: 'Имя', isSortable: true, sortType: 'string' }) // desc
			handleSort({ key: 'name', label: 'Имя', isSortable: true, sortType: 'string' }) // null → удаление

			expect(sortStates.value).toHaveLength(0)
		})
	})

	describe('Фильтрация и removeFilter', () => {
		it('должен вызывать onFilter при removeFilter', () => {
			const onFilter = vi.fn()
			const { addFilter, removeFilter } = useTableData(createDefaultOptions({ onFilter }))

			addFilter(ref('city'), ref('eq'), ref('москва'))
			expect(onFilter).toHaveBeenCalledTimes(1)

			removeFilter(0)
			expect(onFilter).toHaveBeenCalledTimes(2)
		})
	})

	describe('loadMode', () => {
		it('должен обрабатывать loadMode=button', async () => {
			const { displayedRows, loadMore, hasMoreRows } = useTableData(
				createDefaultOptions({ loadMode: () => 'button', pageSize: ref(2) }),
			)

			await nextTick()

			expect(displayedRows.value.length).toBeLessThanOrEqual(2)
			expect(hasMoreRows.value).toBe(true)

			loadMore()
			await nextTick()

			expect(displayedRows.value.length).toBeGreaterThan(2)
		})

		it('должен обрабатывать loadMode=infinite', async () => {
			const { displayedRows, loadMore, hasMoreRows } = useTableData(
				createDefaultOptions({ loadMode: () => 'infinite', pageSize: ref(2) }),
			)

			await nextTick()

			expect(displayedRows.value.length).toBeLessThanOrEqual(2)
			expect(hasMoreRows.value).toBe(true)

			loadMore()
			await nextTick()

			expect(hasMoreRows.value).toBe(false)
		})
	})

	// ============================================================
	// Недостающее покрытие: операторы lt, lte, gte, default, val undefined
	// ============================================================

	describe('Фильтры — недостающие операторы', () => {
		it('addFilter с operator=lt возвращает строки меньше значения', () => {
			const { processedRows, addFilter } = useTableData(createDefaultOptions())
			addFilter(ref('age'), ref('lt'), ref('30'))
			expect(processedRows.value).toHaveLength(2) // Анна (25), Вика (20)
		})

		it('addFilter с operator=lte возвращает строки ≤ значения', () => {
			const { processedRows, addFilter } = useTableData(createDefaultOptions())
			addFilter(ref('age'), ref('lte'), ref('25'))
			expect(processedRows.value).toHaveLength(2) // Анна (25), Вика (20)
		})

		it('addFilter с operator=gte возвращает строки ≥ значения', () => {
			const { processedRows, addFilter } = useTableData(createDefaultOptions())
			addFilter(ref('age'), ref('gte'), ref('30'))
			expect(processedRows.value).toHaveLength(2) // Борис (30), Глеб (35)
		})

		it('addFilter с несуществующим ключом — val undefined', () => {
			const { processedRows, addFilter } = useTableData(createDefaultOptions())
			addFilter(ref('nonexistent'), ref('eq'), ref('test'))
			expect(processedRows.value).toHaveLength(0)
		})

		it('addFilter с operator по умолчанию (неизвестный) возвращает true', () => {
			const { processedRows, activeFilters } = useTableData(createDefaultOptions())
			activeFilters.value = [{ key: 'name', operator: 'unknown' as ColumnFilter['operator'], value: 'test' }]
			expect(processedRows.value).toHaveLength(4)
		})
	})

	// ============================================================
	// Недостающее покрытие: строковая сортировка, cmp===0
	// ============================================================

	describe('Сортировка — недостающие ветки', () => {
		it('сортировка по sortType=string — строковое сравнение', () => {
			const { processedRows, handleSort } = useTableData(createDefaultOptions())
			handleSort(testColumns.value[0]) // name asc
			expect(processedRows.value[0].data.name).toBe('Анна')
			expect(processedRows.value[3].data.name).toBe('Глеб')
		})

		it('сортировка с одинаковыми значениями возвращает 0', () => {
			const sameRows = computed((): TableRow[] => [
				{ id: 1, data: { name: 'Анна', age: 25 } },
				{ id: 2, data: { name: 'Анна', age: 25 } },
			])
			const { processedRows, handleSort } = useTableData(createDefaultOptions({ rows: sameRows }))
			handleSort(testColumns.value[0]) // asc
			expect(processedRows.value).toHaveLength(2)
			expect(processedRows.value[0].id).toBe(1)
			expect(processedRows.value[1].id).toBe(2)
		})
	})

	// ============================================================
	// Недостающее покрытие: getSortIndex без multiSort
	// ============================================================

	describe('getSortIndex без multiSort', () => {
		it('getSortIndex возвращает 0 когда isMultiSort=false', () => {
			const { getSortIndex, handleSort } = useTableData(createDefaultOptions({ isMultiSort: () => false }))
			handleSort(testColumns.value[0])
			expect(getSortIndex('name')).toBe(0)
		})

		it('getSortIndex возвращает 0 когда sortStates.length <= 1 в multiSort', () => {
			const { getSortIndex, handleSort } = useTableData(createDefaultOptions({ isMultiSort: () => true }))
			handleSort(testColumns.value[0])
			expect(getSortIndex('name')).toBe(0) // только 1 состояние
		})
	})

	describe('Дополнительные покрытия веток', () => {
		it('processedRows: сортировка пропускает sort без direction', () => {
			// Покрывает useTableData.ts:112 — `if (!sort.direction) continue`.
			const { processedRows, sortStates } = useTableData(createDefaultOptions({ isMultiSort: () => true }))
			// Вручную вставим sort с direction=null + sort с direction='asc'
			sortStates.value = [
				{ key: 'name', direction: null },
				{ key: 'age', direction: 'asc' },
			]
			const rows = processedRows.value
			expect(rows[0].data.age).toBe(20)
			expect(rows[rows.length - 1].data.age).toBe(35)
		})

		it('processedRows: сортировка desc (direction → -1)', () => {
			// Покрывает useTableData.ts:115 — `sort.direction === 'asc' ? 1 : -1` (ветка -1).
			const { processedRows, sortStates } = useTableData(createDefaultOptions())
			sortStates.value = [{ key: 'age', direction: 'desc' }]
			const rows = processedRows.value
			expect(rows[0].data.age).toBe(35)
			expect(rows[rows.length - 1].data.age).toBe(20)
		})

		it('handleSort: третий клик при null возвращает asc', () => {
			// Покрывает useTableData.ts:227 — `currentDir === 'desc' ? null : 'asc'` (ветка 'asc').
			const { sortStates, handleSort } = useTableData(createDefaultOptions({ isMultiSort: () => true }))
			// 1) asc
			handleSort(testColumns.value[0])
			expect(sortStates.value[0].direction).toBe('asc')
			// 2) desc
			handleSort(testColumns.value[0])
			expect(sortStates.value[0].direction).toBe('desc')
			// 3) null
			handleSort(testColumns.value[0])
			expect(sortStates.value).toHaveLength(0)
			// 4) снова asc (после null — currentDir отсутствует → существующий existingIndex=-1 → nextDirection='asc')
			handleSort(testColumns.value[0])
			expect(sortStates.value[0].direction).toBe('asc')
		})

		it('getFilterLabel: fallback на f.key когда колонка не найдена', () => {
			// Покрывает useTableData.ts:306 — `col?.label || f.key`.
			const { getFilterLabel } = useTableData(createDefaultOptions())
			const filter: ColumnFilter = { key: 'unknownKey', operator: 'eq', value: 'test' }
			expect(getFilterLabel(filter)).toBe('unknownKey = test')
		})

		it('getFilterLabel: fallback на f.operator когда оператор неизвестен', () => {
			// Покрывает useTableData.ts:306 — `ops[f.operator] || f.operator` (вторая ветка).
			const { getFilterLabel } = useTableData(createDefaultOptions())
			const filter = { key: 'name', operator: 'unknownOp' as ColumnFilter['operator'], value: 'X' }
			expect(getFilterLabel(filter)).toBe('Имя unknownOp X')
		})

		it('handlePageSizeChange: принимает массив значений', () => {
			// Покрывает useTableData.ts:316 — `Array.isArray(value) ? value[0] : value` (ветка array).
			const onPageSizeChange = vi.fn()
			const { localPageSize, handlePageSizeChange } = useTableData(createDefaultOptions({ onPageSizeChange }))
			handlePageSizeChange([15, 30])
			expect(localPageSize.value).toBe(15)
			expect(onPageSizeChange).toHaveBeenCalledWith(15)
		})

		it('handlePageSizeChange: newSize=0 → loadedCount = DEFAULT_PAGE_SIZE', () => {
			// Покрывает useTableData.ts:319 — `newSize || DEFAULT_PAGE_SIZE` (fallback на дефолт).
			const onPageSizeChange = vi.fn()
			const { localPageSize, handlePageSizeChange } = useTableData(createDefaultOptions({ onPageSizeChange }))
			handlePageSizeChange(0)
			// localPageSize = 0; loadedCount = DEFAULT_PAGE_SIZE (5)
			expect(localPageSize.value).toBe(0)
			expect(onPageSizeChange).toHaveBeenCalledWith(0)
		})

		it('handlePageSizeChange: одиночное строковое значение (не массив)', () => {
			// Покрывает useTableData.ts:316 — `Array.isArray(value) ? value[0] : value` ветка false.
			const onPageSizeChange = vi.fn()
			const { localPageSize, handlePageSizeChange } = useTableData(createDefaultOptions({ onPageSizeChange }))
			handlePageSizeChange('25')
			expect(localPageSize.value).toBe(25)
			expect(onPageSizeChange).toHaveBeenCalledWith(25)
		})

		it('handlePageSizeChange: newSize === localPageSize → ничего не делает', () => {
			// Покрывает useTableData.ts:316 — ветка else у `if (newSize !== localPageSize.value)`.
			const onPageSizeChange = vi.fn()
			const { localPageSize, handlePageSizeChange } = useTableData(
				createDefaultOptions({ pageSize: ref(10), onPageSizeChange }),
			)
			expect(localPageSize.value).toBe(10)
			handlePageSizeChange(10) // совпадает с текущим → callback НЕ вызывается
			expect(onPageSizeChange).not.toHaveBeenCalled()
		})

		it("handleSort: currentDir === null → nextDirection 'asc' (мульти, существующая запись)", () => {
			// Покрывает useTableData.ts:227 — `currentDir === 'desc' ? null : 'asc'` ветка 'asc'.
			const { sortStates, handleSort } = useTableData(createDefaultOptions({ isMultiSort: () => true }))
			// Вручную вставим запись с direction=null
			sortStates.value = [{ key: 'name', direction: null }]
			handleSort(testColumns.value[0])
			// currentDir=null → 'asc' → multiSort: nextDirection не null, existingIndex>=0 → обновление существующей
			expect(sortStates.value[0].direction).toBe('asc')
		})
	})
})

