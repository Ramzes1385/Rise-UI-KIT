import { expect } from 'storybook/test'
import type meta from '../BaseCheckbox.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Кастомный цвет через `color`: `bg` — заливка отмеченного квадрата, `text` — цвет галочки.' } },
	},
	args: {
		label: 'Оплатить бонусами',
		modelValue: true,
		color: { bg: { base: '#6d28d9', hover: '#5b21b6' }, text: { base: '#ffffff' } },
	},
	play: async ({ canvasElement }) => {
		const box = canvasElement.querySelector('.base-checkbox__box') as HTMLElement
		await expect(getComputedStyle(box).backgroundColor).toBe('rgb(109, 40, 217)')
	},
}
