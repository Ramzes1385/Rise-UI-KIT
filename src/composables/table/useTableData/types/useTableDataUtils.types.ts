import type { TableColumn } from '@components/BaseTable/types/BaseTable.types'

/** Колонки и язык сравнения строк при сортировке */
export interface SortContext {
	/** Колонки: `sortType` и `sortAccessor` берутся отсюда */
	columns: TableColumn[]
	/** Язык сравнения строк (BCP 47); без него — язык кита */
	locale?: string
}
