import type meta from '../../BaseMegaMenu.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent as pointer, waitFor } from 'storybook/test'

export const ClickTrigger: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'`trigger="click"`: панель открывается и закрывается только кликом (и клавишами); наведение её не трогает.',
					'Клик вне меню, уход фокуса и Escape закрывают панель.',
				].join('\n'),
			},
		},
	},
	args: { trigger: 'click', openKey: undefined },
	play: async ({ canvas, canvasElement, userEvent }) => {
		const products = canvas.getByRole('button', { name: 'Продукты' })
		await userEvent.click(products)
		await expect(products).toHaveAttribute('aria-expanded', 'true')
		await userEvent.hover(canvas.getByRole('button', { name: 'Ресурсы' }))
		await expect(products).toHaveAttribute('aria-expanded', 'true')
		await pointer.click(canvasElement.ownerDocument.body)
		await waitFor(() => expect(products).toHaveAttribute('aria-expanded', 'false'))
	},
}
