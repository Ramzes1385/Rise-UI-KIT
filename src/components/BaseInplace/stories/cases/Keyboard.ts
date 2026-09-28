import { tabTo } from '@/stories/helpers'
import type meta from '../BaseInplace.stories'
import { waitFor, expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Клавиатура: Enter открывает поле, Escape отменяет правку и возвращает фокус на кнопку.' } },
	},
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent, args }) => {
		const display = canvas.getByRole('button', { name: /Название проекта/ })
		await tabTo(display, userEvent)
		await userEvent.keyboard('{Enter}')
		const field = canvas.getByRole('textbox', { name: 'Название проекта' })
		await waitFor(() => expect(field).toHaveFocus())
		await userEvent.keyboard('Черновик{Escape}')
		await expect(args.onCancel).toHaveBeenCalled()
		await waitFor(() => expect(canvas.getByRole('button', { name: /Название проекта: Редизайн/ })).toHaveFocus())
	},
}
