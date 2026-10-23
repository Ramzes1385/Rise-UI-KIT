import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseDadataInput.stories'

export const Disabled: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Отключённое поле: значение видно, подсказки не загружаются.' } } },
	args: { modelValue: 'АО "ТБАНК"', isDisabled: true },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('combobox', { name: 'Организация' })).toBeDisabled()
	},
}
