import { expect } from 'storybook/test'
import type meta from '../../BaseMoneyInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Свой фон и текст поля через `color` — как у BaseInput.' } },
	},
	args: { color: { bg: { base: '#f0fdf4' }, text: { base: '#14532d' } } },
	play: async ({ canvas }) => {
		const wrapper = canvas.getByLabelText('Сумма').closest('.base-input__wrapper') as HTMLElement
		await expect(getComputedStyle(wrapper).backgroundColor).toBe('rgb(240, 253, 244)')
	},
}
