import { stageOf, statusOf } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseImageMapEditor.stories'
import { expect, waitFor, within } from 'storybook/test'

export const DeleteConfirm: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Удаление не бывает случайным: кнопка «Удалить» в панели инструментов, «Удалить этаж» и «Удалить группу» открывают окно подтверждения',
					'с названием («Удалить объект «Озеро»?») и пояснением, как вернуть. Escape и «Отмена» оставляют всё как есть, а фокус возвращается на кнопку.',
					'Клавиша Delete на холсте удаляет сразу — правка обратима: Ctrl+Z (или «Отменить») возвращает объект. Метод `deleteSelected()` из `ref` тоже не спрашивает.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: /^Озеро/ }))
		const remove = canvas.getByRole('button', { name: 'Удалить (Delete)' })
		remove.focus()
		await userEvent.keyboard('{Enter}')

		const body = within(document.body)
		const dialog = await body.findByRole('alertdialog', { name: 'Удалить объект «Озеро»?' })
		await expect(dialog).toHaveAccessibleDescription(/Ctrl\+Z/)
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(body.queryByRole('alertdialog')).not.toBeInTheDocument())
		await expect(canvas.getByRole('button', { name: /^Озеро/ })).toBeInTheDocument()
		await waitFor(() => expect(remove).toHaveFocus(), { timeout: 3000 })

		await userEvent.keyboard('{Enter}')
		await userEvent.click(within(await body.findByRole('alertdialog')).getByRole('button', { name: 'Удалить' }))
		await expect(statusOf(canvasElement)).toHaveTextContent('Удалён объект «Озеро»')
		await expect(canvas.queryByRole('button', { name: /^Озеро/ })).not.toBeInTheDocument()

		await userEvent.keyboard('{Control>}z{/Control}')
		await expect(canvas.getByRole('button', { name: /^Озеро/ })).toBeInTheDocument()
		await expect(stageOf(canvasElement)).toBeInTheDocument()
	},
}
