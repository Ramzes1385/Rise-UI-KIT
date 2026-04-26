import { computed, onBeforeUnmount, ref, type Ref, watch } from 'vue'

import type {
	ColumnFilter,
	SortDirection,
	SortState,
	TableColumn,
	TableRow,
} from '@/shared/ui/BaseTable/BaseTable.types'
import { calcTotalPages, calcVisiblePages } from '@/shared/utils/paginationUtils'

import type { UseTableDataOptions } from './useTableData.types'

/**
 * Composable для сортировки, фильтрации, пагинации и поиска таблицы.
 * Вынесено из BaseTable — God-компонент на 800+ строк.
 *
 * @example
 * ```ts
 * const {
 *   searchQuery, sortStates, activeFilters,
 *   processedRows, displayedRows, currentPage, totalPages, visiblePages,
 *   getSortDirection, handleSort, handleSearchInput, addFilter, removeFilter,
 * } = useTableData({
 *   rows: toRef(props, 'rows'),
 *   columns: localColumns,
 *   loadMode: () => props.loadMode,
 *   pageSize: toRef(props, 'pageSize'),
 *   isMultiSort: () => props.isMultiSort,
 *   searchDebounce: () => props.searchDebounce,
 *   onSearch: (q) => emit('search', q),
 *   onSort: (s) => emit('sort', s),
 *   onFilter: (f) => emit('filter', f),
 * })
 * ```
 */
/** Размер страницы по умолчанию для режимов button/infinite */
const DEFAULT_PAGE_SIZE = 5

