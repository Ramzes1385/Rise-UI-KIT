import { expect } from 'storybook/test'
import type meta from '../../BaseMegaMenu.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Кастомный цвет через `color`: `bg.base` — фон строки, `text.base` — разделы, `bg.hover` и `text.hover` — раздел',
					'под курсором и открытый. Панель остаётся в цветах темы.',
				].join('\n'),
			},
		},
	},
	args: {
		openKey: undefined,
		color: { bg: { base: '#0f172a', hover: '#1e293b' }, text: { base: '#cbd5e1', hover: '#ffffff' } },
	},
	play: async ({ canvas }) => {
		const bar = canvas.getByRole('navigation').firstElementChild as HTMLElement
		await expect(getComputedStyle(bar).backgroundColor).toBe('rgb(15, 23, 42)')
		await expect(getComputedStyle(canvas.getByRole('button', { name: 'Продукты' })).color).toBe('rgb(203, 213, 225)')
	},
}
