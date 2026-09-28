import type meta from '../BaseChat.stories'
import { STORY_IMAGES } from '@/stories/helpers'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, within, waitFor } from 'storybook/test'
import { PRIVATE_MESSAGES, storyImage, sentAt, ANNA, storyFile, getMessage } from '../shared'

export const Attachments: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Вложения: изображения — коллаж до четырёх превью с «+N», открываются просмотрщиком; файлы — карточки с именем,',
					'размером и кнопкой «Скачать». Скрепка добавляет файлы: превью над полем, отправка — вместе с текстом или без него.',
				].join('\n'),
			},
		},
	},
	args: {
		messages: [
			PRIVATE_MESSAGES[2],
			{
				id: 'a2',
				sender: 'me',
				text: 'Все варианты обложек:',
				attachments: STORY_IMAGES.map((image, index) => storyImage(`a2-${index}`, index, `cover-${index + 1}.png`)),
				status: 'read',
				...sentAt(9, 30),
			},
			{
				id: 'a3',
				sender: 'other',
				senderName: ANNA.name,
				senderAvatar: ANNA.avatar,
				text: '',
				attachments: [storyFile('a3-1', 'brand-guide.pdf', '4,1 МБ'), storyFile('a3-2', 'tokens.json', '12 КБ')],
				...sentAt(9, 32),
			},
		],
		quickReplies: [],
	},
	play: async ({ canvas, canvasElement, userEvent, args }) => {
		await expect(within(getMessage(canvasElement, 'a2')).getByText('+3')).toBeInTheDocument()

		const fileInput = canvasElement.querySelector('input[type="file"]') as HTMLInputElement
		await userEvent.upload(fileInput, new File(['План релиза 1.4'], 'release-plan.txt', { type: 'text/plain' }))
		await expect(args.onAttach).toHaveBeenCalled()
		await expect(canvas.getByRole('button', { name: 'Удалить вложение release-plan.txt' })).toBeInTheDocument()

		await userEvent.click(canvas.getByRole('button', { name: 'Отправить сообщение' }))
		await expect(args.onSend).toHaveBeenCalledWith(
			expect.objectContaining({ text: '', attachments: [expect.objectContaining({ name: 'release-plan.txt', type: 'file' })] }),
		)
		await waitFor(() => expect(canvas.getByRole('button', { name: 'Скачать файл release-plan.txt' })).toBeInTheDocument())
	},
}
