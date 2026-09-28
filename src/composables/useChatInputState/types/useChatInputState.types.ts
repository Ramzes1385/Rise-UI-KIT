import type { ChatCommand, ChatMember, ChatMessageAttachment } from '@components/BaseChat/types/BaseChat.types'

export interface UseChatInputStateOptions {
	props: {
		members?: ChatMember[]
		commands?: ChatCommand[]
	}
	emit: {
		(event: 'send', payload: { text: string; attachments?: ChatMessageAttachment[] }): void
		(event: 'attach', files: FileList): void
	}
}

/** Поле ввода чата: однострочное поле (BaseInput) или textarea с авто-высотой */
export interface BaseInputExposed {
	inputRef: HTMLInputElement | HTMLTextAreaElement | null
}

/** Список подсказок у поля: участники после @ или команды после / */
export interface SuggestionList {
	items: { name: string }[]
	prefix: string
	/** Показан ли список: Escape его закрывает */
	isShown: { value: boolean }
}
