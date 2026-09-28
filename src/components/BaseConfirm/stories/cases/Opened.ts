import type meta from '../BaseConfirm.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { screen, expect, waitFor, within } from 'storybook/test'

export const Opened: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Открытое окно: вопрос в заголовке, последствия под ним, фокус на кнопке подтверждения.' } },
	},
	tags: ['!autodocs'],
	args: { isOpen: true },
	play: async () => {
		const dialog = await screen.findByRole('alertdialog', { name: 'Опубликовать серию?' })
		await expect(dialog).toHaveAccessibleDescription('Серия 3 станет доступна подписчикам сообщества, они получат уведомление.')
		await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Опубликовать' })).toHaveFocus())
	},
}
