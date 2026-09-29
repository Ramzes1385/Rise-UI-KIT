import { COLUMNS } from '../../shared'
import { expect } from 'storybook/test'
import type meta from '../../BaseMegaMenu.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Кастомный цвет через `color`: `bg.base` — фон панелей, `text.base` — текст пунктов, заголовков и описаний,',
					'`bg.hover` и `text.hover` — пункт под курсором и раскрытый узел.',
				].join('\n'),
			},
		},
	},
	args: {
		columns: COLUMNS.slice(0, 2),
		color: {
			bg: { base: '#eff6ff', hover: '#dbeafe' },
			text: { base: '#1e3a8a', hover: '#172554' },
		},
	},
	play: async ({ canvas }) => {
		const link = canvas.getByRole('link', { name: 'Документы' })
		await expect(getComputedStyle(link).color).toBe('rgb(30, 58, 138)')
		await expect(getComputedStyle(link.closest('.base-mega-menu') as HTMLElement).backgroundColor).toBe('rgb(239, 246, 255)')
	},
}
