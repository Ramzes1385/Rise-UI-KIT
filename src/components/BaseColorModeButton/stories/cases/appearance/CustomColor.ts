import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseColorModeButton.stories'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Кастомный цвет через `color`, как у BaseButton. Для статусов берите токены ролей: `var(--rise-primary-soft)`.',
			},
		},
	},
	args: {
		variant: 'default',
		color: {
			bg: { base: 'var(--rise-primary-soft)', hover: 'var(--rise-primary-soft-hover)' },
			text: { base: 'var(--rise-primary-text)' },
		},
	},
	play: async ({ canvas }) => {
		const button = canvas.getByRole('button', { name: 'Тёмная тема' })
		await expect(button.style.getPropertyValue('--custom-bg')).toBe('var(--rise-primary-soft)')
	},
}
