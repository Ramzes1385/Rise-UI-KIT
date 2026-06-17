/**
 * Integration-тесты для BaseChat.
 * Проверяют сквозное взаимодействие composed-подкомпонентов (ChatInput,
 * ChatMessageList, ChatSelectionToolbar) и проброс событий наружу через
 * публичный API BaseChat.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen } from '@testing-library/vue'
import { afterEach, beforeEach, vi } from 'vitest'

import type { ChatMember, ChatMessage } from '../model/BaseChat.types'
import BaseChat from '../ui/BaseChat.vue'

const MESSAGES: ChatMessage[] = [
	{ id: '1', text: 'Привет!', sender: 'other', time: '10:00', senderName: 'Анна' },
	{ id: '2', text: 'Здравствуйте', sender: 'me', time: '10:01', status: 'read' },
]

const GROUP_MEMBERS: ChatMember[] = [
	{ id: 'a1', name: 'Анна', role: 'admin', status: 'online' },
	{ id: 'm1', name: 'Борис', role: 'member', status: 'offline' },
]

function renderChat(props: Partial<InstanceType<typeof BaseChat>['$props']> = {}) {
	return render(BaseChat, {
		props: {
			messages: MESSAGES,
			title: 'Чат с Анной',
			...props,
		},
	})
}

describe('BaseChat integration', () => {
	describe('отправка сообщения', () => {
		it('должен эмитить send с введённым текстом при клике на кнопку отправки', async () => {
			const user = userEvent.setup()
			const { emitted } = renderChat()

			await user.type(screen.getByPlaceholderText('Напишите сообщение...'), 'Как дела?')
			await user.click(screen.getByRole('button', { name: 'Отправить сообщение' }))

			const sendEvents = emitted().send as Array<[{ text: string }]>
			expect(sendEvents).toBeTruthy()
			expect(sendEvents[0][0].text).toBe('Как дела?')
		})

		it('не должен эмитить send при пустом поле ввода', async () => {
			const user = userEvent.setup()
			const { emitted } = renderChat()

			await user.click(screen.getByRole('button', { name: 'Отправить сообщение' }))

			expect(emitted().send).toBeUndefined()
		})
	})

	describe('быстрые ответы', () => {
		it('должен эмитить quick-reply с текстом выбранного варианта', async () => {
			const user = userEvent.setup()
			const { emitted } = renderChat({ quickReplies: ['Спасибо', 'До встречи'] })

			await user.click(screen.getByRole('button', { name: 'Быстрый ответ: Спасибо' }))

			const quickReplyEvents = emitted()['quick-reply'] as Array<[string]>
			expect(quickReplyEvents[0][0]).toBe('Спасибо')
		})
	})

	describe('композиция списка сообщений', () => {
		it('должен рендерить все переданные сообщения через ChatMessageList', () => {
			renderChat()

			expect(screen.getByText('Привет!')).toBeInTheDocument()
			expect(screen.getByText('Здравствуйте')).toBeInTheDocument()
		})

		it('должен показывать панель ввода пока сообщения не выделены', () => {
			renderChat()

			expect(screen.getByPlaceholderText('Напишите сообщение...')).toBeInTheDocument()
		})
	})

	describe('доступность', () => {
		it('должен предоставлять доступную кнопку прикрепления файла', () => {
			renderChat()

			expect(screen.getByRole('button', { name: 'Прикрепить файл' })).toBeInTheDocument()
		})
	})

	describe('поиск по сообщениям', () => {
		it('должен открывать поле поиска и фильтровать сообщения по запросу', async () => {
			const user = userEvent.setup()
			const { container } = renderChat()

			await fireEvent.click(screen.getByLabelText('Поиск по сообщениям'))

			const searchInput = container.querySelector('.base-chat-header__search-input input') as HTMLInputElement
			await user.type(searchInput, 'Привет')

			// При активном поиске текст разбивается на span-ы подсветки, поэтому проверяем через DOM
			expect(container.querySelectorAll('.base-chat-message-list__item').length).toBe(1)
			expect(screen.queryByText('Здравствуйте')).toBeNull()
			expect(container.querySelector('.base-chat-message-list__highlight')).toBeInTheDocument()
		})

		it('должен закрывать поле поиска повторным переключением', async () => {
			const { container } = renderChat()

			await fireEvent.click(screen.getByLabelText('Поиск по сообщениям'))
			expect(container.querySelector('.base-chat-header__search-input')).toBeInTheDocument()

			await fireEvent.click(screen.getByLabelText('Закрыть поиск'))
			expect(container.querySelector('.base-chat-header__search-input')).toBeNull()
		})
	})

	describe('навигация по закреплённым сообщениям', () => {
		it('должен переключать текущий закреп при нажатии "Следующее"', async () => {
			const pinned: ChatMessage[] = [
				{ id: '1', text: 'Закреп 1', sender: 'me', time: '10:00', isPinned: true },
				{ id: '2', text: 'Закреп 2', sender: 'me', time: '10:01', isPinned: true },
			]
			renderChat({ messages: pinned })

			expect(screen.getByText('Закреплённое сообщение (1 из 2)')).toBeInTheDocument()

			await fireEvent.click(screen.getByLabelText('Следующее закреплённое сообщение'))

			expect(screen.getByText('Закреплённое сообщение (2 из 2)')).toBeInTheDocument()
		})
	})

	describe('клик по аватару в шапке', () => {
		it('должен эмитить avatar-click и открывать профиль при клике по аватару с заданным avatar', async () => {
			const { container, emitted } = renderChat({ avatar: 'https://ex.com/a.png' })

			const avatar = container.querySelector('.base-chat-header__avatar') as HTMLElement
			await fireEvent.click(avatar)

			const events = emitted()['avatar-click'] as Array<[string]>
			expect(events[0][0]).toBe('https://ex.com/a.png')
		})
	})

	describe('ответ на сообщение', () => {
		it('должен показывать панель ответа после нажатия "Ответить" на сообщении', async () => {
			renderChat()

			await fireEvent.click(screen.getAllByLabelText('Ответить на сообщение')[0])

			expect(screen.getByLabelText('Отменить ответ на сообщение')).toBeInTheDocument()
		})

		it('должен закрывать панель ответа при отмене', async () => {
			renderChat()

			await fireEvent.click(screen.getAllByLabelText('Ответить на сообщение')[0])
			await fireEvent.click(screen.getByLabelText('Отменить ответ на сообщение'))

			expect(screen.queryByLabelText('Отменить ответ на сообщение')).toBeNull()
		})

		it('должен включать replyToId в send когда есть активный ответ', async () => {
			const user = userEvent.setup()
			const { emitted } = renderChat()

			await fireEvent.click(screen.getAllByLabelText('Ответить на сообщение')[0])
			await user.type(screen.getByPlaceholderText('Напишите сообщение...'), 'Ответ')
			await fireEvent.click(screen.getByLabelText('Отправить сообщение'))

			const sendEvents = emitted().send as Array<[{ text: string; replyToId?: string }]>
			expect(sendEvents[0][0].replyToId).toBe('1')
		})

		it('должен скроллить к сообщению при клике по цитате', async () => {
			const scrollIntoView = vi.fn()
			Element.prototype.scrollIntoView = scrollIntoView
			const withReply: ChatMessage[] = [
				...MESSAGES,
				{ id: '3', text: 'Ответ', sender: 'me', time: '10:02', replyToId: '1', replyToText: 'Привет!' },
			]
			const { container } = renderChat({ messages: withReply })

			const quote = container.querySelector('.base-chat-message-list__reply-quote') as HTMLElement
			await fireEvent.click(quote)

			expect(scrollIntoView).toHaveBeenCalled()
		})
	})

	describe('реакции и реакция через бейдж', () => {
		it('должен эмитить message-reaction при клике по бейджу реакции', async () => {
			const withReaction: ChatMessage[] = [
				{ id: '1', text: 'Сообщение', sender: 'me', time: '10:00', reactions: [{ emoji: '👍', users: ['me'] }] },
			]
			const { container, emitted } = renderChat({ messages: withReaction })

			const badge = container.querySelector('.base-chat-message-list__reaction-badge') as HTMLElement
			await fireEvent.click(badge)

			expect(emitted()['message-reaction']).toBeTruthy()
		})
	})

	describe('прикрепление файлов', () => {
		beforeEach(() => {
			vi.stubGlobal('URL', { ...URL, createObjectURL: vi.fn(() => 'blob:x'), revokeObjectURL: vi.fn() })
		})

		afterEach(() => {
			vi.unstubAllGlobals()
		})

		it('должен эмитить attach при выборе файла', async () => {
			const { container, emitted } = renderChat()

			const fileInput = container.querySelector('.base-chat-input__file-input') as HTMLInputElement
			const file = new File(['x'], 'f.txt', { type: 'text/plain' })
			Object.defineProperty(fileInput, 'files', { value: [file], configurable: true })
			await fireEvent.change(fileInput)

			expect(emitted().attach).toBeTruthy()
		})
	})

	describe('скачивание файла', () => {
		it('должен эмитить download-file при клике "Скачать файл"', async () => {
			const fileMsg: ChatMessage = {
				id: '1',
				text: '',
				sender: 'me',
				time: '10:00',
				attachments: [{ id: 'f1', name: 'doc.pdf', type: 'file', url: 'https://ex.com/doc.pdf' }],
			}
			const { emitted } = renderChat({ messages: [fileMsg] })

			await fireEvent.click(screen.getByLabelText('Скачать файл doc.pdf'))

			expect(emitted()['download-file']).toBeTruthy()
		})
	})

	describe('массовые действия с выделением', () => {
		async function enterSelection(): Promise<void> {
			await fireEvent.click(screen.getAllByLabelText('Выбрать сообщение')[0])
		}

		it('должен показывать тулбар массовых действий и скрывать панель ввода при выделении', async () => {
			renderChat()

			await enterSelection()

			expect(screen.queryByPlaceholderText('Напишите сообщение...')).toBeNull()
			expect(screen.getByText('Отмена')).toBeInTheDocument()
		})

		it('должен эмитить forward-messages при пересылке выделенных', async () => {
			const { emitted } = renderChat()

			await enterSelection()
			await fireEvent.click(screen.getByText('Переслать'))

			expect(emitted()['forward-messages']).toBeTruthy()
		})

		it('должен показывать подтверждение и эмитить delete-messages только после подтверждения', async () => {
			const { container, emitted } = renderChat()

			await enterSelection()
			await fireEvent.click(screen.getByText('Удалить'))

			// До подтверждения событие не эмитится
			expect(emitted()['delete-messages']).toBeUndefined()
			expect(screen.getByText('Удалить сообщения?')).toBeInTheDocument()

			const confirmBtn = container.querySelector('.base-chat__confirm-delete-btn') as HTMLElement
			await fireEvent.click(confirmBtn)

			expect(emitted()['delete-messages']).toBeTruthy()
		})

		it('не должен эмитить delete-messages при отмене подтверждения', async () => {
			const { container, emitted } = renderChat()

			await enterSelection()
			await fireEvent.click(screen.getByText('Удалить'))

			expect(screen.getByText('Удалить сообщения?')).toBeInTheDocument()

			// Отмена внутри окна подтверждения (закрытие по кресту модалки)
			const modalClose = container.querySelector('.base-modal__close') as HTMLElement
			await fireEvent.click(modalClose)

			expect(emitted()['delete-messages']).toBeUndefined()
			expect(screen.queryByText('Удалить сообщения?')).toBeNull()
		})

		it('показывает множественный текст и эмитит все id при удалении нескольких сообщений', async () => {
			const { container, emitted } = renderChat()

			// Первое сообщение — вход в режим выбора через action-кнопку
			await enterSelection()
			// Второе сообщение — клик по item в режиме выбора
			const items = container.querySelectorAll('.base-chat-message-list__item')
			await fireEvent.click(items[1] as HTMLElement)

			expect(container.querySelectorAll('.base-chat-message-list__item--selected')).toHaveLength(2)

			await fireEvent.click(screen.getByText('Удалить'))

			expect(screen.getByText(/выбранные сообщения \(2\)/)).toBeInTheDocument()

			const confirmBtn = container.querySelector('.base-chat__confirm-delete-btn') as HTMLElement
			await fireEvent.click(confirmBtn)

			const events = emitted()['delete-messages'] as Array<[string[]]>
			expect(events[0][0]).toHaveLength(2)
		})

		it('должен сбрасывать выделение при отмене', async () => {
			renderChat()

			await enterSelection()
			await fireEvent.click(screen.getByText('Отмена'))

			expect(screen.getByPlaceholderText('Напишите сообщение...')).toBeInTheDocument()
		})
	})

	describe('контекстное меню сообщения', () => {
		function openMenu(container: Element, index = 0): void {
			const bubble = container.querySelectorAll('.base-chat-message-list__bubble')[index] as HTMLElement
			fireEvent.contextMenu(bubble)
		}

		it('должен эмитить delete-messages с одним id после подтверждения удаления из меню', async () => {
			const { container, emitted } = renderChat()

			openMenu(container, 1)
			await fireEvent.click(await screen.findByText('Удалить'))

			// До подтверждения событие не эмитится, показывается окно
			expect(emitted()['delete-messages']).toBeUndefined()
			expect(screen.getByText('Удалить сообщения?')).toBeInTheDocument()

			const confirmBtn = container.querySelector('.base-chat__confirm-delete-btn') as HTMLElement
			await fireEvent.click(confirmBtn)

			const events = emitted()['delete-messages'] as Array<[string[]]>
			expect(events[0][0]).toEqual(['2'])
		})

		it('должен эмитить pin-message при закреплении из меню админом', async () => {
			const { container, emitted } = renderChat({ currentUserRole: 'admin' })

			openMenu(container, 0)
			await fireEvent.click(await screen.findByText('Закрепить'))

			expect(emitted()['pin-message']).toBeTruthy()
		})
	})

	describe('закреплённые сообщения', () => {
		it('должен эмитить unpin-message при откреплении из панели закрепов админом', async () => {
			const pinned: ChatMessage = { id: '1', text: 'Закреп', sender: 'me', time: '10:00', isPinned: true }
			const { emitted } = renderChat({ messages: [pinned], currentUserRole: 'admin' })

			await fireEvent.click(screen.getByLabelText('Открепить сообщение'))

			const events = emitted()['unpin-message'] as Array<[string]>
			expect(events[0][0]).toBe('1')
		})

		it('должен скроллить к закреплённому сообщению при клике по панели', async () => {
			const scrollIntoView = vi.fn()
			Element.prototype.scrollIntoView = scrollIntoView
			const pinned: ChatMessage = { id: '1', text: 'Закреп', sender: 'me', time: '10:00', isPinned: true }
			const { container } = renderChat({ messages: [pinned] })

			const panel = container.querySelector('.base-chat-pinned-panel__content') as HTMLElement
			await fireEvent.click(panel)

			expect(scrollIntoView).toHaveBeenCalled()
		})
	})

	describe('инфо-панель и админ-действия (групповой чат)', () => {
		async function openInfo(): Promise<void> {
			await fireEvent.click(screen.getByLabelText('Информация о чате'))
		}

		it('должен эмитить avatar-click при клике "Написать сообщение" в профиле участника', async () => {
			const { container, emitted } = renderChat({ isGroup: true, members: GROUP_MEMBERS })

			await openInfo()
			const memberMain = container.querySelector('.base-chat-slideover__member-main') as HTMLElement
			await fireEvent.click(memberMain)
			await fireEvent.click(screen.getByText('Написать сообщение'))

			// BaseChat пробрасывает write-message наружу как avatar-click (переход в личку)
			const events = emitted()['avatar-click'] as Array<[string]>
			expect(events.at(-1)?.[0]).toBe('a1')
		})

		it('должен эмитить kick-member, ban-member и update-member-role через админ-меню', async () => {
			const { container, emitted } = renderChat({
				isGroup: true,
				members: GROUP_MEMBERS,
				currentUserRole: 'admin',
			})

			await openInfo()

			await fireEvent.click(screen.getByLabelText('Действия с участником Анна'))
			await fireEvent.click(screen.getByText('Разжаловать'))
			expect(emitted()['update-member-role']).toBeTruthy()

			await fireEvent.click(screen.getByLabelText('Действия с участником Анна'))
			await fireEvent.click(screen.getByText('Исключить'))
			expect(emitted()['kick-member']).toBeTruthy()

			await fireEvent.click(screen.getByLabelText('Действия с участником Анна'))
			await fireEvent.click(screen.getByText('Забанить'))
			expect(emitted()['ban-member']).toBeTruthy()

			expect(container).toBeTruthy()
		})

		it('должен эмитить download-file при скачивании файла из вкладки "Файлы"', async () => {
			const fileMsg: ChatMessage = {
				id: '1',
				text: '',
				sender: 'me',
				time: '10:00',
				attachments: [{ id: 'f1', name: 'doc.pdf', type: 'file', url: 'https://ex.com/doc.pdf' }],
			}
			const { container, emitted } = renderChat({ isGroup: true, members: GROUP_MEMBERS, messages: [fileMsg] })

			await openInfo()
			await fireEvent.click(screen.getByText('Файлы'))
			const fileItem = container.querySelector('.base-chat-slideover__file-item') as HTMLElement
			await fireEvent.click(fileItem)

			// file-click внутри слайдовера пробрасывается наружу как download-file
			expect(emitted()['download-file']).toBeTruthy()
		})
	})
})
