/** Composable: отображаемые строки таблицы и признак наличия строк для подгрузки */
import { computed } from 'vue'
import type { TableRow } from '@components/BaseTable/types/BaseTable.types'
import type { UseTableDisplayedRowsOptions } from './types/useTableDisplayedRows.types'

function useTableDisplayedRows(options: UseTableDisplayedRowsOptions) {
	const { processedRows, loadMode, currentPage, localPageSize, loadedCount } = options

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

	const hasMoreRows = computed((): boolean => {
		const mode = loadMode()
		if (mode === 'button' || mode === 'infinite') {
			return loadedCount.value < processedRows.value.length
		}
		return false
	})

	return { displayedRows, hasMoreRows }
}

export { useTableDisplayedRows }
