import { expect } from 'storybook/test'
import type meta from '../../BaseFileUpload.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { imageFile, UPLOAD_TIMEOUT } from '../../shared'

export const Loading: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Загрузка: пока файл отправляется, в строке — процент и полоса `BaseProgress` с именем файла, после — «Загружено».',
					'Сейчас прогресс имитируется компонентом (аудит FU-2), для документов статус остаётся «Ожидание».',
				].join('\n'),
			},
		},
	},
	args: { label: 'Обложка', accept: 'image/*' },
	play: async ({ canvas, userEvent }) => {
		await userEvent.upload(canvas.getByLabelText('Обложка'), imageFile('Обложка.svg', 24))
		await expect(await canvas.findByRole('progressbar', { name: 'Обложка.svg' })).toBeVisible()
		await expect(await canvas.findByText('Загружено', {}, { timeout: UPLOAD_TIMEOUT })).toBeVisible()
		await expect(canvas.queryByRole('progressbar')).not.toBeInTheDocument()
	},
}
