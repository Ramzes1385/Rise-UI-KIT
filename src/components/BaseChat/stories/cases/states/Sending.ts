import { expect } from 'storybook/test'
import type meta from '../../BaseChat.stories'
import { STORY_TODAY } from '@/stories/helpers'
import type { StoryObj } from '@storybook/vue3-vite'
import { PRIVATE_MESSAGES, timeOf } from '../../shared'

export const Sending: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Ожидание в ленте: статус `sending` у своего сообщения (спиннер) и `isTyping` — «печатает» в шапке и точки в ленте.',
					'Оба индикатора — `role="status"` с доступным именем.',
				].join('\n'),
			},
		},
	},
	args: {
		messages: [
			...PRIVATE_MESSAGES.slice(0, 2),
			{ id: 'sending', sender: 'me', text: 'Отправляю обновлённые макеты…', status: 'sending', time: timeOf(STORY_TODAY) },
		],
		isTyping: true,
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('status', { name: 'Отправляется' })).toBeInTheDocument()
		await expect(canvas.getByRole('status', { name: 'Печатает' })).toBeInTheDocument()
		await expect(canvas.getByRole('img', { name: 'Прочитано' })).toBeInTheDocument()
	},
}
