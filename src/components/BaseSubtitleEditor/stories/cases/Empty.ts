import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../BaseSubtitleEditor.stories'

export const Empty: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Реплик нет: подсказка, «Добавить реплику» и «Загрузить .vtt или .srt»; скачивание недоступно.' } },
	},
	args: { cues: [], currentTime: 0 },
	play: async ({ canvas }) => {
		await expect(canvas.getByText('Реплик нет. Добавьте первую или загрузите файл субтитров')).toBeInTheDocument()
		await expect(canvas.getByRole('button', { name: 'Скачать .vtt' })).toBeDisabled()
	},
}
