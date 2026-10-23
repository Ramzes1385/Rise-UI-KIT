import { tabTo } from '@/stories/helpers'
import type meta from '../BaseAiMessage.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, fn, waitFor } from 'storybook/test'

export const Default: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Готовый ответ с блоком кода и кнопкой «Копировать ответ».' } } },
	play: async ({ canvas, args, userEvent }) => {
		const message = canvas.getByRole('article', { name: 'Ассистент' })
		await expect(message).not.toHaveAttribute('aria-busy')
		await expect(canvas.getByText('12:04')).toBeVisible()
		const writeText = fn(async (_text: string) => undefined)
		Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
		await tabTo(canvas.getByRole('button', { name: 'Копировать ответ' }), userEvent)
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(args.onCopy).toHaveBeenCalledWith(args.content))
		await expect(canvas.getByRole('button', { name: 'Скопировано' })).toBeVisible()
	},
}
