/** Composable: логика BaseTableHeader — сортировка для скринридера и иконки направления, номера мультисортировки */
import { useId } from 'vue'
import type { TableColumn } from '../types/BaseTable.types'
import type { BaseTableHeaderProps } from '../types/BaseTableHeader.types'

/** Подпись чекбокса «выбрать все» скрыта визуально: она нужна только как доступное имя */
const HIDDEN_CHECKBOX_LABEL = { label: 'base-table__visually-hidden' }

export function useBaseTableHeader(props: BaseTableHeaderProps) {
	return {
		hiddenCheckboxLabel: HIDDEN_CHECKBOX_LABEL,
		// Префикс id описаний приоритета сортировки: уникален для каждой таблицы на странице
		idPrefix: useId(),
		/** Состояние сортировки для скринридера; у несортируемых колонок атрибут не выводится */
		getAriaSort(column: TableColumn): 'ascending' | 'descending' | 'none' | undefined {
			if (!column.isSortable) return undefined
			const direction = props.getSortDirection(column.key)
			if (direction === 'asc') return 'ascending'
			if (direction === 'desc') return 'descending'
			return 'none'
		},
		/** Иконка направления: стрелка вверх/вниз у отсортированной колонки, двойная стрелка — у остальных */
		getSortIcon(column: TableColumn): string {
			const direction = props.getSortDirection(column.key)
			if (direction === 'asc') return 'sort-up'
			if (direction === 'desc') return 'sort-down'
			return 'sort'
		},
		/** Приоритет колонки в мультисортировке (1, 2, …); 0 — без номера: одиночная сортировка, одна колонка или колонка не участвует */
		getSortPriority: (column: TableColumn): number => (props.isMultiSort ? props.getSortIndex(column.key) : 0),
	}
}
