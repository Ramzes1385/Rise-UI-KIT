import { expect } from 'storybook/test'
import type meta from '../BaseButton.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Кастомный цвет через `color`: фон и текст с состояниями hover/active/focus.',
					'Используйте для брендовых кнопок сторонних сервисов; для обычных действий хватает вариантов.',
				].join('\n'),
			},
		},
	},
	args: {
		default: 'Оплатить',
		color: {
			bg: { base: '#6d28d9', hover: '#5b21b6', active: '#4c1d95' },
			text: { base: '#ffffff' },
		},
	},
	play: async ({ canvas }) => {
		const button = canvas.getByRole('button', { name: 'Оплатить' })
		await expect(button.style.getPropertyValue('--custom-bg')).toBe('#6d28d9')
		await expect(button.style.getPropertyValue('--custom-bg-hover')).toBe('#5b21b6')
		await expect(getComputedStyle(button).backgroundColor).toBe('rgb(109, 40, 217)')
	},
}
