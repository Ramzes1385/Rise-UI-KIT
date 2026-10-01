import type { Ref } from 'vue'
import type { TableRow } from '@components/BaseTable/types/BaseTable.types'

export interface UseTableDisplayedRowsOptions {
	/** Обработанные строки (поиск + фильтры + сортировка) */
	processedRows: Ref<TableRow[]>
	/** Режим подгрузки */
	loadMode: () => string
	/** Текущая страница */
	currentPage: Ref<number>
	/** Локальный размер страницы */
	localPageSize: Ref<number>
	/** Количество загруженных строк для button/infinite режимов */
	loadedCount: Ref<number>
}
