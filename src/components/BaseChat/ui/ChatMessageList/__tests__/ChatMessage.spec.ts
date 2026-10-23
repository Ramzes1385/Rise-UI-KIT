import '@testing-library/jest-dom/vitest'
import { UI_CHAT_TEXT } from '@/locales/messages'
import { describe, expect, it, vi } from 'vitest'
import ChatMessageItem from '../ui/ChatMessage.vue'
import type { ChatMessage } from '../../../types/BaseChat.types'
import { fireEvent, render, screen, within } from '@testing-library/vue'

const BASE_MESSAGE: ChatMessage = {
	id: '1',
	text: 'Привет!',
	sender: 'other',
	time: '10:00',
	senderName: 'Анна',
	senderAvatar: 'a.png',
}

describe('ChatMessage', () => {
	it('должен рендерить текст сообщения', () => {
		render(ChatMessageItem, { props: { message: BASE_MESSAGE, sizeScale: 100 } })
		expect(screen.getByText('Привет!')).toBeInTheDocument()
	})

	it('должен рендерить имя отправителя в групповом чате', () => {
		render(ChatMessageItem, { props: { message: BASE_MESSAGE, sizeScale: 100, isGroup: true } })
		expect(screen.getByText('Анна')).toBeInTheDocument()
	})

	it('должен рендерить аватар для чужого сообщения', () => {
		const { container } = render(ChatMessageItem, { props: { message: BASE_MESSAGE, sizeScale: 100 } })
		expect(container.querySelector('.base-chat-message-list__avatar')).toBeInTheDocument()
	})

	it('не должен рендерить аватар для своего сообщения', () => {
		const { container } = render(ChatMessageItem, {
			props: { message: { ...BASE_MESSAGE, sender: 'me' }, sizeScale: 100 },
		})
		expect(container.querySelector('.base-chat-message-list__avatar')).not.toBeInTheDocument()
	})

	it('должен рендерить чекбокс в режиме выделения', () => {
		const { container } = render(ChatMessageItem, {
			props: { message: BASE_MESSAGE, sizeScale: 100, isSelectionMode: true },
		})
		expect(container.querySelector('.base-chat-message-list__checkbox-wrapper')).toBeInTheDocument()
	})

	it('должен эмитить select при клике на сообщение в режиме выделения', async () => {
		const { emitted } = render(ChatMessageItem, {
			props: { message: BASE_MESSAGE, sizeScale: 100, isSelectionMode: true },
		})
		const item = screen.getByText('Привет!').closest('.base-chat-message-list__item')
		await fireEvent.click(item!)
		expect(emitted().select).toHaveLength(1)
	})

	it('должен эмитить avatar-click при клике по аватару', async () => {
		const { container, emitted } = render(ChatMessageItem, { props: { message: BASE_MESSAGE, sizeScale: 100 } })
		const avatar = container.querySelector('.base-chat-message-list__avatar')
		await fireEvent.click(avatar!)
		expect(emitted()['avatar-click']).toHaveLength(1)
	})

	it('должен эмитить reply-action при клике по кнопке ответа', async () => {
		const { emitted } = render(ChatMessageItem, { props: { message: BASE_MESSAGE, sizeScale: 100 } })
		const replyBtn = screen.getByLabelText('Ответить на сообщение')
		await fireEvent.click(replyBtn)
		expect(emitted()['reply-action']).toHaveLength(1)
	})

	it('должен рендерить цитату', () => {
		const { container } = render(ChatMessageItem, {
			props: {
				message: {
					...BASE_MESSAGE,
					replyToId: '42',
					replyToSenderName: 'Петр',
					replyToText: 'Оригинал',
				},
				sizeScale: 100,
			},
		})
		expect(container.querySelector('.base-chat-message-list__reply-quote')).toBeInTheDocument()
		expect(screen.getByText('Оригинал')).toBeInTheDocument()
	})

	it('должен рендерить реакции', () => {
		const { container } = render(ChatMessageItem, {
			props: {
				message: {
					...BASE_MESSAGE,
					reactions: [{ emoji: '👍', users: ['me', 'other'] }],
				},
				sizeScale: 100,
			},
		})
		expect(container.querySelector('.base-chat-message-list__reactions-display')).toBeInTheDocument()
	})

	it('должен рендерить статус прочтения для своего сообщения', () => {
		const { container } = render(ChatMessageItem, {
			props: { message: { ...BASE_MESSAGE, sender: 'me', status: 'read' }, sizeScale: 100 },
		})
		expect(container.querySelector('.base-chat-message-list__status-wrapper--read')).toBeInTheDocument()
	})

	it('должен рендерить иконку закрепления', () => {
		const { container } = render(ChatMessageItem, {
			props: { message: { ...BASE_MESSAGE, isPinned: true }, sizeScale: 100 },
		})
		expect(container.querySelector('.base-chat-message-list__pin-icon')).toBeInTheDocument()
	})

	describe('статус «не отправлено»', () => {
		const failed: ChatMessage = { ...BASE_MESSAGE, sender: 'me', status: 'failed' }

		it('показывает группу «Не отправлено» с оповещением и кнопками', () => {
			render(ChatMessageItem, { props: { message: failed, sizeScale: 100 } })

			const group = screen.getByRole('group', { name: UI_CHAT_TEXT.STATUS_FAILED })
			expect(group).toHaveTextContent(UI_CHAT_TEXT.STATUS_FAILED)
			expect(within(group).queryByRole('status')).not.toBeInTheDocument()
			expect(within(group).getByRole('button', { name: UI_CHAT_TEXT.RETRY_ARIA })).toHaveTextContent(UI_CHAT_TEXT.RETRY)
			expect(within(group).getByRole('button', { name: UI_CHAT_TEXT.DISCARD_ARIA })).toHaveTextContent(UI_CHAT_TEXT.DELETE)
		})

		it('«Повторить» эмитит retry', async () => {
			const { emitted } = render(ChatMessageItem, { props: { message: failed, sizeScale: 100 } })

			await fireEvent.click(screen.getByRole('button', { name: UI_CHAT_TEXT.RETRY_ARIA }))

			expect(emitted().retry).toHaveLength(1)
			expect(emitted().discard).toBeUndefined()
		})

		it('«Удалить» эмитит discard', async () => {
			const { emitted } = render(ChatMessageItem, { props: { message: failed, sizeScale: 100 } })

			await fireEvent.click(screen.getByRole('button', { name: UI_CHAT_TEXT.DISCARD_ARIA }))

			expect(emitted().discard).toHaveLength(1)
			expect(emitted().retry).toBeUndefined()
		})

		it('прячет панель действий и значок статуса доставки', () => {
			const { container } = render(ChatMessageItem, { props: { message: failed, sizeScale: 100 } })

			expect(screen.queryByRole('group', { name: UI_CHAT_TEXT.MESSAGE_ACTIONS })).toBeNull()
			expect(container.querySelector('.base-chat-message-list__status-wrapper')).toBeNull()
		})

		it('не открывает контекстное меню', async () => {
			const { container, emitted } = render(ChatMessageItem, { props: { message: failed, sizeScale: 100 } })

			await fireEvent.contextMenu(container.querySelector('.base-chat-message-list__bubble')!)

			expect(emitted()['context-menu']).toBeUndefined()
		})

		it('у обычного сообщения контекстное меню открывается, блока ошибки нет', async () => {
			const { container, emitted } = render(ChatMessageItem, {
				props: { message: { ...BASE_MESSAGE, sender: 'me', status: 'sent' }, sizeScale: 100 },
			})

			await fireEvent.contextMenu(container.querySelector('.base-chat-message-list__bubble')!)

			expect(emitted()['context-menu']).toHaveLength(1)
			expect(screen.queryByRole('group', { name: UI_CHAT_TEXT.STATUS_FAILED })).toBeNull()
		})

		it('«Другие действия» открывает меню под кнопкой и передаёт верх кнопки для переворота вверх', async () => {
			const { emitted } = render(ChatMessageItem, {
				props: { message: { ...BASE_MESSAGE, sender: 'me', status: 'sent' }, sizeScale: 100 },
			})
			const more = screen.getByRole('button', { name: UI_CHAT_TEXT.MORE_ACTIONS_ARIA })
			vi.spyOn(more, 'getBoundingClientRect').mockReturnValue(new DOMRect(30, 200, 24, 24))

			await fireEvent.click(more)

			const [event] = emitted()['context-menu'][0] as [MouseEvent & { anchorTop?: number }]
			expect(event.clientX).toBe(30)
			expect(event.clientY).toBe(228)
			expect(event.anchorTop).toBe(196)
		})

		it('чужое сообщение со статусом failed блока ошибки не показывает', () => {
			render(ChatMessageItem, { props: { message: { ...BASE_MESSAGE, status: 'failed' }, sizeScale: 100 } })

			expect(screen.queryByRole('group', { name: UI_CHAT_TEXT.STATUS_FAILED })).toBeNull()
			expect(screen.getByRole('group', { name: UI_CHAT_TEXT.MESSAGE_ACTIONS })).toBeInTheDocument()
		})
	})
})
