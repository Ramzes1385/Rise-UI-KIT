import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseAddressInput.stories'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Свой фон и текст поля через `color` — как у BaseInput.' } } },
	args: { modelValue: 'г Москва, ул Тверская, д 7', color: { bg: { base: '#fefce8' }, text: { base: '#713f12' } } },
	play: async ({ canvas }) => {
		const wrapper = canvas.getByRole('combobox', { name: 'Адрес доставки' }).closest('.base-input__wrapper') as HTMLElement
		await expect(getComputedStyle(wrapper).backgroundColor).toBe('rgb(254, 252, 232)')
	},
}
