import { documentFile } from '../../shared'
import type meta from '../../BaseFileUpload.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { waitFor, expect, screen } from 'storybook/test'

const LONG_NAME = 'Договор аренды офиса на 2025 год — финальная версия с правками юриста и приложениями.pdf'

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		maxWidth: 360,
		docs: {
			description: {
				story: [
					'Длинное имя файла: строка обрезается многоточием и не раздвигает список, полное имя — в подсказке (BaseTooltip) при наведении.',
					'Кнопка удаления называет файл полностью («Удалить …»), поэтому имя доступно и с клавиатуры.',
				].join('\n'),
			},
		},
	},
	args: { label: 'Документы по сделке' },
	play: async ({ canvas, userEvent }) => {
		await userEvent.upload(canvas.getByLabelText('Документы по сделке'), documentFile(LONG_NAME, 1840))
		const name = await canvas.findByText(LONG_NAME)
		await waitFor(() => expect(name.scrollWidth).toBeGreaterThan(name.clientWidth))
		await expect(canvas.getByRole('button', { name: `Удалить ${LONG_NAME}` })).toBeVisible()

		await userEvent.hover(name)
		await expect(await screen.findByRole('tooltip')).toHaveTextContent(LONG_NAME)
		await userEvent.unhover(name)
		await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument())
	},
}
