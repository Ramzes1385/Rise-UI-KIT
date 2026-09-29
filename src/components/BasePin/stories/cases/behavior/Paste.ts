import type meta from '../../BasePin.stories'
import { waitFor, expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'

export const Paste: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Вставка кода из буфера (здесь `length` = 6): все ячейки заполняются сразу и приходит `complete`.' },
		},
	},
	args: { length: 6 },
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('textbox', { name: 'Символ 1 из 6' }))
		await userEvent.paste('482 913')
		await waitFor(() => expect(args.onComplete).toHaveBeenCalledWith('482913'))
		await expect(canvas.getByRole('textbox', { name: 'Символ 6 из 6' })).toHaveValue('3')
	},
}
