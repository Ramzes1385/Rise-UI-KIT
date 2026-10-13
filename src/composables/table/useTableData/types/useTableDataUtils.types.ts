import type { TableColumn } from '@components/BaseTable/types/BaseTable.types'

/** Колонки и язык сравнения строк при сортировке */
export interface SortContext {
	/** Колонки: `sortType` и `sortAccessor` берутся отсюда */
	columns: TableColumn[]
	/** Язык сравнения строк (BCP 47); без него — язык кита */
	locale?: string
}

/** Колонка фильтра и пояс таблицы для проверки строки фильтром */
export interface FilterScope {
	/** Колонка фильтра: её тип (`filterConfig.type`, `sortType`) определяет сравнение */
	column?: TableColumn
	/** Пояс таблицы (IANA) для сутки в фильтре по датам; `filterConfig.timeZone` колонки важнее */
	timeZone?: string
}
