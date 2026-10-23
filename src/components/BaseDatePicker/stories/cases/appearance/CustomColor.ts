import { expect } from 'storybook/test'
import type meta from '../../BaseDatePicker.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { resolveColor, storyDate } from '@/stories/helpers'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Кастомный цвет поля через `color` (фон и текст). Кнопка календаря внутри поля цвет не наследует.' },
		},
	},
	args: {
		modelValue: storyDate(0, 0, 0),
		color: { bg: { base: 'var(--rise-primary-soft)' }, text: { base: 'var(--rise-primary-text)' } },
	},
	play: async ({ canvas }) => {
		const field = canvas.getByLabelText('Дата встречи')
		const wrapper = field.closest('.base-input__wrapper') as HTMLElement
		await expect(getComputedStyle(wrapper).backgroundColor).toBe(resolveColor('var(--rise-primary-soft)'))
		await expect(getComputedStyle(field).color).toBe(resolveColor('var(--rise-primary-text)'))
		await expect(getComputedStyle(canvas.getByRole('button', { name: 'Открыть календарь' })).backgroundColor).toBe('rgba(0, 0, 0, 0)')
	},
}
