import { waitFor, expect } from 'storybook/test'
import type meta from '../../BaseFileUpload.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { documentFile, imageFile, UPLOAD_TIMEOUT } from '../../shared'

export const Multiple: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Несколько файлов (`isMultiple`, до `maxCount`): новые файлы добавляются в список, крестик удаляет файл',
					'(`remove`, затем `change` с оставшимися). Длинное имя обрезается многоточием, полное — в подсказке.',
				].join('\n'),
			},
		},
	},
	args: { isMultiple: true, maxCount: 5, label: 'Документы по сделке' },
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.upload(canvas.getByLabelText('Документы по сделке'), [
			documentFile('Договор аренды офиса на 2025 год — финальная версия с правками юриста.pdf', 1840),
			documentFile('Смета.docx', 36, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
			imageFile('План этажа.svg', 150),
		])
		await waitFor(() => expect(canvas.getAllByRole('listitem')).toHaveLength(3))

		await userEvent.click(canvas.getByRole('button', { name: 'Удалить Смета.docx' }))
		await expect(args.onRemove).toHaveBeenCalledOnce()
		await expect(canvas.getAllByRole('listitem')).toHaveLength(2)
		await expect(args.onChange).toHaveBeenLastCalledWith([expect.any(File), expect.any(File)])
		await expect(await canvas.findByText('Загружено', {}, { timeout: UPLOAD_TIMEOUT })).toBeVisible()
	},
}
