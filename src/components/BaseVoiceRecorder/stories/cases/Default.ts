import { expect } from 'storybook/test'
import { tabTo } from '@/stories/helpers'
import type meta from '../BaseVoiceRecorder.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Запись с настоящего микрофона: при первой записи браузер спросит доступ. Страница должна быть открыта по HTTPS',
					'или на localhost — иначе браузер микрофон не даёт, и диктофон так и пишет. Остановка — прослушивание перед',
					'отправкой; «Отправить» отдаёт событие `record` с файлом, длительностью и волной.',
					'Клавиатура: Tab до кнопки микрофона, Enter — начать запись. Без микрофона — история «Demo Microphone».',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, userEvent }) => {
		const record = canvas.getByRole('button', { name: 'Записать голосовое сообщение' })
		await tabTo(record, userEvent)
		await expect(record).toHaveFocus()
	},
}
