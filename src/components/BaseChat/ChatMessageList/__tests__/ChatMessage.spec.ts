/**
 * Unit-тесты для компонента ChatMessage.
 * Проверяют рендеринг сообщения, аватара, реакций, статусов и событий.
 */

import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import type { ChatMessage } from '../../model/BaseChat.types'
import ChatMessageItem from '../ui/ChatMessage.vue'

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
})
