/** Утилиты: расчёт пагинации и видимых страниц */

import type { PageInfoOptions, VisiblePageItem, VisiblePagesOptions } from './paginationUtils.types'

/** Рассчитать общее количество страниц */
function calcTotalPages(total: number, pageSize: number): number {
	if (pageSize <= 0) return 1
	return Math.ceil(total / pageSize)
}

/**
 * Рассчитать массив видимых номеров страниц с многоточиями.
 * Всегда показывает первую страницу, опционально — последнюю.
 * Между разрывами вставляет '...'.
 */
function calcVisiblePages(options: VisiblePagesOptions): VisiblePageItem[] {
	const current = options.current
	const total = options.total
	const maxVisible = options.maxVisible ?? 7
	const showLastPage = options.showLastPage ?? true

	if (total <= 0) return []

	// Если страниц меньше лимита — показываем все
	if (total <= maxVisible) {
		return Array.from({ length: total }, (_, i) => i + 1)
	}

	const result: VisiblePageItem[] = []
	const last = showLastPage ? total : total
	const slotsForMiddle = maxVisible - 2 // минус первая и последняя
	const half = Math.floor(slotsForMiddle / 2)

	let start = current - half
	let end = current + half

	// Прижимаем к началу
	if (start < 2) {
		end = Math.min(last - 1, end + (2 - start))
		start = 2
	}

	// Прижимаем к концу
	if (end > last - 1) {
		start = Math.max(2, start - (end - (last - 1)))
		end = last - 1
	}

	// Первая страница
	result.push(1)

	// Левое многоточие
	if (start > 2) {
		result.push('...')
	}

	// Страницы вокруг текущей
	for (let i = start; i <= end; i++) {
		result.push(i)
	}

	// Правое многоточие
	if (showLastPage && end < last - 1) {
		result.push('...')
	}

	// Последняя страница
	if (showLastPage && last > 1) {
		result.push(last)
	}

	return result
}

/** Рассчитать строку информации о странице («1–10 из 100») */
function calcPageInfo(options: PageInfoOptions): string {
	const { current, pageSize, total } = options
	const from = (current - 1) * pageSize + 1
	const to = Math.min(current * pageSize, total)
	return `${from}–${to} из ${total}`
}

export { calcPageInfo, calcTotalPages, calcVisiblePages }
