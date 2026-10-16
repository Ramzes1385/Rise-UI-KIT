import type { HeatmapCell, HeatmapDay, HeatmapMonth } from '../../types/BaseHeatmap.types'

export const toDay = (value: string | Date): Date => {
	const date = typeof value === 'string' ? new Date(`${value.slice(0, 10)}T00:00:00`) : new Date(value)
	date.setHours(0, 0, 0, 0)
	return date
}

const dayKey = (date: Date): string =>
	`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

const weekdayIndex = (date: Date, firstDay: number): number => (date.getDay() - firstDay + 7) % 7

export function levelOf(value: number, max: number): number {
	if (value <= 0 || max <= 0) return 0
	return Math.min(4, Math.ceil((value / max) * 4))
}

export function heatmapCells(data: readonly HeatmapDay[], context: { end: Date; weeks: number; firstDay?: number }): HeatmapCell[] {
	const firstDay = context.firstDay ?? 1
	const values = new Map<string, number>()
	for (const day of data) {
		const key = dayKey(toDay(day.date))
		values.set(key, (values.get(key) ?? 0) + day.value)
	}
	const count = weekdayIndex(context.end, firstDay) + (context.weeks - 1) * 7 + 1
	const start = new Date(context.end.getFullYear(), context.end.getMonth(), context.end.getDate() - count + 1)
	const max = Math.max(0, ...values.values())
	return Array.from({ length: count }, (_, index) => {
		const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index)
		const value = values.get(dayKey(date)) ?? 0
		return {
			key: dayKey(date),
			date,
			value,
			level: levelOf(value, max),
			week: Math.floor(index / 7),
			weekday: weekdayIndex(date, firstDay),
		}
	})
}

export function heatmapMonths(cells: readonly HeatmapCell[], locale: string): HeatmapMonth[] {
	const format = new Intl.DateTimeFormat(locale, { month: 'short' })
	return cells
		.filter(cell => cell.date.getDate() <= 7 && cell.weekday === 0 && cell.week < cells[cells.length - 1].week)
		.map(cell => ({ key: cell.key, label: format.format(cell.date).replace('.', ''), week: cell.week }))
}
