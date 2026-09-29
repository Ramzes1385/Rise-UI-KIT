import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../BaseSubtitleEditor.stories'

export const Disabled: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Только просмотр: поля и кнопки изменения отключены, переход к репликам и скачивание работают.' } },
	},
	args: { isDisabled: true },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('textbox', { name: 'Текст реплики 1' })).toBeDisabled()
		await expect(canvas.getByRole('button', { name: 'Перейти к реплике 1' })).toBeEnabled()
	},
}
