import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseCommentThread.stories'

export const Readonly: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Только чтение (`isReadonly`): без поля нового комментария и кнопок «Ответить».' } } },
	args: { isReadonly: true },
	play: async ({ canvas }) => {
		await expect(canvas.queryByRole('button', { name: 'Ответить' })).toBeNull()
		await expect(canvas.queryByRole('textbox')).toBeNull()
	},
}
