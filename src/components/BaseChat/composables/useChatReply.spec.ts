import { effectScope } from 'vue'

import type { ChatMessage } from '../BaseChat.types'
import { useChatReply } from './useChatReply'

function message(id: string): ChatMessage {
	return {
		id,
		text: `Сообщение ${id}`,
		sender: 'other',
		time: '10:00',
	}
}

function setup(): ReturnType<typeof useChatReply> {
	const scope = effectScope()
	return scope.run(() => useChatReply()) as ReturnType<typeof useChatReply>
}

describe('useChatReply unit', () => {
	it('stores message selected for reply', () => {
		const reply = setup()
		const selectedMessage = message('1')

		reply.handleMessageReply(selectedMessage)

		expect(reply.replyingTo.value).toStrictEqual(selectedMessage)
	})

	it('clears selected reply message', () => {
		const reply = setup()
		reply.handleMessageReply(message('1'))

		reply.handleCancelReply()

		expect(reply.replyingTo.value).toBeNull()
	})
})
