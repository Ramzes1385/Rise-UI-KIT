import { expect } from 'storybook/test'
import type meta from '../BasePagination.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Кастомный цвет через `color`: `bg`/`text` c ключами `base` и `hover` красят стрелки и номера страниц,',
					'`active` — текущую страницу.',
				].join('\n'),
			},
		},
	},
	args: {
		modelValue: 4,
		color: {
			bg: { base: '#eff6ff', hover: '#dbeafe', active: '#1d4ed8' },
			text: { base: '#1e3a8a', active: '#ffffff' },
		},
	},
	play: async ({ canvas }) => {
		await expect(getComputedStyle(canvas.getByRole('button', { name: '4' })).backgroundColor).toBe('rgb(29, 78, 216)')
		await expect(getComputedStyle(canvas.getByRole('button', { name: '3' })).color).toBe('rgb(30, 58, 138)')
	},
}
