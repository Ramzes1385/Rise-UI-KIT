import { expect } from 'storybook/test'
import type { SearchArgs } from '../shared'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomColor: StoryObj<SearchArgs> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Кастомный цвет фона и текста поля через `color`. Кнопка очистки внутри поля — вложенный компонент: цвет поиска',
					'она не наследует.',
				].join('\n'),
			},
		},
	},
	args: { modelValue: 'Лисья тропа', color: { bg: { base: '#eff6ff' }, text: { base: '#1e3a8a' } } },
	play: async ({ canvas }) => {
		const field = canvas.getByPlaceholderText('Поиск по проекту')
		await expect(getComputedStyle(field.closest('.base-input__wrapper') as HTMLElement).backgroundColor).toBe('rgb(239, 246, 255)')
		await expect(getComputedStyle(canvas.getByRole('button', { name: 'Очистить' })).backgroundColor).toBe('rgba(0, 0, 0, 0)')
	},
}
