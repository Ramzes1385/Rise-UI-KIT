import { expect } from 'storybook/test'
import type meta from '../../BasePhoneInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { PHONE_SOURCE, renderPhone } from '../../shared'

export const Disabled: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Отключённое поле: номер и страна не меняются.' }, source: PHONE_SOURCE } },
	args: { modelValue: '+77012345678', country: 'KZ', isDisabled: true },
	render: renderPhone,
	play: async ({ canvas, userEvent }) => {
		const country = canvas.getByRole('combobox', { name: 'Код страны' })
		await expect(canvas.getByLabelText('Телефон')).toBeDisabled()
		await expect(country).toHaveAttribute('aria-disabled', 'true')
		await expect(country).toHaveTextContent('Казахстан +7')
		await userEvent.click(country)
		await expect(country).toHaveAttribute('aria-expanded', 'false')
	},
}
