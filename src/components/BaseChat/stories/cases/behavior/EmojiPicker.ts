import type meta from '../../BaseChat.stories'
import BaseChat from '../../../ui/BaseChat.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { PRIVATE_CHAT, PRIVATE_MESSAGES } from '../../shared'
import { storySource, useStorySetup } from '@/stories/helpers'
import { expect, screen, waitFor, within } from 'storybook/test'

const template = `
	<div class="story-medium">
		<BaseChat v-bind="args" />
	</div>
`

export const EmojiPicker: StoryObj<typeof meta> = {
	args: { ...PRIVATE_CHAT, messages: PRIVATE_MESSAGES, quickReplies: [] },
	parameters: {
		docs: {
			description: {
				story: [
					'Эмодзи в поле ввода — BaseEmojiPicker в поповере над кнопкой со смайликом: поиск по названиям, разделы, недавние.',
					'Эмодзи встаёт в позицию курсора (выделенный текст заменяется), панель закрывается, фокус возвращается в поле.',
					'При открытии фокус в поиске: Enter выбирает первый найденный, стрелка вниз ведёт в сетку; Escape закрывает панель',
					'и возвращает фокус на кнопку.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseChat'] }),
		},
	},
	render: args => ({
		components: { BaseChat },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByRole('textbox', { name: 'Сообщение' })
		await userEvent.type(field, 'Отличная работа ')
		const trigger = canvas.getByRole('button', { name: 'Открыть выбор эмодзи' })
		await userEvent.click(trigger)
		const dialog = await screen.findByRole('dialog', { name: 'Эмодзи' })
		const search = within(dialog).getByRole('searchbox', { name: 'Поиск эмодзи' })
		await waitFor(() => expect(search).toHaveFocus())
		await within(dialog).findByRole('button', { name: 'огонь' })
		await userEvent.keyboard('огонь{Enter}')
		await waitFor(() => expect(field).toHaveFocus())
		await expect(field).toHaveValue('Отличная работа 🔥')

		await userEvent.click(trigger)
		await expect(await screen.findByRole('group', { name: 'Недавние' })).toBeInTheDocument()
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Эмодзи' })).not.toBeInTheDocument())
		await expect(trigger).toHaveFocus()
	},
}
