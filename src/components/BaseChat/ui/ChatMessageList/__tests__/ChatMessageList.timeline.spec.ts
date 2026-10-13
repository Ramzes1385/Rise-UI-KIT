import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { setLocale } from '@/locales/state'
import { UI_CHAT_TEXT } from '@/locales/messages'
import ChatMessageList from '../ui/ChatMessageList.vue'
import type { ChatMessage } from '../../../types/BaseChat.types'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'

const TODAY = new Date(2026, 2, 10, 15, 0)

function msg(id: string, overrides: Partial<ChatMessage> = {}): ChatMessage {
	return { id, text: `Текст ${id}`, sender: 'other', time: '10:00', ...overrides }
}

function mockMetrics(list: HTMLElement, metrics: { scrollHeight: () => number; clientHeight: number }): void {
	Object.defineProperty(list, 'scrollHeight', { configurable: true, get: metrics.scrollHeight })
	Object.defineProperty(list, 'clientHeight', { configurable: true, value: metrics.clientHeight })
	Object.defineProperty(list, 'scrollTop', { configurable: true, writable: true, value: 0 })
}

afterEach(() => {
	setLocale('ru')
})

describe('ChatMessageList: разделители', () => {
	it('показывает «Сегодня», «Вчера» и дату как разделители с доступными именами', () => {
		render(ChatMessageList, {
			props: {
				today: TODAY,
				messages: [
					msg('1', { createdAt: new Date(2026, 2, 5, 12) }),
					msg('2', { createdAt: new Date(2026, 2, 9, 12) }),
					msg('3', { createdAt: new Date(2026, 2, 10, 9) }),
				],
			},
		})

		const separators = screen.getAllByRole('separator')
		expect(separators.map(item => item.getAttribute('aria-label'))).toEqual([
			expect.stringMatching(/5 марта/),
			UI_CHAT_TEXT.YESTERDAY,
			UI_CHAT_TEXT.TODAY,
		])
		expect(screen.getByRole('separator', { name: UI_CHAT_TEXT.TODAY })).toBeInTheDocument()
	})

	it('сообщения без createdAt не получают разделителя дат', () => {
		render(ChatMessageList, { props: { today: TODAY, messages: [msg('1'), msg('2')] } })

		expect(screen.queryByRole('separator')).not.toBeInTheDocument()
	})

	it('подписи на английском', () => {
		setLocale('en')
		render(ChatMessageList, {
			props: {
				today: TODAY,
				lastReadMessageId: '1',
				messages: [msg('1', { createdAt: new Date(2026, 2, 10, 9) }), msg('2', { createdAt: new Date(2026, 2, 10, 10) })],
			},
		})

		expect(screen.getByRole('separator', { name: 'Today' })).toBeInTheDocument()
		expect(screen.getByRole('separator', { name: '1 unread message' })).toBeInTheDocument()
	})

	describe('непрочитанные', () => {
		it('разделитель «N непрочитанных» стоит перед первым чужим сообщением после прочитанного', () => {
			render(ChatMessageList, {
				props: { lastReadMessageId: '2', messages: [msg('1'), msg('2'), msg('3', { sender: 'me' }), msg('4'), msg('5')] },
			})

			const divider = screen.getByRole('separator', { name: '2 непрочитанных сообщения' })
			expect(divider).toHaveAttribute('data-chat-unread')
			expect(divider.nextElementSibling).toBe(document.getElementById('message-4'))
			expect(document.querySelectorAll('[data-chat-unread]')).toHaveLength(1)
		})

		it('не показывается, если lastReadMessageId не найден', () => {
			render(ChatMessageList, { props: { lastReadMessageId: 'нет', messages: [msg('1'), msg('2')] } })

			expect(screen.queryByRole('separator')).not.toBeInTheDocument()
		})

		it('не показывается, если после прочитанного нет чужих сообщений', () => {
			render(ChatMessageList, { props: { lastReadMessageId: '1', messages: [msg('1'), msg('2', { sender: 'me' })] } })

			expect(screen.queryByRole('separator')).not.toBeInTheDocument()
		})
	})
})

