import { expect } from 'storybook/test'
import { SMALL_COLUMNS } from '../../shared'
import type meta from '../../BaseKanban.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Кастомный цвет через `color`: подложка колонок и цвет заголовков.' } },
	},
	args: { columns: SMALL_COLUMNS, color: { bg: { base: '#6d28d9' }, text: { base: '#ffffff' } } },
	play: async ({ canvasElement }) => {
		const column = canvasElement.querySelector('.base-kanban__column') as HTMLElement
		await expect(getComputedStyle(column).backgroundColor).toBe('rgb(109, 40, 217)')
		await expect(getComputedStyle(column.querySelector('.base-kanban__title') as HTMLElement).color).toBe('rgb(255, 255, 255)')
	},
}
