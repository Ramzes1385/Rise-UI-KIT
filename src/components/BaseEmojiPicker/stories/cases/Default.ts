import { expect, waitFor } from 'storybook/test'
import type meta from '../BaseEmojiPicker.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { STORY_WAIT_TIMEOUT } from '@/stories/helpers'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Встроенный набор на языке кита. Найдите эмодзи, стрелкой вниз перейдите в сетку, Enter — выбор.' },
		},
	},
	play: async ({ canvas, canvasElement, userEvent, args }) => {
		await waitFor(() => expect(canvasElement.querySelector('button[aria-label="широко улыбается"]')).not.toBeNull(), {
			timeout: STORY_WAIT_TIMEOUT,
		})
		const search = canvas.getByPlaceholderText('Поиск эмодзи')
		await userEvent.tab()
		await expect(search).toHaveFocus()
		await userEvent.type(search, 'кошка')
		await userEvent.keyboard('{ArrowDown}')
		const first = canvasElement.querySelector('.base-emoji-picker__emoji') as HTMLElement
		await expect(first).toHaveFocus()
		await userEvent.keyboard('{Enter}')
		await expect(args.onSelect).toHaveBeenCalledWith(expect.objectContaining({ emoji: first.textContent?.trim() }))
	},
}
