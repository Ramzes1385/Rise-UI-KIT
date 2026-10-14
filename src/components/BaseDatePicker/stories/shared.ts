import { storyDate } from '@/stories/helpers'
import { screen, waitFor, expect } from 'storybook/test'

const DAY_NAME = new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

export function dayName(days: number): string {
	return DAY_NAME.format(storyDate(days))
}

const SHORT_DAY = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })

export function todayRange(from: number, to: number): string {
	return `${SHORT_DAY.format(storyDate(from))} — ${SHORT_DAY.format(storyDate(to))}`
}

export async function findPanel(): Promise<HTMLElement> {
	const panel = await screen.findByRole('dialog', { name: 'Выберите дату' })
	await waitFor(() => expect(panel).toBeVisible())
	return panel
}

export function monthsForWidth(width: number): number {
	const calendar = 7 * 36 + 2 * 4 + 2
	const gap = 8
	const chrome = 2 * 4 + 2
	return Math.max(1, Math.floor((width - chrome + gap) / (calendar + gap)))
}
