import { expect, fireEvent } from 'storybook/test'
import type meta from '../../BaseFileUpload.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { dropData, documentFile } from '../../shared'

export const Disabled: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Отключённая зона: приглушена, не получает фокус, не открывает выбор файла и не принимает перетаскивание.',
			},
		},
	},
	args: { isDisabled: true },
	play: async ({ canvas, userEvent, args }) => {
		const dropzone = canvas.getByRole('button', { name: /Выберите файлы/ })
		await expect(dropzone).toHaveAttribute('aria-disabled', 'true')
		await expect(canvas.getByLabelText('Вложения')).toBeDisabled()

		await userEvent.tab()
		await expect(dropzone).not.toHaveFocus()
		await fireEvent.drop(dropzone, { dataTransfer: dropData([documentFile('Отчёт.pdf', 12)]) })
		await expect(args.onChange).not.toHaveBeenCalled()
	},
}
