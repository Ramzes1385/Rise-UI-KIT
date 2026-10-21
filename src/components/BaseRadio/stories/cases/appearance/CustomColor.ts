import { expect } from 'storybook/test'
import type meta from '../../BaseRadio.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Кастомный цвет через `color`: `bg` — цвет кольца выбранного круга, `text` — цвет точки.' } },
	},
	args: {
		label: 'Тариф',
		name: 'plan',
		modelValue: 'pro',
		options: [
			{ value: 'basic', label: 'Базовый' },
			{ value: 'pro', label: 'Профессиональный' },
			{ value: 'team', label: 'Командный' },
		],
		color: { bg: { base: '#0f766e', hover: '#115e59' }, text: { base: '#ffffff' } },
	},
	argTypes: { modelValue: { control: 'inline-radio', options: ['basic', 'pro', 'team'] } },
	play: async ({ canvas }) => {
		const circle = canvas.getByRole('radio', { name: 'Профессиональный' }).nextElementSibling as HTMLElement
		await expect(getComputedStyle(circle).borderTopColor).toBe('rgb(15, 118, 110)')
	},
}
