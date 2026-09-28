/** Параметры для расчёта номера строки */
export interface RowNumberOptions {
	/** Индекс строки в текущей странице */
	index: number
	/** Текущая страница */
	currentPage: number
	/** Размер страницы */
	pageSize: number
	/** Режим загрузки */
	loadMode: string
}

/** Служебные колонки таблицы: выбор строк, номер строки, раскрытие */
export interface TableServiceColumns {
	isSelectable?: boolean
	hasRowNumber?: boolean
	hasExpandableRows?: boolean
}

/** Параметры для стиля колонки */
export interface ColumnStyleOptions {
	/** Минимальная ширина */
	minWidth?: string
	/** Максимальная ширина */
	maxWidth?: string
}

/**
 * Ранг ключа сортировки: 0 — значение распознано для типа колонки,
 * 1 — значение есть, но не распознано (например, «—» в числовой колонке), 2 — пустое значение.
 */
export type TableSortRank = 0 | 1 | 2

/** Нормализованный ключ сортировки значения ячейки */
export interface TableSortKey {
	/** Ранг значения — определяет группу независимо от направления сортировки */
	rank: TableSortRank
	/** Число (number/date) или строка (string и нераспознанные значения) для сравнения внутри ранга */
	value: number | string
}
