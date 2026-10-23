import { textFile } from '../../shared'
import { tabTo } from '@/stories/helpers'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseCryptoProSign.stories'

export const LargeFileHash: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Файл больше `hashThreshold` (по умолчанию 10 МБ) не передаётся в плагин целиком: компонент считает хэш ГОСТ Р 34.11-2012',
					'частями по 768 КБ (ход — BaseProgress «Считаем хэш документа») и подписывает хэш. Такая подпись только отсоединённая:',
					'«Присоединённая» недоступна, под переключателем — подсказка. Здесь порог 1 КБ, чтобы показать это на маленьком файле.',
				].join('\n'),
			},
		},
	},
	args: { data: undefined, fileName: '', hashThreshold: 1024 },
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.upload(await canvas.findByLabelText('Документ'), textFile('report.txt', 4096))
		await expect(await canvas.findByText('Документ больше 1,0 КБ: подписывается его хэш, подпись только отсоединённая')).toBeVisible()
		await expect(canvas.getByRole('radio', { name: 'Присоединённая' })).toBeDisabled()
		await expect(canvas.getByRole('radio', { name: 'Отсоединённая' })).toBeChecked()

		const button = canvas.getByRole('button', { name: 'Подписать' })
		await waitFor(() => expect(button).toBeEnabled())
		await tabTo(button, userEvent)
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(args.onSigned).toHaveBeenCalledWith(expect.objectContaining({ detached: true, isHash: true })))
		await waitFor(() => expect(canvas.getAllByText('Подпись создана: report.txt.sig')[0]).toBeVisible())
		await expect(canvas.queryByRole('progressbar')).not.toBeInTheDocument()
	},
}
