/** Утилиты: расчёт пагинации и видимых страниц */

import { UI_TEXT } from '@/locales/messages'
import { formatMessage, formatNumber } from '@/locales/state'
import type { PageInfoOptions, VisiblePageItem, VisiblePagesOptions } from './types/paginationUtils.types'

function calcTotalPages(total: number, pageSize: number): number {
	if (pageSize <= 0) return 1
	return Math.ceil(total / pageSize)
}

/** Диапазон средних страниц [start, end] вокруг текущей, прижатый к краям 2…total-1 */
function calcMiddleRange(current: number, total: number, maxVisible: number): [number, number] {
	const slotsForMiddle = maxVisible - 2 // минус первая и последняя
	const half = Math.floor(slotsForMiddle / 2)

	let start = current - half
	let end = current + half

	if (start < 2) {
		end = Math.min(total - 1, end + (2 - start))
		start = 2
	}

	if (end > total - 1) {
		start = Math.max(2, start - (end - (total - 1)))
		end = total - 1
	}

	return [start, end]
}

/** Собрать список: первая страница, многоточия, средний диапазон и (опционально) последняя */
function buildPageItems(range: [number, number], total: number, showLastPage: boolean): VisiblePageItem[] {
	const [start, end] = range
	const result: VisiblePageItem[] = [1]

	if (start > 2) {
		result.push('...')
	}

	for (let i = start; i <= end; i++) {
		result.push(i)
	}

	if (showLastPage && end < total - 1) {
		result.push('...')
	}

	if (showLastPage && total > 1) {
		result.push(total)
	}

	return result
}

/**
 * Рассчитать массив видимых номеров страниц с многоточиями.
 * Всегда показывает первую страницу, опционально — последнюю.
 * Между разрывами вставляет '...'.
 */
function calcVisiblePages(options: VisiblePagesOptions): VisiblePageItem[] {
	const { current, total } = options
	const maxVisible = options.maxVisible ?? 7
	const showLastPage = options.showLastPage ?? true

	if (total <= 0) return []

	if (total <= maxVisible) {
		return Array.from({ length: total }, (_, i) => i + 1)
	}

	return buildPageItems(calcMiddleRange(current, total, maxVisible), total, showLastPage)
}

/** Рассчитать строку информации о странице («1–10 из 100») */
function calcPageInfo(options: PageInfoOptions): string {
	const { current, pageSize, total } = options
	const from = (current - 1) * pageSize + 1
	const to = Math.min(current * pageSize, total)
	return formatMessage(UI_TEXT.PAGE_RANGE, { from: formatNumber(from), to: formatNumber(to), total: formatNumber(total) })
}

export { calcPageInfo, calcTotalPages, calcVisiblePages }
