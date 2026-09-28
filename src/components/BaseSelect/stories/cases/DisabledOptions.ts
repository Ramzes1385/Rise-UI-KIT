import { docsFrame } from '../shared'
import type meta from '../BaseSelect.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { screen, expect, waitFor } from 'storybook/test'

export const DisabledOptions: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			...docsFrame(300),
			description: { story: 'Недоступные опции (`isDisabled` у опции): приглушены, не выбираются кликом и пропускаются стрелками.' },
		},
	},
	play: async ({ canvas, userEvent, args }) => {
		const trigger = canvas.getByRole('combobox', { name: 'Город доставки' })
		await userEvent.click(trigger)
		const disabled = await screen.findByRole('option', { name: 'Екатеринбург' })
		await expect(disabled).toHaveAttribute('aria-disabled', 'true')
		await userEvent.click(disabled)
		await expect(args.onChange).not.toHaveBeenCalled()
		await expect(trigger).toHaveTextContent('Выберите город')
		await waitFor(() => expect(disabled).toBeVisible())
	},
}
