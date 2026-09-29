import type meta from '../BaseReasoning.stories'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import { STORY_WAIT_TIMEOUT, tabTo } from '@/stories/helpers'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Готовые рассуждения свёрнуты: «Думал 12 с». Enter или Space раскрывает и сворачивает.' } },
	},
	play: async ({ canvas, userEvent, args }) => {
		const trigger = canvas.getByRole('button', { name: 'Думал 12 с' })
		await expect(trigger).toHaveAttribute('aria-expanded', 'false')
		await tabTo(trigger, userEvent)
		await userEvent.keyboard('{Enter}')
		await expect(trigger).toHaveAttribute('aria-expanded', 'true')
		await expect(args['onUpdate:isOpen']).toHaveBeenLastCalledWith(true)
		await waitFor(() => expect(canvas.getByText(/Пользователь спрашивает/)).toBeVisible(), { timeout: STORY_WAIT_TIMEOUT })
		await userEvent.keyboard(' ')
		await expect(trigger).toHaveAttribute('aria-expanded', 'false')
	},
}
