/** Элемент списка видимых страниц */
type VisiblePageItem = number | '...'

/** Параметры для расчёта видимых страниц */
interface VisiblePagesOptions {
	/** Текущая страница */
	current: number
	/** Общее количество страниц */
	total: number
	/** Максимальное количество видимых кнопок (включая первую и последнюю) */
	maxVisible?: number
	/** Показывать последнюю страницу всегда */
	showLastPage?: boolean
}

/** Параметры для расчёта информации о странице */
interface PageInfoOptions {
	/** Текущая страница */
	current: number
	/** Размер страницы */
	pageSize: number
	/** Общее количество элементов */
	total: number
}

export type { PageInfoOptions, VisiblePageItem, VisiblePagesOptions }
