import { expect } from 'storybook/test'
import type meta from '../BaseAvatar.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Кастомный цвет через `color`: `bg` — фон, `text` — цвет инициалов. Например, цвет команды или проекта.',
			},
		},
	},
	args: {
		name: 'Мария Кузнецова',
		color: { bg: { base: '#ede9fe' }, text: { base: '#5b21b6' } },
	},
	play: async ({ canvas }) => {
		const initials = canvas.getByText('МК')
		await expect(getComputedStyle(initials).color).toBe('rgb(91, 33, 182)')
		const content = initials.closest('.base-avatar__content') as HTMLElement
		await expect(getComputedStyle(content).backgroundColor).toBe('rgb(237, 233, 254)')
	},
}
