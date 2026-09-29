import { expect } from 'storybook/test'
import type meta from '../BaseKanban.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Disabled: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Только просмотр: карточки не перетаскиваются и не открываются.' } } },
	args: { isDisabled: true },
	play: async ({ canvas, userEvent, args }) => {
		const card = canvas.getByRole('button', { name: 'Тёмная тема для таблиц' })
		await expect(card).toHaveAttribute('aria-disabled', 'true')
		card.focus()
		await userEvent.keyboard(' ')
		await expect(card).not.toHaveAttribute('aria-pressed')
		await userEvent.keyboard('{Enter}')
		await expect(args.onOpen).not.toHaveBeenCalled()
	},
}
