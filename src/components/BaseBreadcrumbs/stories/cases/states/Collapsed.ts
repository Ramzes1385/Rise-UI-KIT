import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseBreadcrumbs.stories'

export const Collapsed: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: '`maxItems` оставляет последние N крошек, остальные сворачиваются в «…»; клик по «…» раскрывает весь путь.',
			},
		},
	},
	args: { maxItems: 2 },
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.queryByRole('link', { name: 'Каталог' })).toBeNull()
		await userEvent.click(canvas.getByRole('button', { name: '…' }))
		await expect(canvas.getByRole('link', { name: 'Каталог' })).toBeVisible()
	},
}