describe('ChatMessageList: загрузка и пустая лента', () => {
	it('isLoading показывает скелетон со статусом вместо сообщений', () => {
		render(ChatMessageList, { props: { isLoading: true, messages: [msg('1')] } })

		expect(screen.getByRole('status', { name: UI_CHAT_TEXT.LOADING_MESSAGES })).toBeInTheDocument()
		expect(screen.queryByText('Текст 1')).not.toBeInTheDocument()
	})

	it('при isLoading пустая лента не показывает заглушку «нет сообщений»', () => {
		render(ChatMessageList, { props: { isLoading: true, messages: [] } })

		expect(screen.queryByText(UI_CHAT_TEXT.EMPTY_TITLE)).not.toBeInTheDocument()
	})

	it('без загрузки пустая лента показывает компактную заглушку', () => {
		const { container } = render(ChatMessageList, { props: { messages: [] } })

		expect(screen.getByText(UI_CHAT_TEXT.EMPTY_TITLE)).toBeInTheDocument()
		expect(container.querySelector('.base-empty--compact')).toBeInTheDocument()
	})

	it('isLoadingMore показывает индикатор подгрузки при сохранённых сообщениях', () => {
		render(ChatMessageList, { props: { isLoadingMore: true, messages: [msg('1')] } })

		expect(screen.getByRole('status', { name: UI_CHAT_TEXT.LOADING_MORE })).toBeInTheDocument()
		expect(screen.getByText('Текст 1')).toBeInTheDocument()
	})

	it('без isLoadingMore индикатора подгрузки нет', () => {
		render(ChatMessageList, { props: { messages: [msg('1')] } })

		expect(screen.queryByRole('status', { name: UI_CHAT_TEXT.LOADING_MORE })).not.toBeInTheDocument()
	})
})

describe('ChatMessageList: подгрузка истории', () => {
	it('прокрутка к верху при hasMoreMessages отдаёт load-more', async () => {
		const { container, emitted } = render(ChatMessageList, { props: { hasMoreMessages: true, messages: [msg('1'), msg('2')] } })
		const list = container.querySelector('.base-chat-message-list') as HTMLElement
		mockMetrics(list, { scrollHeight: () => 2000, clientHeight: 400 })
		const before = (emitted()['load-more'] ?? []).length

		list.scrollTop = 30
		await fireEvent.scroll(list)

		expect((emitted()['load-more'] ?? []).length).toBe(before + 1)
	})

	it('вдали от верха load-more не отдаётся', async () => {
		const { container, emitted } = render(ChatMessageList, { props: { hasMoreMessages: true, messages: [msg('1'), msg('2')] } })
		const list = container.querySelector('.base-chat-message-list') as HTMLElement
		mockMetrics(list, { scrollHeight: () => 2000, clientHeight: 400 })
		const before = (emitted()['load-more'] ?? []).length

		list.scrollTop = 500
		await fireEvent.scroll(list)

		expect((emitted()['load-more'] ?? []).length).toBe(before)
	})

	it('пока идёт подгрузка (isLoadingMore) или нечего грузить, load-more не отдаётся', async () => {
		const loading = render(ChatMessageList, { props: { hasMoreMessages: true, isLoadingMore: true, messages: [msg('1')] } })
		const finished = render(ChatMessageList, { props: { hasMoreMessages: false, messages: [msg('1')] } })

		for (const view of [loading, finished]) {
			const list = view.container.querySelector('.base-chat-message-list') as HTMLElement
			mockMetrics(list, { scrollHeight: () => 2000, clientHeight: 400 })
			list.scrollTop = 0
			await fireEvent.scroll(list)
			expect(view.emitted()['load-more']).toBeUndefined()
		}
	})

	it('если сообщения не заполняют ленту, при монтировании сразу просит ещё', () => {
		const { emitted } = render(ChatMessageList, { props: { hasMoreMessages: true, messages: [msg('1')] } })

		expect(emitted()['load-more']).toHaveLength(1)
	})

	it('когда сверху добавились сообщения, положение читателя сохраняется', async () => {
		const { container, rerender } = render(ChatMessageList, {
			props: { messages: [msg('3'), msg('4'), msg('5'), msg('6')] },
		})
		const list = container.querySelector('.base-chat-message-list') as HTMLElement
		await nextTick()
		mockMetrics(list, { scrollHeight: () => list.querySelectorAll('.base-chat-message-list__item').length * 100, clientHeight: 100 })
		list.scrollTop = 30
		await fireEvent.scroll(list)

		await rerender({ messages: [msg('1'), msg('2'), msg('3'), msg('4'), msg('5'), msg('6')] })
		await waitFor(() => expect(list.scrollTop).toBe(230))
	})
})

