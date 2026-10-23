import { docsFrame } from '@/stories/helpers'
import { screen, expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseDropdownMenu.stories'

export const CustomColor: StoryObj<typeof meta> = {
	args: { color: { bg: { base: 'var(--rise-primary-soft)', hover: 'var(--rise-bg)' }, text: { base: 'var(--rise-primary-text)' } } },
	parameters: {
		docs: { ...docsFrame(320), description: { story: 'Кастомный цвет через `color`: фон панели, фон пункта с фокусом и текст.' } },
	},
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Действия' }))
		const menu = await screen.findByRole('menu')
		const panel = menu.closest('.base-dropdown__panel') as HTMLElement
		await expect(panel.style.getPropertyValue('--custom-bg')).toBe('var(--rise-primary-soft)')
	},
}
