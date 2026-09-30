import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../BaseNotificationCenter.stories'

export const Empty: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Пусто: «Уведомлений нет», кнопка «Прочитать все» недоступна.' } } },
	args: { items: [] },
	play: async ({ canvas }) => {
		await expect(canvas.getByText('Уведомлений нет')).toBeVisible()
		await expect(canvas.getByRole('button', { name: 'Прочитать все' })).toBeDisabled()
	},
}
