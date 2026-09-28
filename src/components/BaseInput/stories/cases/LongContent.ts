import { expect } from 'storybook/test'
import type meta from '../BaseInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const LongContent: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Длинное значение прокручивается внутри поля и не растягивает его.' } } },
	args: {
		label: 'Адрес',
		type: 'text',
		placeholder: '',
		modelValue: 'Россия, Москва, улица Большая Никитская, дом 24/1, строение 5, подъезд 2, офис 318',
	},
	play: async ({ canvas }) => {
		const field = canvas.getByLabelText('Адрес')
		await expect(field.scrollWidth).toBeGreaterThan(field.clientWidth)
	},
}
