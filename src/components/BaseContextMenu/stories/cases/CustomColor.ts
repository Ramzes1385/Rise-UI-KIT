import { docsFrame } from '@/stories/helpers'
import { screen, expect } from 'storybook/test'
import type meta from '../BaseContextMenu.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomColor: StoryObj<typeof meta> = {
	args: { color: { bg: { base: 'var(--rise-primary-soft)', hover: 'var(--rise-bg)' }, text: { base: 'var(--rise-primary-text)' } } },
	parameters: {
		docs: { ...docsFrame(300), description: { story: 'Кастомный цвет через `color`: фон панели, фон пункта с фокусом и текст.' } },
	},
	play: async ({ canvas, userEvent }) => {
		await userEvent.pointer({ keys: '[MouseRight]', target: canvas.getByText('Серия 3 · «Туман над заливом»') })
		const menu = await screen.findByRole('menu')
		await expect((menu.closest('.base-dropdown__panel') as HTMLElement).style.getPropertyValue('--custom-bg')).toBe(
			'var(--rise-primary-soft)',
		)
	},
}
