import { useId } from 'vue'
import type { TableColumn } from '../../types/BaseTable.types'
import type { BaseTableHeaderProps } from '../../types/header/BaseTableHeader.types'

export function useBaseTableHeader(props: BaseTableHeaderProps) {
	return {
		idPrefix: useId(),
		getAriaSort(column: TableColumn): 'ascending' | 'descending' | 'none' | undefined {
			if (!column.isSortable) return undefined
			const direction = props.getSortDirection(column.key)
			if (direction === 'asc') return 'ascending'
			if (direction === 'desc') return 'descending'
			return 'none'
		},
		getSortIcon(column: TableColumn): string {
			const direction = props.getSortDirection(column.key)
			if (direction === 'asc') return 'sort-up'
			if (direction === 'desc') return 'sort-down'
			return 'sort'
		},
		getSortPriority: (column: TableColumn): number => (props.isMultiSort ? props.getSortIndex(column.key) : 0),
	}
}
