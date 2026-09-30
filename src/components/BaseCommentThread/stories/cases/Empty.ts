import { expect } from 'storybook/test'
import type meta from '../BaseCommentThread.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Empty: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Пустая ветка: «Комментариев пока нет» и поле нового комментария.' } } },
	args: { comments: [] },
	play: async ({ canvas }) => {
		await expect(canvas.getByText('Комментариев пока нет')).toBeVisible()
		await expect(canvas.getByRole('button', { name: 'Отправить' })).toBeDisabled()
	},
}
