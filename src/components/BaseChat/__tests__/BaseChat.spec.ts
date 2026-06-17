/**
 * Unit-тесты для BaseChat.
 * Проверяют рендер, пропсы и базовую структуру.
 */

import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import BaseChat from '../ui/BaseChat.vue'
import type { ChatMessage } from '../model/BaseChat.types'

const MOCK_MESSAGES: ChatMessage[] = [
	{
		id: '1',
		text: 'Привет! Как дела?',
		sender: 'other',
		time: '10:00',
		senderName: 'Анна',
		senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
	},
	{
		id: '2',
		text: 'Привет! Всё отлично, спасибо!',
		sender: 'me',
		time: '10:01',
		status: 'read',
	},
]

describe('BaseChat unit', () => {
	describe('рендер', () => {
		it('должен корректно рендерить чат', () => {
			const { container } = render(BaseChat, {
				props: {
					messages: MOCK_MESSAGES,
					title: 'Чат с Анной',
				},
			})

			expect(container.querySelector('.base-chat')).toBeInTheDocument()
		})

		it('должен отображать заголовок и подзаголовок чата', () => {
			render(BaseChat, {
				props: {
					messages: MOCK_MESSAGES,
					title: 'Чат с Анной',
					subtitle: 'В сети',
				},
			})

			expect(screen.getAllByText('Чат с Анной')[0]).toBeInTheDocument()
			expect(screen.getAllByText('В сети')[0]).toBeInTheDocument()
		})

		it('должен отображать сообщения', () => {
			render(BaseChat, {
				props: {
					messages: MOCK_MESSAGES,
					title: 'Чат с Анной',
				},
			})

			expect(screen.getByText('Привет! Как дела?')).toBeInTheDocument()
			expect(screen.getByText('Привет! Всё отлично, спасибо!')).toBeInTheDocument()
		})

		it('должен отображать индикатор печатания в шапке, когда isTyping установлен в true', () => {
			const { container } = render(BaseChat, {
				props: {
					messages: MOCK_MESSAGES,
					title: 'Чат с Анной',
					isTyping: true,
					typingUsername: 'Анна',
				},
			})

			expect(container.querySelector('.base-chat-header__typing')).toBeInTheDocument()
		})
	})

	describe('пропсы', () => {
		it('должен применять кастомную высоту', () => {
			const { container } = render(BaseChat, {
				props: {
					messages: MOCK_MESSAGES,
					title: 'Чат с Анной',
					height: '600px',
				},
			})

			const chatEl = container.querySelector('.base-chat') as HTMLElement
			expect(chatEl.style.height).toBe('600px')
		})

		it('должен применять масштаб размера', () => {
			const { container } = render(BaseChat, {
				props: {
					messages: MOCK_MESSAGES,
					title: 'Чат с Анной',
					sizeScale: 120,
				},
			})

			const chatEl = container.querySelector('.base-chat') as HTMLElement
			expect(chatEl.style.getPropertyValue('--size-scale')).toBe('1.2')
		})

		it('должен применять класс варианта', () => {
			const { container } = render(BaseChat, {
				props: {
					messages: MOCK_MESSAGES,
					title: 'Чат с Анной',
					variant: 'modern',
				},
			})

			const chatEl = container.querySelector('.base-chat')
			expect(chatEl).toHaveClass('base-chat--modern')
		})
	})

	describe('подтверждение удаления', () => {
		function openContextMenu(container: Element, index = 1): void {
			const bubble = container.querySelectorAll('.base-chat-message-list__bubble')[index] as HTMLElement
			fireEvent.contextMenu(bubble)
		}

		it('не показывает окно подтверждения по умолчанию', () => {
			render(BaseChat, { props: { messages: MOCK_MESSAGES, title: 'Чат' } })
			expect(screen.queryByText('Удалить сообщения?')).toBeNull()
		})

		it('открывает окно подтверждения при удалении из контекстного меню и не эмитит сразу', async () => {
			const { container, emitted } = render(BaseChat, { props: { messages: MOCK_MESSAGES, title: 'Чат' } })

			openContextMenu(container, 1)
			await fireEvent.click(await screen.findByText('Удалить'))

			expect(screen.getByText('Удалить сообщения?')).toBeInTheDocument()
			expect(emitted()['delete-messages']).toBeUndefined()
		})

		it('эмитит delete-messages с корректным id после подтверждения', async () => {
			const { container, emitted } = render(BaseChat, { props: { messages: MOCK_MESSAGES, title: 'Чат' } })

			openContextMenu(container, 1)
			await fireEvent.click(await screen.findByText('Удалить'))

			const confirmBtn = container.querySelector('.base-chat__confirm-delete-btn') as HTMLElement
			await fireEvent.click(confirmBtn)

			const events = emitted()['delete-messages'] as Array<[string[]]>
			expect(events[0][0]).toEqual(['2'])
			expect(screen.queryByText('Удалить сообщения?')).toBeNull()
		})

		it('не эмитит delete-messages если удаление отменено крестиком', async () => {
			const { container, emitted } = render(BaseChat, { props: { messages: MOCK_MESSAGES, title: 'Чат' } })

			openContextMenu(container, 1)
			await fireEvent.click(await screen.findByText('Удалить'))

			const closeBtn = container.querySelector('.base-modal__close') as HTMLElement
			await fireEvent.click(closeBtn)

			expect(emitted()['delete-messages']).toBeUndefined()
			expect(screen.queryByText('Удалить сообщения?')).toBeNull()
		})

		it('показывает текст для одного сообщения', async () => {
			const { container } = render(BaseChat, { props: { messages: MOCK_MESSAGES, title: 'Чат' } })

			openContextMenu(container, 1)
			await fireEvent.click(await screen.findByText('Удалить'))

			expect(screen.getByText(/это сообщение/)).toBeInTheDocument()
		})
	})
})
