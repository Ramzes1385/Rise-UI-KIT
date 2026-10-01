import { ref } from 'vue'
import { useChatActions } from '../useChatActions'
import type { MessageListExposed, UseChatActionsOptions } from '../types/useChatActions.types'
import type { ChatMessage, ChatMessageAttachment } from '@components/BaseChat/types/BaseChat.types'

function setup(overrides: Partial<UseChatActionsOptions> = {}) {
	const emit = vi.fn()
	const scrollToMessage = vi.fn<(messageId: string) => void>()
	const options: UseChatActionsOptions = {
		emit: emit as unknown as UseChatActionsOptions['emit'],
		replyingTo: ref<ChatMessage | null>(null),
		getAvatar: () => 'avatar.png',
		messageListRef: ref<MessageListExposed | null>({ scrollToMessage }),
		handleAvatarClick: vi.fn<(senderId: string) => void>(),
		handleCancelReply: vi.fn<() => void>(),
		...overrides,
	}
	return { actions: useChatActions(options), emit, options, scrollToMessage }
}

const file: ChatMessageAttachment = { id: 'f1', name: 'report.pdf', type: 'file', url: 'https://example.com/report.pdf' }

describe('useChatActions', () => {
	it('открывает «Информацию» по аватару в шапке, если она есть', () => {
		const openInfo = vi.fn<() => void>()
		const { actions, options } = setup({ openInfo })

		actions.handleHeaderAvatarClick()

		expect(openInfo).toHaveBeenCalledOnce()
		expect(options.handleAvatarClick).not.toHaveBeenCalled()
	})

	it('без «Информации» аватар в шапке открывает профиль по аватару', () => {
		const { actions, options } = setup()

		actions.handleHeaderAvatarClick()

		expect(options.handleAvatarClick).toHaveBeenCalledWith('avatar.png')
	})

	it('без аватара шапки передаёт пустую строку', () => {
		const { actions, options } = setup({ getAvatar: () => undefined })

		actions.handleHeaderAvatarClick()

		expect(options.handleAvatarClick).toHaveBeenCalledWith('')
	})

	it('клик по цитате прокручивает ленту к исходному сообщению', () => {
		const { actions, scrollToMessage } = setup()

		actions.handleReplyClick('m1')

		expect(scrollToMessage).toHaveBeenCalledWith('m1')
	})

	it('клик по цитате без ленты ничего не ломает', () => {
		const { actions } = setup({ messageListRef: ref(null) })

		expect(() => actions.handleReplyClick('m1')).not.toThrow()
	})

	it('отправка без ответа шлёт текст без replyToId и сбрасывает ответ', () => {
		const { actions, emit, options } = setup()

		actions.handleSend({ text: 'Привет' })

		expect(emit).toHaveBeenCalledWith('send', { text: 'Привет', replyToId: undefined })
		expect(options.handleCancelReply).toHaveBeenCalledOnce()
	})

	it('отправка в ответ на сообщение передаёт его id', () => {
		const replyingTo = ref<ChatMessage | null>({ id: 'm7', text: 'Вопрос', sender: 'other', time: '10:00' })
		const { actions, emit } = setup({ replyingTo })

		actions.handleSend({ text: 'Ответ', attachments: [file] })

		expect(emit).toHaveBeenCalledWith('send', { text: 'Ответ', attachments: [file], replyToId: 'm7' })
	})

	it('скачивание файла отдаёт событие download-file', () => {
		const { actions, emit } = setup()

		actions.handleDownloadFile(file)

		expect(emit).toHaveBeenCalledWith('download-file', file)
	})

	it.each([
		['handleAttach', 'attach', 'files'],
		['handleMessageReaction', 'message-reaction', { messageId: 'm1', emoji: '👍' }],
		['handleQuickReply', 'quick-reply', 'Да'],
		['handlePin', 'pin-message', 'm1'],
		['handleUnpin', 'unpin-message', 'm1'],
		['handleWriteMessage', 'avatar-click', 'u1'],
		['handleKickMember', 'kick-member', 'u1'],
		['handleBanMember', 'ban-member', { memberId: 'u1', reason: 'спам', warningsCount: 2 }],
		['handleUpdateMemberRole', 'update-member-role', { memberId: 'u1', role: 'admin' }],
		['handleMentionClick', 'mention-click', '@anna'],
		['handleCommandClick', 'command-click', '/help'],
	] as const)('%s отдаёт событие %s', (handler, event, payload) => {
		const { actions, emit } = setup()

		;(actions[handler] as (value: unknown) => void)(payload)

		expect(emit).toHaveBeenCalledWith(event, payload)
	})
})
