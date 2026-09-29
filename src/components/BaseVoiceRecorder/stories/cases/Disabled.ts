import { expect } from 'storybook/test'
import type meta from '../BaseVoiceRecorder.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Disabled: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Запись недоступна: кнопка микрофона отключена.' } } },
	args: { isDisabled: true },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('button', { name: 'Записать голосовое сообщение' })).toBeDisabled()
	},
}
