import { textFile } from '../../shared'
import { tabTo } from '@/stories/helpers'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseCryptoProSign.stories'

export const MultipleFiles: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'`is-multiple` — подпись нескольких файлов за раз. Файлы выбираются в поле «Документ» и подписываются по очереди одним',
					'сертификатом: у каждого файла своё состояние (в очереди, подписывается, подписан, не подписан, отменён), ошибка одного файла',
					'не останавливает остальные. Пока идёт очередь, доступна «Отменить» — текущий файл дописывается, остальные не подписываются.',
					'События: `signed` — на каждый файл, `signed-all` — итог очереди; у каждого подписанного файла своя кнопка «Скачать».',
					'Файл больше `hashThreshold` подписывается по хэшу, остальные — целиком.',
				].join('\n'),
			},
		},
	},
	args: { data: undefined, fileName: '', isMultiple: true },
	play: async ({ canvas, userEvent, args }) => {
		const input = await canvas.findByLabelText('Документ')
		const button = canvas.getByRole('button', { name: 'Подписать' })
		await expect(button).toBeDisabled()

		await userEvent.upload(input, [textFile('act.txt', 2048), textFile('invoice.txt', 4096), textFile('contract.txt', 1024)])
		await waitFor(() => expect(button).toBeEnabled())
		await tabTo(button, userEvent)
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(args['onSigned-all']).toHaveBeenCalledWith(expect.objectContaining({ signedCount: 3, failedCount: 0 })))
		await expect(args.onSigned).toHaveBeenCalledTimes(3)
		const list = canvas.getByRole('list', { name: 'Файлы для подписи' })
		await expect(list).toBeVisible()
		await expect(canvas.getAllByText(/подписан$/)).toHaveLength(3)
		await expect(canvas.getByRole('button', { name: 'Скачать invoice.txt.sig' })).toBeEnabled()
		await expect(canvas.getByRole('button', { name: 'Скачать все подписи' })).toBeEnabled()
		await expect(args.onError).not.toHaveBeenCalled()
	},
}
