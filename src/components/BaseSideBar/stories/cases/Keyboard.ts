import { tabTo } from '@/stories/helpers'
import type meta from '../BaseSideBar.stories'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Клавиатура: Tab проходит кнопку сворачивания и пункты (видно кольцо фокуса), Enter раскрывает группу «Настройки»;',
					'после сворачивания с клавиатуры фокус остаётся на кнопке.',
				].join('\n'),
			},
		},
	},
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent }) => {
		const settings = canvas.getByRole('button', { name: 'Настройки' })
		await tabTo(settings, userEvent)
		await expect(getComputedStyle(settings).outlineStyle).toBe('solid')
		await userEvent.keyboard('{Enter}')
		await expect(settings).toHaveAttribute('aria-expanded', 'true')
		await expect(canvas.getByRole('link', { name: 'Профиль' })).toBeVisible()

		const toggle = canvas.getByRole('button', { name: 'Свернуть' })
		await tabTo(toggle, userEvent, 30)
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(toggle).toHaveAccessibleName('Развернуть'))
		await expect(toggle).toHaveFocus()
	},
}
