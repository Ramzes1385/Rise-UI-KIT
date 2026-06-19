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

/** Параметры для стиля колонки */
export interface ColumnStyleOptions {
	/** Минимальная ширина */
	minWidth?: string
	/** Максимальная ширина */
	maxWidth?: string
}
