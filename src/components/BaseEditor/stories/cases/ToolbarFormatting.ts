import type meta from '../BaseEditor.stories'
import { renderWithLocalModel } from '../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, within, waitFor } from 'storybook/test'

export const ToolbarFormatting: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Форматирование через тулбар: выделите текст и нажмите кнопку. Кнопка включённого формата подсвечена',
					'и озвучивается как нажатая (`aria-pressed`).',
				].join('\n'),
			},
		},
	},
	render: renderWithLocalModel,
	args: { modelValue: '<p>Сроки сдвигаются на неделю.</p><p>Ответственный — Иван Петров.</p>' },
	play: async ({ canvas, userEvent, args }) => {
		const textbox = canvas.getByRole('textbox', { name: 'Текстовый редактор' })
		const bold = canvas.getByRole('button', { name: 'Жирный' })
		await expect(bold).toHaveAttribute('aria-pressed', 'false')

		await userEvent.tripleClick(within(textbox).getByText('Сроки сдвигаются на неделю.'))
		await userEvent.click(bold)
		await waitFor(() => expect(bold).toHaveAttribute('aria-pressed', 'true'))
		await expect(within(textbox).getByText('Сроки сдвигаются на неделю.').closest('b, strong')).not.toBeNull()

		await userEvent.tripleClick(within(textbox).getByText('Ответственный — Иван Петров.'))
		await userEvent.click(canvas.getByRole('button', { name: 'Маркированный список' }))
		await expect(within(textbox).getByRole('listitem')).toHaveTextContent('Ответственный — Иван Петров.')
		await expect(args['onUpdate:modelValue']).toHaveBeenLastCalledWith(expect.stringContaining('<ul>'))
	},
}
