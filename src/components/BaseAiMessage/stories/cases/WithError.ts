import { expect } from 'storybook/test'
import type meta from '../BaseAiMessage.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const WithError: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Ответ не получен: сообщение и «Повторить» — событие `retry`.' } } },
	args: { content: '', error: 'Сервер не ответил за 30 секунд' },
	play: async ({ canvas, args, userEvent }) => {
		await expect(canvas.getByRole('alert')).toHaveTextContent('Сервер не ответил за 30 секунд')
		await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
		await expect(args.onRetry).toHaveBeenCalledOnce()
		await expect(canvas.queryByRole('button', { name: 'Копировать ответ' })).toBeNull()
	},
}
