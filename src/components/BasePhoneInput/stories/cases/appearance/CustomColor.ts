import { expect } from 'storybook/test'
import type meta from '../../BasePhoneInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Свой фон и текст поля через `color` — как у BaseInput.' } },
	},
	args: { modelValue: '+79161234567', color: { bg: { base: '#fff7ed' }, text: { base: '#7c2d12' } } },
	play: async ({ canvas }) => {
		const wrapper = canvas.getByLabelText('Телефон').closest('.base-input__wrapper') as HTMLElement
		await expect(getComputedStyle(wrapper).backgroundColor).toBe('rgb(255, 247, 237)')
	},
}
