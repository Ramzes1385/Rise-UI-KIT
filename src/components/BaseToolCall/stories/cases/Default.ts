import type meta from '../BaseToolCall.stories'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import { STORY_WAIT_TIMEOUT, tabTo } from '@/stories/helpers'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Выполненный вызов. Enter или Space раскрывает параметры и результат.' } },
	},
	play: async ({ canvas, userEvent, args }) => {
		const trigger = canvas.getByRole('button', { name: /Поиск по документации/ })
		await expect(trigger).toHaveAccessibleName('Поиск по документации search_docs Готово')
		await tabTo(trigger, userEvent)
		await userEvent.keyboard('{Enter}')
		await expect(trigger).toHaveAttribute('aria-expanded', 'true')
		await expect(args['onUpdate:isOpen']).toHaveBeenLastCalledWith(true)
		await waitFor(() => expect(canvas.getByText(/"query": "тёмная тема"/)).toBeVisible(), { timeout: STORY_WAIT_TIMEOUT })
		await userEvent.keyboard(' ')
		await expect(trigger).toHaveAttribute('aria-expanded', 'false')
	},
}
