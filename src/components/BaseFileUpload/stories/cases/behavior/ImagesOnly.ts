import type meta from '../../BaseFileUpload.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { fireEvent, waitFor, expect } from 'storybook/test'
import { dropData, documentFile, imageFile } from '../../shared'

export const ImagesOnly: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Только изображения (`accept`): файл другого типа не принимается — под зоной ошибка. Выбранное изображение',
					'показывается превью; клик по превью открывает просмотр (`allowPreview`). Новый файл заменяет прежний.',
				].join('\n'),
			},
		},
	},
	args: { label: 'Фото товара', accept: '.png,.jpg,.jpeg,.svg', buttonText: 'Выберите изображение', maxSize: 5 },
	play: async ({ canvas, userEvent, args }) => {
		const dropzone = canvas.getByRole('button', { name: /Выберите изображение/ })
		await fireEvent.drop(dropzone, { dataTransfer: dropData([documentFile('Счёт.pdf', 90)]) })
		const error = await canvas.findByText(/Формат файла "Счёт\.pdf" не поддерживается/)
		await waitFor(() => expect(error).toBeVisible())
		await expect(canvas.getByRole('alert')).toContainElement(error)
		await expect(args.onError).toHaveBeenCalledOnce()

		await userEvent.upload(canvas.getByLabelText('Фото товара'), imageFile('Товар.svg', 340))
		await expect(await canvas.findByRole('button', { name: 'Товар.svg' })).toBeVisible()
		await expect(canvas.queryByText(/не поддерживается/)).not.toBeInTheDocument()
	},
}
