import { tabTo } from '@/stories/helpers'
import { expect, waitFor } from 'storybook/test'
import { demoMicrophoneStream } from '../micDemo'
import type meta from '../BaseVoiceRecorder.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const DemoMicrophone: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Вместо микрофона — `requestStream`: звук из Web Audio (тон с «слогами»). Так диктофон проверяется без',
					'микрофона и в автотестах; тот же проп подключает заранее выбранное устройство. Запись, остановка,',
					'прослушивание и отправка — событие `record`.',
				].join('\n'),
			},
		},
	},
	args: { requestStream: demoMicrophoneStream },
	play: async ({ canvas, userEvent, args }) => {
		await tabTo(canvas.getByRole('button', { name: 'Записать голосовое сообщение' }), userEvent)
		await userEvent.keyboard('{Enter}')
		const stop = await canvas.findByRole('button', { name: 'Остановить запись' })
		await waitFor(() => expect(stop).toBeEnabled())
		await new Promise(resolve => setTimeout(resolve, 1200))
		await userEvent.click(stop)
		await expect(await canvas.findByRole('group', { name: 'Записанное сообщение' })).toBeInTheDocument()
		await userEvent.click(canvas.getByRole('button', { name: 'Отправить' }))
		await waitFor(() => expect(args.onRecord).toHaveBeenCalledOnce())
	},
}
