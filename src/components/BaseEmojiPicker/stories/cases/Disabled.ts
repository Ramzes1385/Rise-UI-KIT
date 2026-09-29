import { REACTIONS } from '../shared'
import { expect } from 'storybook/test'
import type meta from '../BaseEmojiPicker.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Disabled: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Отключённый пикер: поиск и эмодзи не получают фокус и не выбираются.' } } },
	args: { emojis: REACTIONS, isDisabled: true },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('searchbox', { name: 'Поиск эмодзи' })).toBeDisabled()
		await expect(canvas.getByRole('button', { name: 'огонь' })).toBeDisabled()
	},
}
