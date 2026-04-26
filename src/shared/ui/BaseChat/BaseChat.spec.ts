/**
 * Unit-тесты для BaseChat.
 * Проверяют рендер, пропсы и CSS-модификаторы.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'

import type { ChatMessage } from './BaseChat.types'
import BaseChat from './BaseChat.vue'

const MESSAGES: ChatMessage[] = [
	{ id: '1', text: 'Привет', sender: 'me' },
	{ id: '2', text: 'Как дела?', sender: 'other' },
]

describe('BaseChat unit', () => {
	describe('рендер', () => {
		it('должен рендерить чат', () => {
			const { container } = render(BaseChat, {
				props: { messages: MESSAGES },
			})

			expect(container.querySelector('.base-chat')).toBeInTheDocument()
		})

		it('должен рендерить сообщения', () => {
			render(BaseChat, {
				props: { messages: MESSAGES },
			})

			expect(screen.getByText('Привет')).toBeInTheDocument()
			expect(screen.getByText('Как дела?')).toBeInTheDocument()
		})

		it('должен рендерить пустое состояние когда нет сообщений', () => {
			render(BaseChat, {
				props: { messages: [] },
			})

			expect(screen.getByText('Нет сообщений')).toBeInTheDocument()
		})
	})

	describe('пропс variant', () => {
		it('должен применять модификатор --bubble по умолчанию', () => {
			const { container } = render(BaseChat, {
				props: { messages: MESSAGES },
			})

			expect(container.querySelector('.base-chat')?.classList.contains('base-chat--bubble')).toBe(true)
		})

		it('должен применять модификатор --modern когда variant=modern', () => {
			const { container } = render(BaseChat, {
				props: { messages: MESSAGES, variant: 'modern' },
			})

			expect(container.querySelector('.base-chat')?.classList.contains('base-chat--modern')).toBe(true)
		})
	})

	describe('пропс title', () => {
		it('должен рендерить заголовок когда передан', () => {
			render(BaseChat, {
				props: { messages: MESSAGES, title: 'Чат' },
			})

			expect(screen.getByText('Чат')).toBeInTheDocument()
		})
	})

	describe('модификаторы сообщений', () => {
		it('должен применять класс --me для своих сообщений', () => {
			const { container } = render(BaseChat, {
				props: { messages: MESSAGES },
			})

			expect(container.querySelector('.base-chat__message--me')).toBeInTheDocument()
		})

		it('должен применять класс --other для чужих сообщений', () => {
			const { container } = render(BaseChat, {
				props: { messages: MESSAGES },
			})

			expect(container.querySelector('.base-chat__message--other')).toBeInTheDocument()
		})
	})
})
