import '@testing-library/jest-dom/vitest'
import { mount } from '@vue/test-utils'
import BaseChat from '../ui/BaseChat.vue'
import ChatInput from '../ui/ChatInput/ChatInput.vue'
import type { ChatMessage } from '../types/BaseChat.types'
import { fireEvent, render, screen } from '@testing-library/vue'
import type { VoiceRecording } from '@components/BaseVoiceRecorder'
import { installRecorderEnvironment, removeRecorderEnvironment } from '@components/BaseVoiceRecorder/__tests__/recorder.test-utils'

const VOICE: ChatMessage = {
	id: 'v1',
	sender: 'other',
	text: '',
	time: '09:41',
	attachments: [
		{ id: 'a1', name: 'voice.webm', type: 'audio', url: '/voice.webm', duration: 9, peaks: [0.5, 1] },
		{ id: 'a2', name: 'notes.pdf', type: 'file', url: '/notes.pdf', size: '1 МБ' },
	],
}

describe('BaseChat: голосовые сообщения', () => {
	afterEach(() => {
		removeRecorderEnvironment()
	})

	it('пустое поле — микрофон вместо «Отправить»; с текстом — снова «Отправить»; без hasVoice микрофона нет', async () => {
		const { rerender } = render(ChatInput, { props: { hasVoice: true } })
		expect(screen.getByRole('button', { name: 'Записать голосовое сообщение' })).toBeInTheDocument()
		await fireEvent.update(screen.getByPlaceholderText('Напишите сообщение...'), 'Привет')
		expect(screen.queryByRole('button', { name: 'Записать голосовое сообщение' })).not.toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Отправить сообщение' })).toBeEnabled()
		await rerender({ hasVoice: false })
		await fireEvent.update(screen.getByPlaceholderText('Напишите сообщение...'), '')
		expect(screen.queryByRole('button', { name: 'Записать голосовое сообщение' })).not.toBeInTheDocument()
	})

	it('микрофон сразу начинает запись в поле ввода; «Отправить» отдаёт send-voice и возвращает поле', async () => {
		const env = installRecorderEnvironment()
		const { emitted } = render(ChatInput, { props: { hasVoice: true } })
		await fireEvent.click(screen.getByRole('button', { name: 'Записать голосовое сообщение' }))
		await vi.waitFor(() => expect(screen.getByRole('button', { name: 'Остановить запись' })).toBeEnabled())
		expect(env.getUserMedia).toHaveBeenCalledOnce()
		expect(screen.queryByPlaceholderText('Напишите сообщение...')).not.toBeInTheDocument()
		await fireEvent.click(screen.getByRole('button', { name: 'Остановить запись' }))
		await fireEvent.click(screen.getByRole('button', { name: 'Отправить' }))
		expect((emitted('send-voice') as Array<[VoiceRecording]>)[0][0]).toMatchObject({ mimeType: 'audio/webm;codecs=opus' })
		expect(screen.getByPlaceholderText('Напишите сообщение...')).toBeInTheDocument()
	})

	it('отмена записи возвращает поле; ошибка доступа — текст и «Закрыть»', async () => {
		const env = installRecorderEnvironment()
		render(ChatInput, { props: { hasVoice: true } })
		await fireEvent.click(screen.getByRole('button', { name: 'Записать голосовое сообщение' }))
		await vi.waitFor(() => expect(screen.getByRole('button', { name: 'Отменить запись' })).toBeInTheDocument())
		await fireEvent.click(screen.getByRole('button', { name: 'Отменить запись' }))
		expect(screen.getByPlaceholderText('Напишите сообщение...')).toBeInTheDocument()

		env.getUserMedia.mockRejectedValueOnce(new DOMException('no', 'NotAllowedError'))
		await fireEvent.click(screen.getByRole('button', { name: 'Записать голосовое сообщение' }))
		await vi.waitFor(() => expect(screen.getByText('Нет доступа к микрофону. Разрешите его в настройках браузера')).toBeInTheDocument())
		await fireEvent.click(screen.getByRole('button', { name: 'Закрыть' }))
		expect(screen.getByPlaceholderText('Напишите сообщение...')).toBeInTheDocument()
	})

	it('BaseChat: send-voice с replyToId; аудиовложение играет в плеере, а не в списке файлов', async () => {
		installRecorderEnvironment()
		const wrapper = mount(BaseChat, { props: { title: 'Анна', messages: [VOICE], hasVoiceMessages: true }, attachTo: document.body })
		expect(wrapper.find('[role="group"][aria-label="Голосовое сообщение"]').exists()).toBe(true)
		expect(wrapper.findAll('.base-chat-message-list__attached-file')).toHaveLength(1)
		const recording = { blob: new Blob(['x']), mimeType: 'audio/webm', duration: 2, peaks: [1] }
		wrapper.findComponent(ChatInput).vm.$emit('send-voice', recording)
		expect(wrapper.emitted('send-voice')).toEqual([[{ recording, replyToId: undefined }]])
		wrapper.unmount()
	})
})
