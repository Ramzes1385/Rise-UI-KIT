import type meta from '../BaseChat.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import { ANNA, PRIVATE_MESSAGES, sentAt } from '../shared'
import { installDemoMicrophone } from '@components/BaseVoiceRecorder/stories/micDemo'
import { DEMO_VOICE, DEMO_VOICE_DURATION, DEMO_VOICE_PEAKS } from '@components/BaseAudioPlayer/stories/shared'

export const VoiceMessages: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Голосовые сообщения (`hasVoiceMessages`): пока поле пустое, вместо «Отправить» — микрофон. Запись идёт прямо в поле',
					'ввода, после остановки её можно прослушать, удалить или отправить. Событие `send-voice` отдаёт запись',
					'(`blob`, `duration`, `peaks`) и `replyToId`; приложение загружает файл и добавляет сообщение с вложением',
					'`type: "audio"` — в ленте оно играет в BaseAudioPlayer с волной. В story вместо микрофона — эмуляция.',
				].join('\n'),
			},
		},
	},
	args: {
		hasVoiceMessages: true,
		quickReplies: [],
		messages: [
			PRIVATE_MESSAGES[2],
			{
				id: 'v1',
				sender: 'other',
				senderName: ANNA.name,
				senderAvatar: ANNA.avatar,
				text: '',
				attachments: [
					{
						id: 'v1-a',
						name: 'voice.webm',
						type: 'audio',
						url: DEMO_VOICE,
						duration: DEMO_VOICE_DURATION,
						peaks: DEMO_VOICE_PEAKS,
					},
				],
				...sentAt(9, 41),
			},
		],
	},
	beforeEach: () => installDemoMicrophone(),
	play: async ({ canvas, userEvent, args }) => {
		await expect(canvas.getByRole('group', { name: 'Голосовое сообщение' })).toBeInTheDocument()
		await userEvent.click(canvas.getByRole('button', { name: 'Записать голосовое сообщение' }))
		const stop = await canvas.findByRole('button', { name: 'Остановить запись' })
		await waitFor(() => expect(stop).toBeEnabled())
		await new Promise(resolve => setTimeout(resolve, 1200))
		await userEvent.click(stop)
		const recorder = within(await canvas.findByRole('group', { name: 'Записанное сообщение' }))
		await expect(recorder.getByRole('button', { name: 'Воспроизвести' })).toBeInTheDocument()
		await userEvent.click(canvas.getByRole('button', { name: 'Отправить' }))
		await waitFor(() => expect(args['onSend-voice']).toHaveBeenCalledOnce())
		await waitFor(() => expect(canvas.getAllByRole('group', { name: 'Голосовое сообщение' })).toHaveLength(2))
		await expect(canvas.getByRole('button', { name: 'Записать голосовое сообщение' })).toBeInTheDocument()
	},
}
