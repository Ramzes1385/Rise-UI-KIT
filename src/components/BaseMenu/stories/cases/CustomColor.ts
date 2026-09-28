import { SHORT_ITEMS } from '../shared'
import { expect } from 'storybook/test'
import type meta from '../BaseMenu.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Кастомный цвет через `color`: `bg.base` — фон панели, `bg.hover` — фон пункта под курсором,',
					'`text.base` и `text.hover` — текст пунктов.',
				].join('\n'),
			},
		},
	},
	args: {
		items: SHORT_ITEMS,
		color: {
			bg: { base: '#1e293b', hover: '#334155' },
			text: { base: '#e2e8f0', hover: '#ffffff' },
		},
	},
	play: async ({ canvas }) => {
		const item = canvas.getByRole('button', { name: 'Открыть' })
		await expect(getComputedStyle(item).color).toBe('rgb(226, 232, 240)')
		await expect(getComputedStyle(item.closest('.base-menu') as HTMLElement).backgroundColor).toBe('rgb(30, 41, 59)')
	},
}
