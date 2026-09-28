import { expect } from 'storybook/test'
import type meta from '../BaseSwitch.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Кастомный цвет через `color`: `bg` — цвет трека включённого переключателя.' } } },
	args: {
		label: 'Автопродление подписки',
		modelValue: true,
		color: { bg: { base: '#15803d', hover: '#166534' } },
	},
	play: async ({ canvasElement }) => {
		const track = canvasElement.querySelector('.base-switch__slider') as HTMLElement
		await expect(getComputedStyle(track).backgroundColor).toBe('rgb(21, 128, 61)')
	},
}
