import { storyDate } from '@/stories/helpers'
import { screen, waitFor, expect } from 'storybook/test'

const DAY_NAME = new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

export function dayName(days: number): string {
	return DAY_NAME.format(storyDate(days))
}

export async function findPanel(): Promise<HTMLElement> {
	const panel = await screen.findByRole('dialog', { name: 'Выберите дату' })
	await waitFor(() => expect(panel).toBeVisible())
	return panel
}

export function docsFrame(height: number) {
	return { story: { inline: false, height: `${height}px` } }
}
