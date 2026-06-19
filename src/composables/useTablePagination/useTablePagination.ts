import { computed, ref, watch } from 'vue'
import { TABLE_DEFAULT_PAGE_SIZE } from '@constants/table'
import { calcTotalPages, calcVisiblePages } from '@utils/paginationUtils'
import type { UseTablePaginationOptions, UseTablePaginationReturn } from './useTablePagination.types'
import type { TableRow } from '@components/BaseTable/model/BaseTable.types'
import type { VisiblePageItem } from '@utils/paginationUtils/paginationUtils.types'

/**
 * Composable для управления пагинацией и подгрузкой таблицы.
 */
function useTablePagination(options: UseTablePaginationOptions): UseTablePaginationReturn {
	const { processedRows, loadMode, pageSize, onPageSizeChange } = options

	const currentPage = ref(1)
	const localPageSize = ref(pageSize.value)

	/** Эффективный размер страницы (с учётом default) */
	const effectivePageSize = computed((): number => {
		return localPageSize.value || TABLE_DEFAULT_PAGE_SIZE
	})

	/** Количество загруженных строк для button/infinite режимов */
	const loadedCount = ref(effectivePageSize.value)

	/** Сброс счётчика при изменении исходных данных */
	watch(
		() => processedRows.value.length,
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
	const visiblePages = computed((): VisiblePageItem[] => {
		return calcVisiblePages({ current: currentPage.value, total: totalPages.value })
	})

	/** Обработчик изменения размера страницы */
	function handlePageSizeChange(value: string | number | (string | number)[]): void {
		const newSize = Number(Array.isArray(value) ? value[0] : value)
		if (newSize !== localPageSize.value) {
			localPageSize.value = newSize
			currentPage.value = 1
			loadedCount.value = newSize || TABLE_DEFAULT_PAGE_SIZE
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

	/** Синхронизация localPageSize с пропсом */
	watch(pageSize, newSize => {
		localPageSize.value = newSize
	})

	return {
		currentPage,
		localPageSize,
		displayedRows,
		totalPages,
		visiblePages,
		hasMoreRows,
		loadMore,
		resetPage,
		handlePageSizeChange,
	}
}

export { useTablePagination }
