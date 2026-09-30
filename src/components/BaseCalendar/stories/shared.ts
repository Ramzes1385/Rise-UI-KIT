import type { within } from 'storybook/test'
import { storyDate } from '@/stories/helpers'

type Canvas = ReturnType<typeof within>

const DAY_NAME = new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

export function getDay(canvas: Canvas, days: number): HTMLElement {
	const name = DAY_NAME.format(storyDate(days))
	return canvas.getByRole('button', { name: (accessibleName: string) => accessibleName.startsWith(name) })
}
