import type { UseTableColumnsReturn } from '@composables/table/useTableColumns'
import type { UseTableSelectionReturn } from '@composables/table/useTableSelection'
import type { UseTableDataReturn } from '@composables/table/useTableData/types/useTableData.types'

export interface UseTableCompositionActionsParts {
	/** Состояние и действия колонок */
	tableColumns: UseTableColumnsReturn
	/** Данные таблицы: поиск, фильтры, сортировка, пагинация */
	data: UseTableDataReturn
	/** Выбор строк */
	selection: UseTableSelectionReturn
}
