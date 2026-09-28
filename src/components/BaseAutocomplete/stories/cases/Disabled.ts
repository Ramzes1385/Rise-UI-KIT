import { expect } from 'storybook/test'
import type meta from '../BaseAutocomplete.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Disabled: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Отключённое поле: не получает фокус, список не открывается.' } } },
	args: { isDisabled: true, modelValue: 'msk' },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('combobox', { name: 'Город доставки' })).toBeDisabled()
	},
}
