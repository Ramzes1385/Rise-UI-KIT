/** Composable: агрегация логики таблицы */
import { computed, watch } from 'vue'
import { calcRowNumber } from '@utils/navigation/tableUtils'
import { calcPageInfo } from '@utils/navigation/paginationUtils'
import { useTableCompositionModel } from './useTableCompositionModel'
import { useTableCompositionActions } from './useTableCompositionActions'
import type { UseTableCompositionOptions } from './types/useTableComposition.types'
import { pickColumnsState, pickDataHandlers, pickDataState, pickToolbarState } from './useTableCompositionUtils'

/** Описание: агрегирует логику таблицы — сортировка, фильтрация, поиск, пагинация, выбор строк, раскрытие, ресайз колонок и infinite scroll */
function useTableComposition(options: UseTableCompositionOptions) {
	const { loadMode, pageSizeOptions, emit } = options
	const { tableColumns, data, selection, expand, toolbar } = useTableCompositionModel(options)
	const { currentPage, localPageSize, processedRows } = data

	watch(currentPage, newPage => {
		emit('page-change', newPage)
	})

	const pageSizeSelectOptions = computed(() => {
		return pageSizeOptions.value.map(size => ({
			value: String(size),
			label: String(size),
		}))
	})

	const paginationInfo = computed((): string => {
		return calcPageInfo({
			current: currentPage.value,
			pageSize: localPageSize.value,
			total: processedRows.value.length,
		})
	})

	function getRowNumber(index: number): number {
		return calcRowNumber({
			index,
			currentPage: currentPage.value,
			pageSize: localPageSize.value,
			loadMode: loadMode.value,
		})
	}

	const actions = useTableCompositionActions(options, { tableColumns, data, selection })

	return {
		...pickDataState(data),
		...pickColumnsState(tableColumns),
		isAllSelected: selection.isAllSelected,
		isSelected: selection.isSelected,
		isExpanded: expand.isExpanded,
		toggleExpand: expand.toggleExpand,
		handleRowClick: expand.handleRowClick,
		...pickDataHandlers(data),
		...pickToolbarState(toolbar),
		pageSizeSelectOptions,
		paginationInfo,
		getRowNumber,
		...actions,
	}
}

export { useTableComposition }
