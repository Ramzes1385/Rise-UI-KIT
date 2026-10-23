import { expect } from 'storybook/test'
import { tabTo } from '@/stories/helpers'
import type meta from '../BaseToolbar.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Vertical: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Вертикальная панель: ↑/↓ ведут по кнопкам.' } } },
	args: { orientation: 'vertical' },
	play: async ({ canvas, userEvent }) => {
		const bold = canvas.getByRole('button', { name: 'Полужирный' })
		await tabTo(bold, userEvent)
		await userEvent.keyboard('{ArrowDown}')
		await expect(canvas.getByRole('button', { name: 'Курсив' })).toHaveFocus()
	},
}
