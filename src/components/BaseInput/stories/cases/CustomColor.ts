import { expect } from 'storybook/test'
import type meta from '../BaseInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Кастомный цвет фона и текста поля через `color` — например, для поля на брендовом фоне.' } },
	},
	args: {
		label: 'Промокод',
		modelValue: 'SPRING-2025',
		type: 'text',
		placeholder: '',
		color: { bg: { base: '#fff7ed' }, text: { base: '#7c2d12' } },
	},
	play: async ({ canvas }) => {
		const wrapper = canvas.getByLabelText('Промокод').closest('.base-input__wrapper') as HTMLElement
		await expect(getComputedStyle(wrapper).backgroundColor).toBe('rgb(255, 247, 237)')
	},
}
