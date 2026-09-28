import { expect } from 'storybook/test'
import type meta from '../BaseAlert.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Песочница: меняйте тип, вариант и тексты в панели Controls.' } } },
	play: async ({ canvas }) => {
		const alert = canvas.getByRole('status')
		await expect(alert).toHaveTextContent('Доступно обновление')
		await expect(alert).toHaveTextContent('Версия 2.4')
	},
}
