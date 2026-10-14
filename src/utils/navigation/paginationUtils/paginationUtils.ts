/** Утилиты: расчёт пагинации и видимых страниц */

import { UI_TEXT } from '@/locales/messages'
import { formatMessage, formatNumber } from '@/locales/state'
import type { PageInfoOptions, VisiblePageItem, VisiblePagesOptions } from './types/paginationUtils.types'

function calcTotalPages(total: number, pageSize: number): number {
	if (pageSize <= 0) return 1
	return Math.ceil(total / pageSize)
}

/**
 * Диапазон средних страниц [start, end] вокруг текущей, прижатый к краям 2…last:
 * `last` — total-1, когда последняя страница показана отдельно, иначе total; `slots` — сколько номеров в диапазоне
 */
function calcMiddleRange(current: number, last: number, slots: number): [number, number] {
	let start = current - Math.floor(slots / 2)
	let end = start + slots - 1

	if (start < 2) {
		end = Math.min(last, end + (2 - start))
		start = 2
	}

	if (end > last) {
		start = Math.max(2, start - (end - last))
		end = last
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

	if (end < (showLastPage ? total - 1 : total)) {
		result.push('...')
	}

	if (showLastPage && total > 1) {
		result.push(total)
	}

	return result
}

/** Наименьшее число номеров, при котором текущая страница не пропадает: первая и текущая, а с последней страницей — ещё и она */
function minVisible(showLastPage: boolean): number {
	return showLastPage ? 3 : 2
}

/**
 * Рассчитать массив видимых номеров страниц с многоточиями.
 * Всегда показывает первую страницу, опционально — последнюю.
 * Между разрывами вставляет '...'.
 * `maxVisible` — сколько номеров показать (многоточия не считаются): меньше трёх (без последней страницы — двух) и дробное
 * значение приводятся к наименьшему, при котором видна текущая страница; при чётном числе лишний номер окна — слева от текущей.
 * Текущая страница вне диапазона 1…total сжимается до края, нечисловая (`NaN`) считается первой.
 */
function calcVisiblePages(options: VisiblePagesOptions): VisiblePageItem[] {
	const { total } = options
	const showLastPage = options.showLastPage ?? true
	const maxVisible = Math.max(Math.floor(options.maxVisible ?? 7) || 0, minVisible(showLastPage))
	const current = Math.min(Math.max(Number.isNaN(options.current) ? 1 : options.current, 1), total)

	if (total <= 0) return []

	if (total <= maxVisible) {
		return Array.from({ length: total }, (_, i) => i + 1)
	}

	const range = showLastPage ? calcMiddleRange(current, total - 1, maxVisible - 2) : calcMiddleRange(current, total, maxVisible - 1)
	return buildPageItems(range, total, showLastPage)
}

/** Рассчитать строку информации о странице («1–10 из 100») */
function calcPageInfo(options: PageInfoOptions): string {
	const { current, pageSize, total } = options
	const from = total > 0 ? (current - 1) * pageSize + 1 : 0
	const to = Math.min(current * pageSize, total)
	return formatMessage(UI_TEXT.PAGE_RANGE, { from: formatNumber(from), to: formatNumber(to), total: formatNumber(total) })
}

export { calcPageInfo, calcTotalPages, calcVisiblePages }
