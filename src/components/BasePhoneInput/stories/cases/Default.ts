import { expect, waitFor } from 'storybook/test'
import type meta from '../BasePhoneInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { PHONE_SOURCE, renderPhone } from '../shared'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Номер вводится по маске страны, в `v-model` — `+79161234567`. Вставьте «+375 29 123-45-67» — страна сменится на Беларусь.',
			},
			source: PHONE_SOURCE,
		},
	},
	render: renderPhone,
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByLabelText('Телефон')
		const country = canvas.getByRole('combobox', { name: 'Код страны' })
		await userEvent.tab()
		await expect(country).toHaveFocus()
		await userEvent.tab()
		await expect(field).toHaveFocus()
		await userEvent.type(field, '9161234567')
		await waitFor(() => expect(field).toHaveValue('(916) 123-45-67'))
		await userEvent.clear(field)
		await userEvent.paste('+375 29 123-45-67')
		await waitFor(() => expect(country).toHaveTextContent('Беларусь +375'))
		await waitFor(() => expect(field).toHaveValue('(29) 123-45-67'))
	},
}
