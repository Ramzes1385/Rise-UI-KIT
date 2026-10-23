import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseBreadcrumbs.stories'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Кастомный цвет через `color`: `text.base` — ссылки, `text.hover` — ссылка под курсором, `text.active` — текущая страница,',
					'`bg.base` — фон контейнера (варианты `outline`, `shadow`, `soft`).',
				].join('\n'),
			},
		},
	},
	args: {
		variant: 'soft',
		color: {
			bg: { base: '#eff6ff' },
			text: { base: '#1d4ed8', hover: '#1e3a8a', active: '#172554' },
		},
	},
	play: async ({ canvas }) => {
		await expect(getComputedStyle(canvas.getByRole('link', { name: 'Каталог' })).color).toBe('rgb(29, 78, 216)')
		await expect(getComputedStyle(canvas.getByRole('navigation')).backgroundColor).toBe('rgb(239, 246, 255)')
	},
}
