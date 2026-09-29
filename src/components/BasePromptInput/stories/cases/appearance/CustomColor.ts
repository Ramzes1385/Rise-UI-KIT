import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BasePromptInput.stories'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Кастомный цвет через `color`. Для статусов берите токены ролей: `var(--rise-success-soft)`.' } },
	},
	args: { modelValue: 'Цвет поля задан через color', color: { bg: { base: '#6d28d9' }, text: { base: '#ffffff' } } },
	play: async ({ canvasElement }) => {
		const box = canvasElement.querySelector('.base-prompt-input__box') as HTMLElement
		await expect(getComputedStyle(box).backgroundColor).toBe('rgb(109, 40, 217)')
		await expect(getComputedStyle(canvasElement.querySelector('textarea') as HTMLElement).color).toBe('rgb(255, 255, 255)')
	},
}
