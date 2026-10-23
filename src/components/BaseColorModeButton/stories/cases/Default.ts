import { tabTo } from '@/stories/helpers'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../BaseColorModeButton.stories'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Песочница: кнопка переключает тему рамки. Tab ставит на неё фокус, Enter и Space переключают.' } },
	},
	play: async ({ canvas, canvasElement, userEvent, args }) => {
		const button = canvas.getByRole('button', { name: 'Тёмная тема' })
		const frame = canvasElement.querySelector('.story-frame') as HTMLElement
		await expect(button).toHaveAttribute('aria-pressed', 'false')

		await tabTo(button, userEvent)
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(frame).toHaveAttribute('data-theme', 'dark'))
		await expect(button).toHaveAttribute('aria-pressed', 'true')
		await expect(args.onChange).toHaveBeenCalledWith('dark')

		await userEvent.keyboard(' ')
		await waitFor(() => expect(frame).toHaveAttribute('data-theme', 'light'))
		await expect(args.onChange).toHaveBeenLastCalledWith('light')
	},
}
