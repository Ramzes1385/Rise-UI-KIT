import type { ChatMessage } from '@components/BaseChat/model/BaseChat.types'

export interface UseChatSearchOptions {
	getMessages: () => ChatMessage[]
}
