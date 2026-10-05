import { expect, waitFor } from 'storybook/test'
import type meta from '../BaseCommentThread.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Collapsed: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: '«Скрыть ответы» сворачивает ветку, «Показать 3 ответа» — разворачивает; кнопка сообщает `aria-expanded`.',
			},
		},
	},
	play: async ({ canvas, userEvent }) => {
		const toggle = canvas.getAllByRole('button', { name: 'Скрыть ответы' })[0]
		await userEvent.click(toggle)
		await expect(toggle).toHaveAttribute('aria-expanded', 'false')
		await expect(toggle).toHaveTextContent('Показать 3 ответа')
		await waitFor(() => expect(canvas.queryByText('Добавила в ТЗ, пункт 4.2.')).not.toBeVisible())
	},
}
