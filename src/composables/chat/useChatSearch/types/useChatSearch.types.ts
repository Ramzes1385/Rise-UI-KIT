import type { ChatMessage } from '@components/BaseChat/types/BaseChat.types'

export interface UseChatSearchOptions {
	getMessages: () => ChatMessage[]
}
