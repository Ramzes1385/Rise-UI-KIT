import { expect } from 'storybook/test'
import type meta from '../BaseSelect.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Disabled: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Отключённый селект: приглушён, не получает фокус и не открывается.' } } },
	args: { modelValue: 'msk', isDisabled: true },
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('combobox', { name: 'Город доставки' })
		await expect(trigger).toHaveAttribute('aria-disabled', 'true')
		await expect(trigger).not.toHaveAttribute('tabindex')
		await userEvent.click(trigger)
		await expect(trigger).toHaveAttribute('aria-expanded', 'false')
	},
}
