import type meta from '../BaseChat.stories'
import { expect, within } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import { PRIVATE_MESSAGES, ANNA, sentAt } from '../shared'

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Длинное содержимое: название обрезается многоточием, переносы строк в тексте сохраняются, длинные ссылки и слова',
					'переносятся и не растягивают ленту, лента прокручивается к последнему сообщению.',
				].join('\n'),
			},
		},
	},
	args: {
		title: 'Отдел проектирования интерфейсов и развития дизайн-системы компании',
		subtitle: 'Анна Смирнова, Иван Петров, Мария Кузнецова, Олег Соколов и ещё 12 участников',
		messages: [
			...PRIVATE_MESSAGES,
			{
				id: 'long-1',
				sender: 'other',
				senderName: ANNA.name,
				senderAvatar: ANNA.avatar,
				text: 'План на неделю:\n1. Проверить все компоненты в тёмной теме.\n2. Обновить скриншоты.\n3. Подготовить заметки к релизу.',
				...sentAt(9, 40),
			},
			{
				id: 'long-2',
				sender: 'me',
				text: 'Ссылка на сборку: https://rise-ui.dev/builds/2025-05-15/release-candidate-1.4.0-rc.3/storybook/index.html?path=/docs/chat-basechat--docs',
				status: 'sent',
				...sentAt(9, 42),
			},
		],
	},
	play: async ({ canvas }) => {
		const title = canvas.getByText('Отдел проектирования интерфейсов и развития дизайн-системы компании')
		await expect(title.scrollWidth).toBeGreaterThan(title.clientWidth)
		const log = canvas.getByRole('log', { name: 'Сообщения' })
		await expect(log.scrollHeight).toBeGreaterThan(log.clientHeight)
		await expect(log.scrollWidth).toBeLessThanOrEqual(log.clientWidth)
		const plan = within(log).getByText(/План на неделю/)
		await expect(getComputedStyle(plan).whiteSpace).toBe('pre-wrap')
	},
}
