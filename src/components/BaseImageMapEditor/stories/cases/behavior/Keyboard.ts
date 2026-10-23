import { expect } from 'storybook/test'
import { tabTo } from '@/stories/helpers'
import { stageOf, statusOf } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseImageMapEditor.stories'

export const Keyboard: StoryObj<typeof meta> = {
	tags: ['!autodocs'],
	parameters: {
		docs: {
			description: {
				story: 'Только клавиатура: стрелки в группе инструментов выбирают «Точку», на холсте стрелки ведут перекрестие и Enter ставит точку; Escape возвращает выбор, стрелки сдвигают точку, Ctrl+Z отменяет.',
			},
		},
	},
	play: async ({ canvas, canvasElement, userEvent }) => {
		const selectTool = canvas.getByRole('radio', { name: 'Выбор' })
		await tabTo(selectTool, userEvent)
		await userEvent.keyboard('{ArrowRight}')
		await expect(canvas.getByRole('radio', { name: 'Точка' })).toBeChecked()

		const stage = stageOf(canvasElement)
		await tabTo(stage, userEvent, 30)
		await expect(stage).toHaveAccessibleDescription(/Enter ставит точку/)
		await userEvent.keyboard('{ArrowRight}{ArrowRight}{Enter}')
		await expect(statusOf(canvasElement)).toHaveTextContent('Добавлен объект «Точка 4»')
		await expect(canvas.getByRole('button', { name: 'Точка 4 Точка' })).toHaveAttribute('aria-current', 'true')

		await userEvent.keyboard('{Escape}')
		await expect(canvas.getByRole('radio', { name: 'Выбор' })).toBeChecked()
		await userEvent.keyboard('{ArrowDown}')
		await expect(statusOf(canvasElement)).toHaveTextContent(/^Слева 51 %, сверху 50[.,]5 %$/)

		await userEvent.keyboard('{Control>}z{/Control}')
		await expect(statusOf(canvasElement)).toHaveTextContent('Правка отменена')
		await userEvent.keyboard('{Control>}z{/Control}')
		await expect(canvas.queryByRole('button', { name: 'Точка 4 Точка' })).not.toBeInTheDocument()
	},
}
