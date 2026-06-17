/**
 * Unit-тесты для ChatPinnedPanel.
 * Панель закреплённых сообщений: навигация, открепление и превью текста.
 */

import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import ChatPinnedPanel from './ChatPinnedPanel.vue'
import type { ChatMessage } from '../../model/BaseChat.types'

function message(id: string, overrides: Partial<ChatMessage> = {}): ChatMessage {
	return { id, text: `Текст ${id}`, sender: 'other', time: '10:00', isPinned: true, ...overrides }
}

describe('ChatPinnedPanel unit', () => {
	it('не рендерится при пустом списке закрепов', () => {
		const { container } = render(ChatPinnedPanel, {
			props: { pinnedMessages: [], currentIndex: 0 },
		})
		expect(container.querySelector('.base-chat-pinned-panel')).not.toBeInTheDocument()
	})

	it('показывает текст текущего закрепа', () => {
		render(ChatPinnedPanel, {
			props: { pinnedMessages: [message('1', { text: 'Привет' })], currentIndex: 0 },
		})
		expect(screen.getByText('Привет')).toBeInTheDocument()
	})

	it('показывает счётчик при нескольких закрепах', () => {
		render(ChatPinnedPanel, {
			props: { pinnedMessages: [message('1'), message('2')], currentIndex: 0 },
		})
		expect(screen.getByText(/\(1 из 2\)/)).toBeInTheDocument()
	})

	it('эмитит click по сообщению при клике на панель', async () => {
		const { emitted } = render(ChatPinnedPanel, {
			props: { pinnedMessages: [message('1')], currentIndex: 0 },
		})
		await fireEvent.click(document.querySelector('.base-chat-pinned-panel__content')!)
		expect(emitted().click?.[0]).toEqual(['1'])
	})

	it('переключает на следующий закреп по кнопке', async () => {
		const { emitted } = render(ChatPinnedPanel, {
			props: { pinnedMessages: [message('1'), message('2')], currentIndex: 0 },
		})
		await fireEvent.click(screen.getByLabelText('Следующее закреплённое сообщение'))
		expect(emitted()['update:currentIndex']?.[0]).toEqual([1])
	})

	it('переключает на предыдущий закреп по кругу', async () => {
		const { emitted } = render(ChatPinnedPanel, {
			props: { pinnedMessages: [message('1'), message('2')], currentIndex: 0 },
		})
		await fireEvent.click(screen.getByLabelText('Предыдущее закреплённое сообщение'))
		expect(emitted()['update:currentIndex']?.[0]).toEqual([1])
	})

	it('показывает кнопку открепления администратору и эмитит unpin', async () => {
		const { emitted } = render(ChatPinnedPanel, {
			props: { pinnedMessages: [message('1')], currentIndex: 0, currentUserRole: 'admin' },
		})
		await fireEvent.click(screen.getByLabelText('Открепить сообщение'))
		expect(emitted().unpin?.[0]).toEqual(['1'])
	})

	it('скрывает кнопку открепления для обычного участника', () => {
		render(ChatPinnedPanel, {
			props: { pinnedMessages: [message('1')], currentIndex: 0, currentUserRole: 'member' },
		})
		expect(screen.queryByLabelText('Открепить сообщение')).not.toBeInTheDocument()
	})

	describe('превью с вложениями', () => {
		it('добавляет префикс «Фото» для изображения с текстом', () => {
			render(ChatPinnedPanel, {
				props: {
					pinnedMessages: [
						message('1', {
							text: 'подпись',
							attachments: [{ id: 'a', name: 'a.png', type: 'image', url: 'u' }],
						}),
					],
					currentIndex: 0,
				},
			})
			expect(screen.getByText('🖼️ Фото: подпись')).toBeInTheDocument()
		})

		it('показывает только префикс «Файл» без текста', () => {
			render(ChatPinnedPanel, {
				props: {
					pinnedMessages: [
						message('1', {
							text: '',
							attachments: [{ id: 'a', name: 'a.pdf', type: 'file', url: 'u' }],
						}),
					],
					currentIndex: 0,
				},
			})
			expect(screen.getByText('📎 Файл')).toBeInTheDocument()
		})
	})
})
