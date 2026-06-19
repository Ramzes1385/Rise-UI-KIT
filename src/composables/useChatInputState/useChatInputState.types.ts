import type { ChatCommand, ChatMember, ChatMessageAttachment } from '@components/BaseChat/model/BaseChat.types'

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

export interface BaseInputExposed {
	inputRef: HTMLInputElement | null
}
