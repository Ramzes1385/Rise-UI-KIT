import { MESSAGES } from '../shared'
import { expect } from 'storybook/test'
import type meta from '../BaseResult.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Песочница: меняйте статус, вариант, тексты и тег заголовка в панели Controls.' } } },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('heading', { level: 2, name: MESSAGES.success.title })).toBeVisible()
		await expect(canvas.getByText(MESSAGES.success.description)).toBeVisible()
	},
}