function useTableData(options: UseTableDataOptions) {
	const {
		rows,
		columns,
		loadMode,
		pageSize,
		isMultiSort,
		searchDebounce,
		onSearch,
		onSort,
		onFilter,
		onPageSizeChange,
	} = options

	const searchQuery = ref('')
	const searchTimeout = ref<ReturnType<typeof setTimeout> | null>(null)
	const sortStates = ref<SortState[]>([])
	const activeFilters = ref<ColumnFilter[]>([])
	const currentPage = ref(1)
	const localPageSize = ref(pageSize.value)

	// ============================================================
	// Обработка данных: поиск + фильтры + сортировка
	// ============================================================

	/** Обработанные строки (поиск + фильтры + сортировка) */
	const processedRows = computed((): TableRow[] => {
		let result = [...rows.value]

		// Поиск
		if (searchQuery.value) {
			const query = searchQuery.value.toLowerCase()
			result = result.filter(row => {
				return Object.values(row.data).some(val => String(val).toLowerCase().includes(query))
			})
		}

		// Фильтры
		for (const filter of activeFilters.value) {
			result = result.filter(row => {
				const val = row.data[filter.key]
				if (val === undefined) return false
				const strVal = String(val).toLowerCase()
				const filterVal = filter.value.toLowerCase()

				switch (filter.operator) {
					case 'eq':
						return strVal === filterVal
					case 'ne':
						return strVal !== filterVal
					case 'contains':
						return strVal.includes(filterVal)
					case 'gt':
						return Number(val) > Number(filter.value)
					case 'lt':
						return Number(val) < Number(filter.value)
					case 'gte':
						return Number(val) >= Number(filter.value)
					case 'lte':
						return Number(val) <= Number(filter.value)
					default:
						return true
				}
			})
		}

		// Множественная сортировка
		if (sortStates.value.length > 0) {
			result.sort((a, b) => {
				for (const sort of sortStates.value) {
					if (!sort.direction) continue

					const col = columns.value.find(c => c.key === sort.key)
					const dir = sort.direction === 'asc' ? 1 : -1
					const aVal = a.data[sort.key]
					const bVal = b.data[sort.key]

					let cmp = 0
					if (col?.sortType === 'number') {
						cmp = Number(aVal) - Number(bVal)
					} else if (col?.sortType === 'date') {
						cmp = new Date(String(aVal)).getTime() - new Date(String(bVal)).getTime()
					} else {
						cmp = String(aVal).localeCompare(String(bVal))
					}

					if (cmp !== 0) return cmp * dir
				}
				return 0
			})
		}

		return result
	})

	// ============================================================
	// Пагинация
	// ============================================================

	/** Эффективный размер страницы (с учётом default) */
	const effectivePageSize = computed((): number => {
		return localPageSize.value || DEFAULT_PAGE_SIZE
	})

	/** Количество загруженных строк для button/infinite режимов */
	const loadedCount = ref(effectivePageSize.value)

	/** Сброс счётчика при изменении исходных данных */
	watch(
		() => rows.value.length,
		() => {
			loadedCount.value = effectivePageSize.value
		},
	)

	/** Отображаемые строки (с учётом пагинации) */
	const displayedRows = computed((): TableRow[] => {
		const mode = loadMode()
		if (mode === 'pagination') {
			if (!localPageSize.value) return processedRows.value
			const start = (currentPage.value - 1) * localPageSize.value
			return processedRows.value.slice(start, start + localPageSize.value)
		}
		if (mode === 'button' || mode === 'infinite') {
			return processedRows.value.slice(0, loadedCount.value)
		}
		return processedRows.value
	})

	/** Есть ли ещё данные для подгрузки */
	const hasMoreRows = computed((): boolean => {
		const mode = loadMode()
		if (mode === 'button' || mode === 'infinite') {
			return loadedCount.value < processedRows.value.length
		}
		return false
	})

	/** Подгрузить ещё данные */
	function loadMore(): void {
		loadedCount.value += effectivePageSize.value
	}

	/** Общее количество страниц */
	const totalPages = computed((): number => {
		return calcTotalPages(processedRows.value.length, localPageSize.value)
	})

	/** Видимые номера страниц */
	const visiblePages = computed((): number[] => {
		return calcVisiblePages({ current: currentPage.value, total: totalPages.value })
	})

	/** Все ли выбраны */
	const isAllSelected = computed((): boolean => {
		const selectable = processedRows.value.filter(r => !r.isDisabled)
		return selectable.length > 0 && selectable.every(r => r.isSelected)
	})

	// ============================================================
	// Сортировка
	// ============================================================

	/** Получить направление сортировки для колонки */
	function getSortDirection(key: string): SortDirection {
		const state = sortStates.value.find(s => s.key === key)
		return state ? state.direction : null
	}

	/** Получить индекс сортировки (для мульти-сортировки) */
	function getSortIndex(key: string): number {
		if (!isMultiSort() || sortStates.value.length <= 1) return 0
		const index = sortStates.value.findIndex(s => s.key === key)
		return index >= 0 ? index + 1 : 0
	}

	/** Обработка сортировки */
	function handleSort(col: TableColumn): void {
		if (!col.isSortable) return

		const existingIndex = sortStates.value.findIndex(s => s.key === col.key)
		let nextDirection: SortDirection = 'asc'

		if (existingIndex >= 0) {
			const currentDir = sortStates.value[existingIndex].direction
			nextDirection = currentDir === 'asc' ? 'desc' : currentDir === 'desc' ? null : 'asc'
		}

		if (isMultiSort()) {
			if (nextDirection === null) {
				sortStates.value = sortStates.value.filter(s => s.key !== col.key)
			} else if (existingIndex >= 0) {
				sortStates.value[existingIndex].direction = nextDirection
			} else {
				sortStates.value.push({ key: col.key, direction: nextDirection })
			}
		} else {
			if (nextDirection === null) {
				sortStates.value = []
			} else {
				sortStates.value = [{ key: col.key, direction: nextDirection }]
			}
		}

		if (onSort) onSort(sortStates.value)
	}

	// ============================================================
	// Поиск
	// ============================================================

	/** Ввод поиска с дебаунсом */
	function handleSearchInput(value: string): void {
		searchQuery.value = value

		if (searchTimeout.value) {
			clearTimeout(searchTimeout.value)
		}

		searchTimeout.value = setTimeout(() => {
			currentPage.value = 1
			if (onSearch) onSearch(searchQuery.value)
		}, searchDebounce())
	}

	// ============================================================
	// Фильтры
	// ============================================================

	/** Добавить фильтр */
	function addFilter(
		filterColumn: Ref<string | number>,
		filterOperator: Ref<string | number>,
		filterValue: Ref<string>,
	): void {
		if (!filterColumn.value || !filterValue.value) return
		activeFilters.value.push({
			key: String(filterColumn.value),
			operator: String(filterOperator.value) as ColumnFilter['operator'],
			value: filterValue.value,
		})
		filterValue.value = ''
		currentPage.value = 1
		if (onFilter) onFilter(activeFilters.value)
	}

	/** Удалить фильтр */
	function removeFilter(index: number): void {
		activeFilters.value.splice(index, 1)
		if (onFilter) onFilter(activeFilters.value)
	}

	/** Метка фильтра */
	function getFilterLabel(f: ColumnFilter): string {
		const col = columns.value.find(c => c.key === f.key)
		const ops: Record<string, string> = {
			eq: '=',
			ne: '≠',
			contains: '∋',
			gt: '>',
			lt: '<',
			gte: '≥',
			lte: '≤',
		}
		return `${col?.label || f.key} ${ops[f.operator] || f.operator} ${f.value}`
	}

	// ============================================================
	// Размер страницы
	// ============================================================

	/** Обработчик изменения размера страницы */
	function handlePageSizeChange(value: string | number | (string | number)[]): void {
		const newSize = Number(Array.isArray(value) ? value[0] : value)
		if (newSize !== localPageSize.value) {
			localPageSize.value = newSize
			currentPage.value = 1
			loadedCount.value = newSize || DEFAULT_PAGE_SIZE
			if (onPageSizeChange) onPageSizeChange(newSize)
		}
	}

	/** Сброс страницы и счётчика подгрузки */
	function resetPage(): void {
		if (loadMode() === 'pagination') {
			currentPage.value = 1
		} else {
			loadedCount.value = effectivePageSize.value
		}
	}

	// ============================================================
	// Синхронизация и очистка
	// ============================================================

	/** Синхронизация localPageSize с пропсом */
	watch(pageSize, newSize => {
		localPageSize.value = newSize
	})

	/** Очистка таймаутов */
	onBeforeUnmount(() => {
		if (searchTimeout.value) {
			clearTimeout(searchTimeout.value)
		}
	})

	return {
		searchQuery,
		sortStates,
		activeFilters,
		currentPage,
		localPageSize,
		processedRows,
		displayedRows,
		totalPages,
		visiblePages,
		isAllSelected,
		hasMoreRows,
		getSortDirection,
		getSortIndex,
		handleSort,
		handleSearchInput,
		addFilter,
		removeFilter,
		getFilterLabel,
		handlePageSizeChange,
		loadMore,
		resetPage,
	}
}

export { useTableData }
