import { expect } from 'storybook/test'
import type meta from '../../BaseTreeSelect.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Disabled: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Отключённое поле: приглушено, не получает фокус и не открывается.' } } },
	args: { modelValue: 'kazan', isDisabled: true },
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('combobox', { name: 'Город доставки' })
		await expect(trigger).toHaveAttribute('aria-disabled', 'true')
		await expect(trigger).not.toHaveAttribute('tabindex')
		await userEvent.click(trigger)
		await expect(trigger).toHaveAttribute('aria-expanded', 'false')
	},
}
