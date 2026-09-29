import { expect, waitFor } from 'storybook/test'
import type meta from '../BaseVoiceRecorder.stories'
import { installDeniedMicrophone } from '../micDemo'
import type { StoryObj } from '@storybook/vue3-vite'

export const Denied: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Нет доступа к микрофону: текст ошибки и событие `error` с кодом `denied`; кнопка микрофона — повторить.',
			},
		},
	},
	beforeEach: () => installDeniedMicrophone(),
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Записать голосовое сообщение' }))
		await expect(await canvas.findByText('Нет доступа к микрофону. Разрешите его в настройках браузера')).toBeInTheDocument()
		await waitFor(() => expect(args.onError).toHaveBeenCalled())
	},
}
