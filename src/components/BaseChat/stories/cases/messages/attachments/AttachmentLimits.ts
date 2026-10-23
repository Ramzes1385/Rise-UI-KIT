import { tabTo } from '@/stories/helpers'
import type meta from '../../../BaseChat.stories'
import { PRIVATE_MESSAGES } from '../../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, fireEvent, waitFor, within } from 'storybook/test'

function pickFiles(input: HTMLInputElement, files: File[]): Promise<boolean> {
	const transfer = new DataTransfer()
	for (const file of files) transfer.items.add(file)
	input.files = transfer.files
	return fireEvent.change(input)
}

export const AttachmentLimits: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Ограничения вложений: `accept` (как у `input[type=file]`), `maxFileSize` (МБ) и `maxFiles`. Здесь — `image/*,.pdf`, 1 МБ и два файла.',
					'Файлы, которые не подошли, не прикрепляются: под полем ввода появляется блок с `role="alert"` и причинами, а приложение получает',
					'событие `error` с типом `attachment` и списком отказов в `detail`. Событие `attach` приходит только с принятыми файлами.',
					'Сообщение закрывается кнопкой; оно же пропадает при отправке или удалении вложения.',
				].join('\n'),
			},
		},
	},
	args: {
		messages: PRIVATE_MESSAGES.slice(0, 2),
		quickReplies: [],
		accept: 'image/*,.pdf',
		maxFileSize: 1,
		maxFiles: 2,
	},
	play: async ({ canvas, canvasElement, userEvent, args }) => {
		await tabTo(canvas.getByRole('button', { name: 'Прикрепить файл' }), userEvent, 30)

		const fileInput = canvasElement.querySelector('input[type="file"]') as HTMLInputElement
		await expect(fileInput).toHaveAttribute('accept', 'image/*,.pdf')

		const tooBig = new File([new Uint8Array(1536 * 1024)], 'big-cover.png', { type: 'image/png' })
		const wrongType = new File(['PK'], 'archive.zip', { type: 'application/zip' })
		const photo = new File(['png'], 'photo.png', { type: 'image/png' })
		const spec = new File(['%PDF'], 'spec.pdf', { type: 'application/pdf' })
		const extra = new File(['png'], 'extra.png', { type: 'image/png' })
		await pickFiles(fileInput, [tooBig, wrongType, photo, spec, extra])

		const alert = await canvas.findByRole('alert')
		await expect(within(alert).getByText('Файл "big-cover.png" превышает 1 МБ')).toBeInTheDocument()
		await expect(within(alert).getByText(/Формат файла "archive\.zip" не поддерживается/)).toBeInTheDocument()
		await expect(within(alert).getByText('Можно прикрепить не больше 2 файлов')).toBeInTheDocument()

		await expect(args.onAttach).toHaveBeenCalledTimes(1)
		const attached = Array.from((args.onAttach as unknown as { mock: { calls: [FileList][] } }).mock.calls[0][0])
		await expect(attached.map(file => file.name)).toEqual(['photo.png', 'spec.pdf'])
		await expect(args.onError).toHaveBeenCalledWith(expect.objectContaining({ type: 'attachment' }))

		await expect(canvas.getByRole('button', { name: 'Удалить вложение photo.png' })).toBeInTheDocument()
		await expect(canvas.getByRole('button', { name: 'Удалить вложение spec.pdf' })).toBeInTheDocument()
		await expect(canvas.queryByRole('button', { name: 'Удалить вложение big-cover.png' })).not.toBeInTheDocument()
		await expect(canvas.queryByRole('button', { name: 'Удалить вложение extra.png' })).not.toBeInTheDocument()

		const close = within(alert).getByRole('button', { name: 'Закрыть сообщение об ошибке' })
		await tabTo(close, userEvent, 30)
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(canvas.queryByRole('alert')).not.toBeInTheDocument())
	},
}
