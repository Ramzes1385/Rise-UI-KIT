import type { PageInfoOptions, VisiblePagesOptions } from './paginationUtils.types'

/** Рассчитать общее количество страниц */
function calcTotalPages(total: number, pageSize: number): number {
	if (pageSize <= 0) return 1
	return Math.ceil(total / pageSize)
}

/** Рассчитать массив видимых номеров страниц */
function calcVisiblePages(options: VisiblePagesOptions): number[] {
	const { current, total, maxVisible } = options
	const pages: number[] = []

	if (total <= 0) return pages

	if (maxVisible && maxVisible > 0) {
		const half = Math.floor(maxVisible / 2)
		const start = Math.max(1, current - half)
		const end = Math.min(total, start + maxVisible - 1)
		const adjustedStart = Math.max(1, end - maxVisible + 1)
		for (let i = adjustedStart; i <= end; i++) pages.push(i)
	} else {
		const start = Math.max(1, current - 2)
		const end = Math.min(total, current + 2)
		for (let i = start; i <= end; i++) pages.push(i)
	}

	return pages
}

/** Рассчитать строку информации о странице («1–10 из 100») */
function calcPageInfo(options: PageInfoOptions): string {
	const { current, pageSize, total } = options
	const from = (current - 1) * pageSize + 1
	const to = Math.min(current * pageSize, total)
	return `${from}–${to} из ${total}`
}

export { calcPageInfo, calcTotalPages, calcVisiblePages }
