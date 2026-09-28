import type meta from '../BaseChat.stories'
import { waitFor, expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'

export const Search: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Поиск: кнопка с лупой открывает поле (фокус сразу в нём), лента фильтруется, совпадения подсвечены. Escape закрывает',
					'поиск: запрос сбрасывается, лента снова полная, фокус возвращается на кнопку поиска.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, userEvent }) => {
		const log = canvas.getByRole('log', { name: 'Сообщения' })
		const total = log.querySelectorAll('.base-chat-message-list__item').length

		await userEvent.click(canvas.getByRole('button', { name: 'Поиск по сообщениям' }))
		const search = canvas.getByRole('searchbox', { name: 'Поиск по сообщениям' })
		await waitFor(() => expect(search).toHaveFocus())
		await userEvent.keyboard('отступ')
		await waitFor(() => expect(log.querySelectorAll('.base-chat-message-list__item')).toHaveLength(2))
		await expect(log.querySelectorAll('mark')).toHaveLength(2)

		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(canvas.getByRole('button', { name: 'Поиск по сообщениям' })).toHaveFocus())
		await expect(log.querySelectorAll('.base-chat-message-list__item')).toHaveLength(total)
	},
}
