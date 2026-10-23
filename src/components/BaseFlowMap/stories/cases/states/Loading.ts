import { expect } from 'storybook/test'
import type meta from '../../BaseFlowMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Loading: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Загрузка: скелетон на месте холста, `aria-busy` у области и подпись «Загрузка карты…» для скринридера.',
			},
		},
	},
	args: { isLoading: true },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('region', { name: 'Оформление заказа' })).toHaveAttribute('aria-busy', 'true')
		await expect(canvas.getByRole('status', { name: 'Загрузка карты…' })).toBeVisible()
		await expect(canvas.queryByRole('graphics-document')).toBeNull()
	},
}
