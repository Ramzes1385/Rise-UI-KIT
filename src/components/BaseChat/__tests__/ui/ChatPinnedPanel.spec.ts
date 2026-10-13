import '@testing-library/jest-dom/vitest'
import type { ChatMessage } from '../../types/BaseChat.types'
import { fireEvent, render, screen } from '@testing-library/vue'
import ChatPinnedPanel from '../../ui/ChatPinnedPanel/ChatPinnedPanel.vue'

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

	describe('индекс вне списка (CHAT-6)', () => {
		it('индекс больше длины показывает последний закреп и счётчик «2 из 2», а не «3 из 2»', () => {
			render(ChatPinnedPanel, {
				props: { pinnedMessages: [message('1', { text: 'Первый' }), message('2', { text: 'Второй' })], currentIndex: 2 },
			})

			expect(screen.getByText(/\(2 из 2\)/)).toBeInTheDocument()
			expect(screen.queryByText(/3 из 2/)).not.toBeInTheDocument()
			expect(screen.getByText('Второй')).toBeInTheDocument()
		})

		it('отрицательный индекс показывает первый закреп', () => {
			render(ChatPinnedPanel, {
				props: { pinnedMessages: [message('1', { text: 'Первый' }), message('2', { text: 'Второй' })], currentIndex: -4 },
			})

			expect(screen.getByText(/\(1 из 2\)/)).toBeInTheDocument()
			expect(screen.getByText('Первый')).toBeInTheDocument()
		})

		it('переходы считаются от показанного закрепа, а не от выходящего за список индекса', async () => {
			const { emitted } = render(ChatPinnedPanel, {
				props: { pinnedMessages: [message('1'), message('2')], currentIndex: 5 },
			})

			await fireEvent.click(screen.getByLabelText('Следующее закреплённое сообщение'))
			await fireEvent.click(screen.getByLabelText('Предыдущее закреплённое сообщение'))

			expect(emitted()['update:currentIndex']).toEqual([[0], [0]])
		})

		it('клик по панели ведёт к показанному закрепу', async () => {
			const { emitted } = render(ChatPinnedPanel, {
				props: { pinnedMessages: [message('1'), message('2')], currentIndex: 9 },
			})

			await fireEvent.click(document.querySelector('.base-chat-pinned-panel__content')!)

			expect(emitted().click?.[0]).toEqual(['2'])
		})
	})
})
