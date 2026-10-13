import { expect } from 'storybook/test'
import type meta from '../../BaseResult.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Кастомный цвет через `color`: фон и текст экрана; круг с иконкой, заголовок и описание берут цвет текста.',
					'Для обычных итогов хватает статусов — `color` нужен для фирменных экранов.',
				].join('\n'),
			},
		},
	},
	args: {
		title: 'Добро пожаловать в «Команду»',
		description: 'Тариф активирован: до 20 участников и общий календарь проекта.',
		icon: 'star',
		color: { bg: { base: '#6d28d9' }, text: { base: '#ffffff' } },
	},
	play: async ({ canvas, canvasElement }) => {
		const root = canvasElement.querySelector('.base-result') as HTMLElement
		await expect(getComputedStyle(root).backgroundColor).toBe('rgb(109, 40, 217)')
		const wrapper = canvasElement.querySelector('.base-result__icon-wrapper') as HTMLElement
		await expect(getComputedStyle(wrapper).color).toBe('rgb(255, 255, 255)')
		await expect(getComputedStyle(canvas.getByRole('heading', { level: 2 })).color).toBe('rgb(255, 255, 255)')
	},
}
