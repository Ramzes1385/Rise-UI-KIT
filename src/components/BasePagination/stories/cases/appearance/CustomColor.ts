import { expect, waitFor } from 'storybook/test'
import type meta from '../../BasePagination.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Кастомный цвет через `color`: `bg`/`text` c ключами `base` и `hover` красят стрелки и номера страниц,',
					'`active` — подложку и текст текущей страницы.',
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
	play: async ({ canvas, canvasElement }) => {
		const indicator = canvasElement.querySelector('.base-pagination__indicator') as HTMLElement
		await waitFor(() => expect(getComputedStyle(indicator).backgroundColor).toBe('rgb(29, 78, 216)'))
		await expect(getComputedStyle(canvas.getByRole('button', { name: 'Страница 4' })).color).toBe('rgb(255, 255, 255)')
		await expect(getComputedStyle(canvas.getByRole('button', { name: 'Страница 3' })).color).toBe('rgb(30, 58, 138)')
	},
}