describe('ChatMessageList: новые сообщения снизу', () => {
	async function setupScrolledUp() {
		const view = render(ChatMessageList, { props: { messages: [msg('1'), msg('2'), msg('3')] } })
		const list = view.container.querySelector('.base-chat-message-list') as HTMLElement
		await nextTick()
		mockMetrics(list, { scrollHeight: () => 1000, clientHeight: 400 })
		return { ...view, list }
	}

	it('читатель вверху: чужое сообщение даёт кнопку «Новые сообщения», лента не двигается', async () => {
		const { list, rerender } = await setupScrolledUp()
		list.scrollTop = 100
		await fireEvent.scroll(list)

		await rerender({ messages: [msg('1'), msg('2'), msg('3'), msg('4')] })

		expect(await screen.findByRole('button', { name: UI_CHAT_TEXT.NEW_MESSAGES })).toBeInTheDocument()
		expect(list.scrollTop).toBe(100)
	})

	it('кнопка «Новые сообщения» прокручивает к низу и исчезает', async () => {
		const { list, rerender } = await setupScrolledUp()
		list.scrollTop = 100
		await fireEvent.scroll(list)
		await rerender({ messages: [msg('1'), msg('2'), msg('3'), msg('4')] })

		await fireEvent.click(await screen.findByRole('button', { name: UI_CHAT_TEXT.NEW_MESSAGES }))

		await waitFor(() => expect(list.scrollTop).toBe(1000))
		expect(screen.queryByRole('button', { name: UI_CHAT_TEXT.NEW_MESSAGES })).not.toBeInTheDocument()
	})

	it('своё новое сообщение прокручивает к низу и кнопки не даёт', async () => {
		const { list, rerender } = await setupScrolledUp()
		list.scrollTop = 100
		await fireEvent.scroll(list)

		await rerender({ messages: [msg('1'), msg('2'), msg('3'), msg('4', { sender: 'me' })] })

		await waitFor(() => expect(list.scrollTop).toBe(1000))
		expect(screen.queryByRole('button', { name: UI_CHAT_TEXT.NEW_MESSAGES })).not.toBeInTheDocument()
	})

	it('читатель у низа: новое сообщение прокручивает ленту и кнопки нет', async () => {
		const { list, rerender } = await setupScrolledUp()
		list.scrollTop = 560
		await fireEvent.scroll(list)

		await rerender({ messages: [msg('1'), msg('2'), msg('3'), msg('4')] })

		await waitFor(() => expect(list.scrollTop).toBe(1000))
		expect(screen.queryByRole('button', { name: UI_CHAT_TEXT.NEW_MESSAGES })).not.toBeInTheDocument()
	})
})

describe('ChatMessageList: правка и открепление в меню', () => {
	function openMenu(container: Element): void {
		fireEvent.contextMenu(container.querySelector('.base-chat-message-list__bubble') as HTMLElement)
	}

	it('у своего сообщения с текстом есть «Изменить», и пункт отдаёт message-edit', async () => {
		const own = msg('1', { sender: 'me' })
		const { container, emitted } = render(ChatMessageList, { props: { messages: [own] } })

		openMenu(container)
		await fireEvent.click(await screen.findByRole('menuitem', { name: UI_CHAT_TEXT.EDIT }))

		expect(emitted()['message-edit']).toEqual([[own]])
		await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
	})

	it('у чужого сообщения «Изменить» нет', async () => {
		const { container } = render(ChatMessageList, { props: { messages: [msg('1')] } })

		openMenu(container)
		await screen.findByRole('menu')

		expect(screen.queryByRole('menuitem', { name: UI_CHAT_TEXT.EDIT })).not.toBeInTheDocument()
	})

	it('у своего сообщения без текста «Изменить» нет', async () => {
		const { container } = render(ChatMessageList, { props: { messages: [msg('1', { sender: 'me', text: '' })] } })

		openMenu(container)
		await screen.findByRole('menu')

		expect(screen.queryByRole('menuitem', { name: UI_CHAT_TEXT.EDIT })).not.toBeInTheDocument()
	})

	it('у закреплённого сообщения пункт «Открепить» отдаёт unpin-message, а не pin-message', async () => {
		const { container, emitted } = render(ChatMessageList, {
			props: { messages: [msg('1', { isPinned: true })], currentUserRole: 'admin' },
		})

		openMenu(container)
		await fireEvent.click(await screen.findByRole('menuitem', { name: UI_CHAT_TEXT.UNPIN }))

		expect(emitted()['unpin-message']).toEqual([['1']])
		expect(emitted()['pin-message']).toBeUndefined()
	})
})

describe('ChatMessage: пометка «изменено»', () => {
	it('показывается у изменённого сообщения', () => {
		render(ChatMessageList, { props: { messages: [msg('1', { isEdited: true })] } })

		expect(screen.getByText(UI_CHAT_TEXT.EDITED)).toBeInTheDocument()
	})

	it('не показывается у обычного сообщения', () => {
		render(ChatMessageList, { props: { messages: [msg('1')] } })

		expect(screen.queryByText(UI_CHAT_TEXT.EDITED)).not.toBeInTheDocument()
	})
})
