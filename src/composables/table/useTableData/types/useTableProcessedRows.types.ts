import type { Ref } from 'vue'
import type { ColumnFilter, SortState, TableColumn, TableRow } from '@components/BaseTable/types/BaseTable.types'

export interface UseTableProcessedRowsOptions {
	/** Строки данных */
	rows: Ref<TableRow[]>
	/** Колонки */
	columns: Ref<TableColumn[]>
	/** Поисковый запрос */
	searchQuery: Ref<string>
	/** Активные фильтры */
	activeFilters: Ref<ColumnFilter[]>
	/** Состояния сортировки */
	sortStates: Ref<SortState[]>
	/** Серверный поиск и фильтры: строки уже отобраны сервером, таблица их не применяет */
	isManualFiltering?: () => boolean
	/** Серверная сортировка: строки уже упорядочены сервером, таблица их не сортирует */
	isManualSorting?: () => boolean
	/** Язык сравнения строк при сортировке (BCP 47); без него — язык кита */
	locale?: () => string | undefined
	/** Пояс (IANA), в котором фильтр по датам считает сутки; без него — пояс пользователя */
	timeZone?: () => string | undefined
}
