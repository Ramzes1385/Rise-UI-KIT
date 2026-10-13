import type { ComputedRef, Ref } from 'vue'
import type { ChatCommand, ChatMember, ChatMessage, ChatMessageAttachment } from '@components/BaseChat/types/BaseChat.types'

export interface UseChatInputStateOptions {
	props: {
		members?: ChatMember[]
		commands?: ChatCommand[]
		/** Сообщение, которое правят: поле заполняется его текстом, Enter отправляет `edit`, Escape отменяет */
		editingMessage?: ChatMessage | null
	}
	emit: {
		(event: 'send', payload: { text: string; attachments?: ChatMessageAttachment[] }): void
		(event: 'attach', files: FileList): void
		(event: 'edit', payload: { text: string }): void
		(event: 'cancel-edit'): void
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

/** Поле ввода чата как DOM-элемент */
export type ChatInputElement = HTMLInputElement | HTMLTextAreaElement

/** Текст после правки у каретки и новое положение каретки */
export interface ChatTextEdit {
	text: string
	caret: number
}

/** Состояние списков подсказок: какой показан, что ищем, какой пункт активен */
export interface ChatSuggestionState {
	showMentions: Ref<boolean>
	showCommands: Ref<boolean>
	mentionQuery: Ref<string>
	commandQuery: Ref<string>
	activeSuggestionIndex: Ref<number>
}

export interface UseChatSuggestionsOptions {
	props: UseChatInputStateOptions['props']
	text: Ref<string>
	getInputElement: () => ChatInputElement | null
}

/** Подсказки, по которым ходит клавиатура: списки, активный пункт и подстановка выбранного */
export interface ChatSuggestionKeysSource {
	showMentions: Ref<boolean>
	showCommands: Ref<boolean>
	activeSuggestionIndex: Ref<number>
	filteredMembers: ComputedRef<ChatMember[]>
	filteredCommands: ComputedRef<ChatCommand[]>
	replaceCurrentWord: (prefix: string, value: string) => string | null
}

export interface UseChatAttachmentsOptions {
	emit: UseChatInputStateOptions['emit']
	text: Ref<string>
}

/** Параметры режима правки: поле ввода, его текст и события */
export interface UseChatEditFieldOptions {
	props: UseChatInputStateOptions['props']
	emit: UseChatInputStateOptions['emit']
	text: Ref<string>
	getInputElement: () => ChatInputElement | null
}
