import { expect } from 'storybook/test'
import type meta from '../BaseSplitButton.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Loading: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Загрузка: основная кнопка занята, меню доступно.' } } },
	args: { isLoading: true },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('button', { name: /Сохранить/ })).toHaveAttribute('aria-busy', 'true')
		await expect(canvas.getByRole('button', { name: 'Другие действия' })).toBeEnabled()
	},
}
