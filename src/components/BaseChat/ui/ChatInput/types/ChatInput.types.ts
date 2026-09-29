import type { VoiceRecording } from '@components/BaseVoiceRecorder'
import type { ChatCommand, ChatMember, ChatMessage, ChatMessageAttachment } from '../../../types/BaseChat.types'

export interface ChatInputProps {
	/** Масштаб размера */
	sizeScale?: number
	/** Сообщение, на которое пишется ответ */
	replyingTo?: ChatMessage | null
	/** Панель быстрых ответов */
	quickReplies?: string[]
	/** Список участников для упоминаний */
	members?: ChatMember[]
	/** Список доступных команд чата */
	commands?: ChatCommand[]
	/** Является ли чат групповым */
	isGroup?: boolean
	/** Кнопка записи голосового сообщения, пока поле пустое */
	hasVoice?: boolean
	/** Источник звука вместо микрофона для BaseVoiceRecorder */
	requestVoiceStream?: () => Promise<MediaStream>
}

export interface ChatInputEmits {
	(event: 'send', payload: { text: string; attachments?: ChatMessageAttachment[] }): void
	(event: 'attach', files: FileList): void
	(event: 'send-voice', recording: VoiceRecording): void
	(event: 'cancel-reply'): void
	(event: 'quick-reply', text: string): void
}
