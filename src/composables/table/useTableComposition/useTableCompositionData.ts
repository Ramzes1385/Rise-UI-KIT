import type { Ref } from 'vue'
/** Composable: подключение данных таблицы (поиск, сортировка, фильтры, пагинация) к событиям компонента */
import { useTableData } from '@composables/table/useTableData'
import type { TableColumn } from '@components/BaseTable/types/BaseTable.types'
import type { UseTableCompositionOptions } from './types/useTableComposition.types'

function useTableCompositionData(options: UseTableCompositionOptions, localColumns: Ref<TableColumn[]>) {
	const { rows, loadMode, pageSize, hasMore, isMultiSort, searchDebounce, sortLocale, emit } = options
	const { page, totalRows, timeZone } = options

	return useTableData({
		rows,
		columns: localColumns,
		loadMode: () => loadMode.value,
		pageSize,
		hasMore: () => hasMore?.value ?? false,
		isMultiSort: () => isMultiSort.value,
		searchDebounce: () => searchDebounce.value,
		sortLocale: () => sortLocale?.value,
		timeZone: () => timeZone?.value,
		onSearch: (q: string) => emit('search', q),
		onSort: states => emit('sort', states),
		onFilter: filters => emit('filter', filters),
		onPageSizeChange: (size: number) => {
			emit('page-size-change', size)
			emit('update:pageSize', size)
		},
		page: () => page?.value,
		onPageChange: (current: number) => {
			emit('page-change', current)
			emit('update:page', current)
		},
		totalRows: () => totalRows?.value,
	})
}

export { useTableCompositionData }
