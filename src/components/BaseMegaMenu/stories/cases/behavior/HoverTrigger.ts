import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseMegaMenu.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const HoverTrigger: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'`trigger="hover"`: наведение открывает панель через `openDelay`, переход на соседний раздел переключает её сразу,',
					'уход курсора из строки и панели закрывает через `closeDelay`. Клик по разделу закрепляет панель.',
				].join('\n'),
			},
		},
	},
	args: { trigger: 'hover', openKey: undefined, openDelay: 100, closeDelay: 200 },
	play: async ({ canvas, userEvent }) => {
		const products = canvas.getByRole('button', { name: 'Продукты' })
		const resources = canvas.getByRole('button', { name: 'Ресурсы' })
		await userEvent.hover(products)
		await waitFor(() => expect(products).toHaveAttribute('aria-expanded', 'true'))
		await userEvent.hover(resources)
		await expect(resources).toHaveAttribute('aria-expanded', 'true')
		await userEvent.unhover(resources)
		await waitFor(() => expect(resources).toHaveAttribute('aria-expanded', 'false'))
	},
}
