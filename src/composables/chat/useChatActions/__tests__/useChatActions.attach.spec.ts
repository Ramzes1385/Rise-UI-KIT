import { ref } from 'vue'
import { useChatActions } from '../useChatActions'
import type { MessageListExposed, UseChatActionsOptions } from '../types/useChatActions.types'
import type { ChatAttachmentRejection, ChatMessage } from '@components/BaseChat/types/BaseChat.types'

function setup() {
	const emit = vi.fn()
	const options: UseChatActionsOptions = {
		emit: emit as unknown as UseChatActionsOptions['emit'],
		replyingTo: ref<ChatMessage | null>(null),
		getAvatar: () => 'avatar.png',
		messageListRef: ref<MessageListExposed | null>(null),
		handleAvatarClick: vi.fn<(senderId: string) => void>(),
		handleCancelReply: vi.fn<() => void>(),
		editingMessage: ref<ChatMessage | null>(null),
		handleCancelEdit: vi.fn<() => void>(),
		isAutoDownload: () => true,
	}
	return { actions: useChatActions(options), emit }
}

describe('useChatActions: handleAttachError', () => {
	it('эмитит error с типом attachment, склеенными сообщениями и отказами в detail', () => {
		const { actions, emit } = setup()
		const rejections: ChatAttachmentRejection[] = [
			{ name: 'a.pdf', reason: 'type', message: 'Неверный формат a.pdf' },
			{ name: 'b.txt', reason: 'count', message: 'Лимит' },
			{ name: 'c.txt', reason: 'count', message: 'Лимит' },
		]

		actions.handleAttachError(rejections)

		expect(emit).toHaveBeenCalledWith('error', {
			type: 'attachment',
			message: 'Неверный формат a.pdf. Лимит',
			detail: rejections,
		})
	})
})
