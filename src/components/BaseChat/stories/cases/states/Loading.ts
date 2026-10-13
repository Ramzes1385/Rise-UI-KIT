import { expect } from 'storybook/test'
import type meta from '../../BaseChat.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Loading: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Первая загрузка ленты (`isLoading`): вместо сообщений — скелетон с `role="status"` и именем «Загрузка сообщений».',
					'Подгрузка более ранних сообщений (`isLoadingMore`) показывает индикатор вверху ленты — см. историю Load More.',
					'Ожидание отправки и набор текста собеседником — история Sending.',
				].join('\n'),
			},
		},
	},
	args: { isLoading: true, quickReplies: [] },
	play: async ({ canvas }) => {
		const log = canvas.getByRole('log', { name: 'Сообщения' })
		await expect(canvas.getByRole('status', { name: 'Загрузка сообщений' })).toBeInTheDocument()
		await expect(log.querySelectorAll('.base-chat-message-list__item')).toHaveLength(0)
		await expect(canvas.queryByText('Сообщений пока нет')).not.toBeInTheDocument()
	},
}
