import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseMegaMenu.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const HoverTrigger: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: '`trigger="hover"`: панели открываются при наведении и закрываются через `hoverDelay` после ухода курсора.',
			},
		},
	},
	args: { layout: 'dropdown', trigger: 'hover', hoverDelay: 100 },
	play: async ({ canvas, userEvent }) => {
		const products = canvas.getByRole('button', { name: 'Продукты' })
		await userEvent.hover(products)
		await expect(products).toHaveAttribute('aria-expanded', 'true')

		await userEvent.unhover(products)
		await waitFor(() => expect(products).toHaveAttribute('aria-expanded', 'false'))
	},
}
