import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseAddressInput.stories'

export const Disabled: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Отключённое поле: адрес виден, подсказки не загружаются.' } } },
	args: { modelValue: 'г Казань, ул Баумана, д 44', isDisabled: true },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('combobox', { name: 'Адрес доставки' })).toBeDisabled()
	},
}
