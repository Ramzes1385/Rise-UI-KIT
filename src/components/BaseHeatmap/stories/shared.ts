import { STORY_TODAY } from '@/stories/helpers'
import type { HeatmapDay } from '../types/BaseHeatmap.types'

function seeded(seed: number): () => number {
	let value = seed
	return () => {
		value = (value * 16807) % 2147483647
		return value / 2147483647
	}
}

export function activity(end: Date, days = 371): HeatmapDay[] {
	const random = seeded(42)
	return Array.from({ length: days }, (_, index) => {
		const date = new Date(end.getFullYear(), end.getMonth(), end.getDate() - index)
		const weekend = date.getDay() === 0 || date.getDay() === 6
		const roll = random()
		const value = roll < (weekend ? 0.7 : 0.25) ? 0 : Math.round(roll * (weekend ? 4 : 12))
		return { date, value }
	})
}

const isoDay = (date: Date): string =>
	`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

export function recentDays(count: number): { date: string; value: number }[] {
	return activity(STORY_TODAY, count).map(day => ({ date: isoDay(new Date(day.date)), value: day.value }))
}
