import type meta from '../BaseHoverCard.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor } from 'storybook/test'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Песочница: наведите курсор на ссылку, и через 300 мс откроется карточка; при уходе курсора она закроется через 150 мс. Меняйте `position`, `variant`, задержки и `animation` в Controls.',
			},
		},
	},
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('link', { name: '@anna.smirnova' })
		await userEvent.hover(trigger)
		const text = await screen.findByText(/дизайнер продукта/)
		await expect(trigger).toHaveAttribute('aria-describedby', text.closest('[id^="rise-hover-card"]')!.id)

		await userEvent.unhover(trigger)
		await waitFor(() => expect(screen.queryByText(/дизайнер продукта/)).not.toBeInTheDocument())
	},
}
