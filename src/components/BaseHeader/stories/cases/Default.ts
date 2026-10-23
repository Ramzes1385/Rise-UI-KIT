import { expect } from 'storybook/test'
import type meta from '../BaseHeader.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Песочница: название-ссылка, навигация и кнопка входа.' } } },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('banner')).toBeVisible()
		await expect(canvas.getByRole('link', { name: 'Rise CRM' })).toHaveAttribute('href', '#home')
		await expect(canvas.getByRole('navigation', { name: 'Основное' })).toBeVisible()
	},
}
