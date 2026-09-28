import { expect } from 'storybook/test'
import type meta from '../BaseLink.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Кастомный цвет через `color`: текст и цвет при наведении. Токены `var(--rise-…)` сохраняют контраст в обеих темах.',
			},
		},
	},
	args: { color: { text: { base: 'var(--rise-success-text)', hover: 'var(--rise-success)' } } },
	play: async ({ canvas }) => {
		const link = canvas.getByRole('link', { name: 'Настройки проекта' })
		await expect(link.style.getPropertyValue('--custom-text')).toBe('var(--rise-success-text)')
	},
}
