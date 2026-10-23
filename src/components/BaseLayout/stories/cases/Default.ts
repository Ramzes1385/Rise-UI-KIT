import { expect } from 'storybook/test'
import type meta from '../BaseLayout.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Каркас приложения: прокрутите страницу — шапка и меню остаются на месте.' } } },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('banner')).toBeVisible()
		await expect(canvas.getByRole('main')).toContainElement(canvas.getByRole('heading', { name: 'Заказы' }))
		await expect(canvas.getByRole('contentinfo')).toBeVisible()
		await expect(getComputedStyle(canvas.getByRole('banner').parentElement as HTMLElement).position).toBe('sticky')
	},
}
