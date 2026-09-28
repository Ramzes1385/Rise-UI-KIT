import { expect } from 'storybook/test'
import type meta from '../BaseFileUpload.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Empty: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Файлы ещё не выбраны: только зона загрузки с подсказкой о форматах и размере, списка нет.' } },
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByText('.PDF, .DOCX, IMAGE/*')).toBeVisible()
		await expect(canvas.getByText('до 10 МБ')).toBeVisible()
		await expect(canvas.queryByRole('list')).not.toBeInTheDocument()
	},
}
