import { expect } from 'storybook/test'
import type meta from '../../BaseCascader.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Disabled: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Отключённое поле: приглушено, не получает фокус и не открывается.' } } },
	args: { modelValue: ['msk-region', 'cao', 'arbat'], isDisabled: true },
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByRole('combobox', { name: 'Район доставки' })
		await expect(field).toHaveAttribute('aria-disabled', 'true')
		await expect(field).not.toHaveAttribute('tabindex')
		await userEvent.click(field)
		await expect(field).toHaveAttribute('aria-expanded', 'false')
	},
}
