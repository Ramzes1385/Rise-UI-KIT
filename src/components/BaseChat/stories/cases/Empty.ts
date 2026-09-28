import type meta from '../BaseChat.stories'
import { expect, within } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'

export const Empty: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Пустая лента: подсказка по центру, поле ввода готово к первому сообщению.' } } },
	args: { messages: [], quickReplies: [] },
	play: async ({ canvas }) => {
		const log = canvas.getByRole('log', { name: 'Сообщения' })
		await expect(within(log).getByText('Сообщений пока нет')).toBeInTheDocument()
		await expect(canvas.getByRole('button', { name: 'Отправить сообщение' })).toBeDisabled()
	},
}
