import { expect } from 'storybook/test'
import type meta from '../../BasePhoneInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Disabled: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Отключённое поле: номер и страна не меняются.' } } },
	args: { modelValue: '+77012345678', country: 'KZ', isDisabled: true },
	play: async ({ canvas }) => {
		await expect(canvas.getByLabelText('Телефон')).toBeDisabled()
		await expect(canvas.getByRole('combobox', { name: 'Код страны' })).toBeDisabled()
		await expect(canvas.getByRole('combobox', { name: 'Код страны' })).toHaveValue('KZ')
	},
}
