import { expect } from 'storybook/test'
import type meta from '../../BaseCode.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Empty: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Пустой код: сообщение «Кода нет», кнопки «Копировать» нет.' } } },
	args: { code: '' },
	play: async ({ canvas }) => {
		await expect(canvas.getByText('Кода нет')).toBeVisible()
		await expect(canvas.queryByRole('button', { name: 'Копировать' })).toBeNull()
	},
}
