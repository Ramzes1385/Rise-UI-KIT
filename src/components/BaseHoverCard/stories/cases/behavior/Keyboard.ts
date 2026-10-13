import { tabTo } from '@/stories/helpers'
import type meta from '../../BaseHoverCard.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor } from 'storybook/test'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Клавиатура: Tab ставит фокус на ссылку, и карточка открывается сразу, без задержки; Escape закрывает её,',
					'а фокус остаётся на ссылке. Триггер указывает на открытую карточку через `aria-describedby`.',
				].join('\n'),
			},
		},
	},
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('link', { name: '@anna.smirnova' })
		await expect(trigger).not.toHaveAttribute('aria-describedby')
		await tabTo(trigger, userEvent)
		const text = await screen.findByText(/дизайнер продукта/)
		await expect(trigger).toHaveAttribute('aria-describedby', text.closest('[id^="rise-hover-card"]')!.id)

		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByText(/дизайнер продукта/)).not.toBeInTheDocument())
		await expect(trigger).toHaveFocus()
	},
}
