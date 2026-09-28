import type meta from '../BasePin.stories'
import { waitFor, expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Песочница: введите код — фокус переходит по ячейкам, после последней приходит `complete`.' } },
	},
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('textbox', { name: 'Символ 1 из 4' }))
		await userEvent.keyboard('4829')
		await waitFor(() => expect(args.onComplete).toHaveBeenCalledWith('4829'))
		await expect(canvas.getByRole('textbox', { name: 'Символ 4 из 4' })).toHaveValue('9')
	},
}
