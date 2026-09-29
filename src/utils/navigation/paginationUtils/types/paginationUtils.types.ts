/** Элемент списка видимых страниц */
type VisiblePageItem = number | '...'

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

interface PageInfoOptions {
	/** Текущая страница */
	current: number
	/** Размер страницы */
	pageSize: number
	/** Общее количество элементов */
	total: number
}

export type { PageInfoOptions, VisiblePageItem, VisiblePagesOptions }
