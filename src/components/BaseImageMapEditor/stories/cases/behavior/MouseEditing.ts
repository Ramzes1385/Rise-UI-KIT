import { expect, within } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseImageMapEditor.stories'
import { pointAt, stageOf, statusOf } from '../../shared'

export const MouseEditing: StoryObj<typeof meta> = {
	tags: ['!autodocs'],
	parameters: {
		docs: {
			description: {
				story: 'Сценарий мышью: протяжка инструментом «Прямоугольник» создаёт фигуру, Ctrl+Z отменяет, Ctrl+Shift+Z повторяет, кнопка «Удалить» спрашивает подтверждение и убирает выделенное.',
			},
		},
	},
	play: async ({ canvas, canvasElement, userEvent }) => {
		const stage = stageOf(canvasElement)
		await userEvent.click(canvas.getByRole('radio', { name: 'Прямоугольник' }))
		await userEvent.pointer([
			{ keys: '[MouseLeft>]', target: stage, coords: pointAt(stage, 0.4, 0.2) },
			{ target: stage, coords: pointAt(stage, 0.55, 0.35) },
			{ keys: '[/MouseLeft]', target: stage, coords: pointAt(stage, 0.55, 0.35) },
		])
		await expect(statusOf(canvasElement)).toHaveTextContent('Добавлен объект «Прямоугольник 2»')
		await expect(canvas.getByRole('button', { name: 'Прямоугольник 2 Прямоугольник' })).toHaveAttribute('aria-current', 'true')

		await userEvent.keyboard('{Control>}z{/Control}')
		await expect(canvas.queryByRole('button', { name: 'Прямоугольник 2 Прямоугольник' })).not.toBeInTheDocument()
		await expect(statusOf(canvasElement)).toHaveTextContent('Правка отменена')

		await userEvent.keyboard('{Control>}{Shift>}z{/Shift}{/Control}')
		await expect(statusOf(canvasElement)).toHaveTextContent('Правка повторена')
		await userEvent.click(canvas.getByRole('button', { name: 'Прямоугольник 2 Прямоугольник' }))
		await userEvent.click(canvas.getByRole('button', { name: 'Удалить (Delete)' }))
		const dialog = await within(document.body).findByRole('alertdialog', { name: 'Удалить объект «Прямоугольник 2»?' })
		await userEvent.click(within(dialog).getByRole('button', { name: 'Удалить' }))
		await expect(statusOf(canvasElement)).toHaveTextContent('Удалён объект «Прямоугольник 2»')
		await expect(canvas.queryByRole('button', { name: 'Прямоугольник 2 Прямоугольник' })).not.toBeInTheDocument()
	},
}
