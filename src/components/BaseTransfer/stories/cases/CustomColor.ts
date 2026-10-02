import { expect } from 'storybook/test'
import type meta from '../BaseTransfer.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Кастомный цвет через `color`: фон и текст панелей. Для статусов берите токены ролей: `var(--rise-success-soft)`.',
			},
		},
	},
	args: { color: { bg: { base: '#6d28d9' }, text: { base: '#ffffff' } } },
	play: async ({ canvasElement }) => {
		const panel = canvasElement.querySelector('.base-transfer__panel') as HTMLElement
		await expect(getComputedStyle(panel).backgroundColor).toBe('rgb(109, 40, 217)')
	},
}
