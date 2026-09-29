import { expect } from 'storybook/test'
import { tabTo } from '@/stories/helpers'
import type meta from '../BaseChat.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { ANNA, PRIVATE_MESSAGES, sentAt } from '../shared'
import { DEMO_VOICE, DEMO_VOICE_DURATION, DEMO_VOICE_PEAKS } from '@components/BaseAudioPlayer/stories/shared'

export const VoiceMessages: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Голосовые сообщения (`hasVoiceMessages`): пока поле пустое, вместо «Отправить» — микрофон. Запись идёт прямо в поле',
					'ввода, после остановки её можно прослушать, удалить или отправить. Событие `send-voice` отдаёт запись',
					'(`blob`, `duration`, `peaks`) и `replyToId`; приложение загружает файл и добавляет сообщение с вложением',
					'`type: "audio"` — в ленте оно играет в BaseAudioPlayer с волной. Микрофон настоящий: браузер спросит доступ',
					'(страница по HTTPS или на localhost). Свой источник звука — `requestVoiceStream`, как `requestStream` у',
					'BaseVoiceRecorder.',
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
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.getByRole('group', { name: 'Голосовое сообщение' })).toBeInTheDocument()
		const record = canvas.getByRole('button', { name: 'Записать голосовое сообщение' })
		await userEvent.click(canvas.getByPlaceholderText('Напишите сообщение...'))
		await tabTo(record, userEvent)
		await expect(record).toHaveFocus()
	},
}
