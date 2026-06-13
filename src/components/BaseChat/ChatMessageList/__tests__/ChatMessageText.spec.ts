/**
 * Unit-тесты для компонента ChatMessageText.
 * Проверяют рендеринг текста, ссылок, упоминаний, команд и подсветку поиска.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import ChatMessageText from '../ui/ChatMessageText.vue'

describe('ChatMessageText', () => {
	it('должен рендерить обычный текст', () => {
		render(ChatMessageText, {
			props: { text: 'Привет мир', sizeScale: 100 },
		})
		expect(screen.getByText('Привет мир')).toBeInTheDocument()
	})

	it('должен рендерить ссылку кликабельной', () => {
		render(ChatMessageText, {
			props: { text: 'Смотри https://example.com', sizeScale: 100 },
		})
		const link = screen.getByRole('link', { name: 'https://example.com' })
		expect(link).toHaveAttribute('href', 'https://example.com')
		expect(link).toHaveAttribute('target', '_blank')
	})

	it('должен рендерить @упоминание и эмитить mention-click без @', async () => {
		const { emitted } = render(ChatMessageText, {
			props: { text: 'Привет @Анна', sizeScale: 100 },
		})
		const mention = screen.getByRole('button', { name: '@Анна' })
		await userEvent.click(mention)
		expect(emitted()['mention-click']).toHaveLength(1)
		expect(emitted()['mention-click'][0]).toEqual(['Анна'])
	})

	it('должен рендерить /команду и эмитить command-click без /', async () => {
		const { emitted } = render(ChatMessageText, {
			props: { text: '/help', sizeScale: 100 },
		})
		const command = screen.getByRole('button', { name: '/help' })
		await userEvent.click(command)
		expect(emitted()['command-click']).toHaveLength(1)
		expect(emitted()['command-click'][0]).toEqual(['help'])
	})

	it('должен подсвечивать совпадения searchQuery', () => {
		render(ChatMessageText, {
			props: { text: 'Привет мир', sizeScale: 100, searchQuery: 'мир' },
		})
		expect(screen.getByText('мир')).toHaveClass('base-chat-message-list__highlight')
	})
})
