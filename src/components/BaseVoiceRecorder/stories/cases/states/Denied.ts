import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import { deniedMicrophoneStream } from '../../micDemo'
import type meta from '../../BaseVoiceRecorder.stories'

export const Denied: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Нет доступа к микрофону: текст ошибки и событие `error` с кодом `denied`; кнопка микрофона — повторить.',
					'Отказ браузера имитирует `requestStream`.',
				].join('\n'),
			},
		},
	},
	args: { requestStream: deniedMicrophoneStream },
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Записать голосовое сообщение' }))
		await expect(await canvas.findByText('Нет доступа к микрофону. Разрешите его в настройках браузера')).toBeInTheDocument()
		await waitFor(() => expect(args.onError).toHaveBeenCalled())
	},
}
