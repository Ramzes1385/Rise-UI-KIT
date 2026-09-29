import type meta from '../../BaseEditor.stories'
import { renderWithLocalModel } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'

export const CodeMode: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Режим HTML-кода: кнопка «Режим кода» показывает разметку в текстовом поле, правки видны в визуальном режиме',
					'после повторного нажатия. Кнопки тулбара в режиме кода оборачивают выделенный фрагмент в теги.',
				].join('\n'),
			},
		},
	},
	render: renderWithLocalModel,
	args: { modelValue: '<p>Текст с <strong>жирным</strong> словом.</p>' },
	play: async ({ canvas, userEvent }) => {
		const toggle = canvas.getByRole('button', { name: 'Режим кода' })
		await userEvent.click(toggle)
		await expect(toggle).toHaveAttribute('aria-pressed', 'true')

		const code = canvas.getByRole('textbox', { name: 'HTML-код' })
		await expect(code).toHaveValue('<p>Текст с <strong>жирным</strong> словом.</p>')
		await userEvent.clear(code)
		await userEvent.type(code, '<h3>Итоги</h3><p>Все задачи закрыты.</p>')

		await userEvent.click(toggle)
		await expect(toggle).toHaveAttribute('aria-pressed', 'false')
		const textbox = await canvas.findByRole('textbox', { name: 'Текстовый редактор' })
		await waitFor(() => expect(within(textbox).getByRole('heading', { name: 'Итоги' })).toBeVisible())
	},
}
