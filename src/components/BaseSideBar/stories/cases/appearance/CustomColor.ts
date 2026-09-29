import { expect } from 'storybook/test'
import type meta from '../../BaseSideBar.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Кастомный цвет через `color`: `bg.base` — фон панели, `text.base` — заголовок и пункты,',
					'`bg.hover` и `text.hover` — пункт под курсором и текущий пункт.',
				].join('\n'),
			},
		},
	},
	args: {
		color: {
			bg: { base: '#0f172a', hover: '#1e293b' },
			text: { base: '#cbd5e1', hover: '#ffffff' },
		},
	},
	play: async ({ canvas }) => {
		await expect(getComputedStyle(canvas.getByRole('complementary')).backgroundColor).toBe('rgb(15, 23, 42)')
		await expect(getComputedStyle(canvas.getByRole('link', { name: 'Главная' })).color).toBe('rgb(203, 213, 225)')
		await expect(getComputedStyle(canvas.getByRole('link', { name: /Товары/ })).backgroundColor).toBe('rgb(30, 41, 59)')
	},
}
