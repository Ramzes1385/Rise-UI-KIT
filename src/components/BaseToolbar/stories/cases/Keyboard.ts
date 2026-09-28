import { expect } from 'storybook/test'
import { tabTo } from '@/stories/helpers'
import type meta from '../BaseToolbar.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Клавиатура: Tab — в панель, ←/→ по кнопкам с переходом через край, Home/End, Tab — из панели; фокус запоминается.',
			},
		},
	},
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent }) => {
		const bold = canvas.getByRole('button', { name: 'Полужирный' })
		await tabTo(bold, userEvent)
		await userEvent.keyboard('{ArrowLeft}')
		await expect(canvas.getByRole('button', { name: 'По правому краю' })).toHaveFocus()
		await userEvent.keyboard('{Home}{ArrowRight}')
		await expect(canvas.getByRole('button', { name: 'Курсив' })).toHaveFocus()
		await userEvent.keyboard('{End}')
		await expect(canvas.getByRole('button', { name: 'По правому краю' })).toHaveFocus()
		await expect(canvas.getByRole('button', { name: 'Полужирный' })).toHaveAttribute('tabindex', '-1')
	},
}
