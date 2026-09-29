import { REACTIONS } from '../shared'
import { expect } from 'storybook/test'
import type meta from '../BaseEmojiPicker.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomSet: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Свой набор `emojis` — например, реакции на сообщение: без поиска и предпросмотра, в одну строку.' },
		},
	},
	args: { emojis: REACTIONS, hasSearch: false, hasPreview: false, columns: 8 },
	play: async ({ canvas, args, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'огонь' }))
		await expect(args.onSelect).toHaveBeenCalledWith(REACTIONS[6])
	},
}
