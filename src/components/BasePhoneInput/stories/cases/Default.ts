import { useModelArg } from '@/stories/helpers'
import { expect, waitFor } from 'storybook/test'
import type meta from '../BasePhoneInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BasePhoneInput from '../../ui/BasePhoneInput.vue'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Номер вводится по маске страны, в `v-model` — `+79161234567`. Вставьте «+375 29 123-45-67» — страна сменится на Беларусь.',
			},
		},
	},
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BasePhoneInput },
			setup: () => ({ args, onUpdate }),
			template: '<div style="max-width: 360px"><BasePhoneInput v-bind="args" @update:model-value="onUpdate" /></div>',
		}
	},
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
		await waitFor(() => expect(country).toHaveValue('BY'))
		await expect(field).toHaveValue('(29) 123-45-67')
	},
}
