import { expect } from 'storybook/test'
import type meta from '../BaseAccordion.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Песочница: первый пункт открыт (`defaultOpen`), клик по заголовку раскрывает пункт и закрывает предыдущий.',
					'Story открывают e2e-тесты, поэтому play только проверяет начальное состояние.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas }) => {
		const first = canvas.getByRole('button', { name: 'Как оформить заказ?' })
		await expect(first).toHaveAttribute('aria-expanded', 'true')
		await expect(canvas.getByRole('region', { name: 'Как оформить заказ?' })).toHaveTextContent('Добавьте товары в корзину')
		await expect(canvas.getByRole('button', { name: 'Сколько стоит доставка?' })).toHaveAttribute('aria-expanded', 'false')
	},
}
