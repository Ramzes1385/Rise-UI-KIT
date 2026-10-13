import type meta from '../../BaseChat.stories'
import { DATE_MESSAGES } from '../../timeline'
import { STORY_TODAY } from '@/stories/helpers'
import { expect, within } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'

export const DateSeparators: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Разделители дат: у сообщений с `createdAt` (ISO-строка, миллисекунды или `Date`) между днями появляется разделитель',
					'`role="separator"` — «Сегодня», «Вчера», дата («12 мая») и дата с годом, если год не текущий. «Сегодня» отсчитывается',
					'от `today`; без него берётся реальная дата. Сообщения без `createdAt` разделителей не получают.',
				].join('\n'),
			},
		},
	},
	args: { messages: DATE_MESSAGES, today: STORY_TODAY.toISOString(), quickReplies: [] },
	play: async ({ canvas }) => {
		const log = canvas.getByRole('log', { name: 'Сообщения' })
		const labels = within(log)
			.getAllByRole('separator')
			.map(separator => separator.getAttribute('aria-label'))
		await expect(labels).toHaveLength(4)
		await expect(labels[0]).toMatch(/^15 мая 2024/)
		await expect(labels.slice(1)).toEqual(['12 мая', 'Вчера', 'Сегодня'])
		await expect(within(log).getByRole('separator', { name: 'Сегодня' })).toBeInTheDocument()
	},
}
