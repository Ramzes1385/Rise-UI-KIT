import { expect } from 'storybook/test'
import type meta from '../../BaseAlert.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Кастомный цвет через `color`: фон и текст; иконка и кнопка закрытия берут цвет текста.',
					'Для обычных сообщений хватает типов — `color` нужен для фирменных блоков.',
				].join('\n'),
			},
		},
	},
	args: {
		title: 'Новый тариф «Команда»',
		description: 'До 20 участников и общий календарь проекта.',
		icon: 'star',
		isClosable: true,
		color: { bg: { base: '#6d28d9' }, text: { base: '#ffffff' } },
	},
	play: async ({ canvas, canvasElement }) => {
		const alert = canvas.getByRole('status')
		await expect(getComputedStyle(alert).backgroundColor).toBe('rgb(109, 40, 217)')
		const icon = canvasElement.querySelector('.base-alert__icon-wrapper') as HTMLElement
		await expect(getComputedStyle(icon).color).toBe('rgb(255, 255, 255)')
		await expect(getComputedStyle(canvas.getByRole('button', { name: 'Закрыть' })).color).toBe('rgb(255, 255, 255)')
	},
}
