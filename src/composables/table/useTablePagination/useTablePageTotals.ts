/** Composable: итоги пагинации таблицы — число строк, число страниц и видимые кнопки страниц */
import { computed } from 'vue'
import type { Ref } from 'vue'
import type { TableRow } from '@components/BaseTable/types/BaseTable.types'
import { calcTotalPages, calcVisiblePages } from '@utils/navigation/paginationUtils'
import type { VisiblePageItem } from '@utils/navigation/paginationUtils/types/paginationUtils.types'

function useTablePageTotals(state: {
	processedRows: Ref<TableRow[]>
	localPageSize: Ref<number>
	currentPage: Ref<number>
	totalRows?: () => number | undefined
}) {
	const { processedRows, localPageSize, currentPage, totalRows } = state
	const totalCount = computed((): number => totalRows?.() ?? processedRows.value.length)

	const totalPages = computed((): number => {
		return calcTotalPages(totalCount.value, localPageSize.value)
	})

	const visiblePages = computed((): VisiblePageItem[] => {
		return calcVisiblePages({ current: currentPage.value, total: totalPages.value })
	})

	return { totalCount, totalPages, visiblePages }
}

export { useTablePageTotals }
