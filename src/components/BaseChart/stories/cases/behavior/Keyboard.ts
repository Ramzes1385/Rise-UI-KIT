import { expect } from 'storybook/test'
import { tabTo } from '@/stories/helpers'
import type meta from '../../BaseChart.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Keyboard: StoryObj<typeof meta> = {
	tags: ['!autodocs'],
	parameters: {
		docs: {
			description: {
				story: 'Проверка клавиатуры: стрелки, Home/End, PageUp/PageDown и Escape на области графика; Tab к легенде и Space скрывает ряд.',
			},
		},
	},
	play: async ({ canvas, canvasElement, userEvent }) => {
		const plot = canvas.getByRole('img')
		const status = canvas.getByRole('status')
		const tooltip = (): Element | null => canvasElement.querySelector('.base-chart__tooltip')
		await tabTo(plot, userEvent)
		await expect(plot).toHaveFocus()
		await userEvent.keyboard('{ArrowRight}')
		await expect(status).toHaveTextContent('Янв: Выручка: 120, Расходы: 90')
		await expect(tooltip()).toHaveTextContent('Янв')
		await userEvent.keyboard('{End}')
		await expect(status).toHaveTextContent('Дек: Выручка: 240, Расходы: 162')
		await userEvent.keyboard('{ArrowLeft}')
		await expect(status).toHaveTextContent('Ноя: Выручка: 220, Расходы: 150')
		await userEvent.keyboard('{Home}{PageDown}')
		await expect(status).toHaveTextContent('Фев: Выручка: 135, Расходы: 95')
		await userEvent.keyboard('{Escape}')
		await expect(tooltip()).toBeNull()
		await userEvent.tab()
		const revenue = canvas.getByRole('button', { name: 'Выручка' })
		await expect(revenue).toHaveFocus()
		await userEvent.keyboard(' ')
		await expect(revenue).toHaveAttribute('aria-pressed', 'false')
		await expect(plot).toHaveAccessibleName(/: Расходы; значения от 90 до 162$/)
		await userEvent.keyboard(' ')
		await expect(revenue).toHaveAttribute('aria-pressed', 'true')
	},
}
