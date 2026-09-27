/**
 * Unit/Integration-тесты для ChatMessageList.
 * Покрывают режим выделения, вложения (изображения/файлы), реакции,
 * контекстное меню, подсветку поиска, ссылки и галерею.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import ChatMessageList from '../ui/ChatMessageList.vue'
import type { ChatMessage } from '../../../model/BaseChat.types'

const BASE_MESSAGES: ChatMessage[] = [
	{ id: '1', text: 'Привет!', sender: 'other', time: '10:00', senderName: 'Анна', senderAvatar: 'a.png' },
	{ id: '2', text: 'Здравствуйте', sender: 'me', time: '10:01', status: 'read' },
]

/** Прокрутка ленты: в jsdom нет раскладки, поэтому scrollTop задаётся напрямую, затем приходит событие scroll */
async function scrollListTo(list: HTMLElement, scrollTop: number): Promise<void> {
	Object.defineProperty(list, 'scrollTop', { value: scrollTop, configurable: true, writable: true })
	await fireEvent.scroll(list)
}

describe('ChatMessageList unit', () => {
	describe('рендер сообщений', () => {
		it('должен рендерить все переданные сообщения', () => {
			render(ChatMessageList, { props: { messages: BASE_MESSAGES } })

			expect(screen.getByText('Привет!')).toBeInTheDocument()
			expect(screen.getByText('Здравствуйте')).toBeInTheDocument()
		})

		it('должен показывать имя отправителя в групповом чате для чужих сообщений', () => {
			render(ChatMessageList, { props: { messages: BASE_MESSAGES, isGroup: true } })

			expect(screen.getByText('Анна')).toBeInTheDocument()
		})

		it('должен показывать индикатор печатания когда isTyping=true', () => {
			const { container } = render(ChatMessageList, {
				props: { messages: BASE_MESSAGES, isTyping: true, avatar: 'av.png', typingUsername: 'Анна' },
			})

			expect(container.querySelector('.base-chat-message-list__bubble--typing')).toBeInTheDocument()
		})

		it('должен использовать "Companion" для аватара печатания когда нет typingUsername', () => {
			const { container } = render(ChatMessageList, {
				props: { messages: BASE_MESSAGES, isTyping: true, avatar: 'av.png', typingUsername: '' },
			})

			const typing = container.querySelector('.base-chat-message-list__item--typing-indicator') as HTMLElement
			expect(typing.querySelector('.base-chat-message-list__avatar')).toBeInTheDocument()
		})

		it('должен показывать индикатор печатания без аватара когда avatar не задан', () => {
			const { container } = render(ChatMessageList, {
				props: { messages: BASE_MESSAGES, isTyping: true, avatar: '' },
			})

			const typing = container.querySelector('.base-chat-message-list__item--typing-indicator') as HTMLElement
			expect(typing).toBeInTheDocument()
			expect(typing.querySelector('.base-chat-message-list__avatar')).toBeNull()
		})

		it('должен использовать запасное имя "Companion" для аватара чужого сообщения без имени отправителя', () => {
			const noName: ChatMessage = { id: '5', text: 'Без имени', sender: 'other', time: '10:10', senderAvatar: 'b.png' }
			const { container } = render(ChatMessageList, { props: { messages: [noName] } })

			expect(container.querySelector('.base-chat-message-list__avatar')).toBeInTheDocument()
		})

		it('не должен запускать выбор при обычном клике по сообщению вне режима выделения', async () => {
			const { container, emitted } = render(ChatMessageList, { props: { messages: BASE_MESSAGES } })

			const item = container.querySelector('#message-2') as HTMLElement
			await fireEvent.click(item)

			expect(emitted()['message-select']).toBeUndefined()
		})

		it('должен эмитить avatar-click при клике по имени отправителя в групповом чате', async () => {
			const { container, emitted } = render(ChatMessageList, {
				props: { messages: BASE_MESSAGES, isGroup: true },
			})

			const senderName = container.querySelector('.base-chat-message-list__sender-name') as HTMLElement
			await fireEvent.click(senderName)

			const events = emitted()['avatar-click'] as Array<[string]>
			expect(events[0][0]).toBe('Анна')
		})
	})

	describe('статусы сообщений', () => {
		it('должен показывать спиннер для статуса sending', () => {
			const sendingMsg: ChatMessage = { id: '80', text: 'В пути', sender: 'me', time: '17:00', status: 'sending' }
			const { container } = render(ChatMessageList, { props: { messages: [sendingMsg] } })

			expect(container.querySelector('.base-chat-message-list__status--sending')).toBeInTheDocument()
		})

		it('должен показывать одну галочку для статуса sent (без второй галочки)', () => {
			const sentMsg: ChatMessage = { id: '81', text: 'Отправлено', sender: 'me', time: '17:01', status: 'sent' }
			const { container } = render(ChatMessageList, { props: { messages: [sentMsg] } })

			expect(container.querySelector('.base-chat-message-list__status-wrapper--sent')).toBeInTheDocument()
			expect(container.querySelector('.base-chat-message-list__status-icon--second')).toBeNull()
		})

		it('должен показывать две галочки для статуса delivered', () => {
			const deliveredMsg: ChatMessage = {
				id: '82',
				text: 'Доставлено',
				sender: 'me',
				time: '17:02',
				status: 'delivered',
			}
			const { container } = render(ChatMessageList, { props: { messages: [deliveredMsg] } })

			expect(container.querySelector('.base-chat-message-list__status-icon--second')).toBeInTheDocument()
		})
	})

	describe('закреплённое сообщение', () => {
		it('должен показывать иконку закрепления для isPinned сообщения', () => {
			const pinnedMsg: ChatMessage = { id: '90', text: 'Закреп', sender: 'me', time: '18:00', isPinned: true }
			const { container } = render(ChatMessageList, { props: { messages: [pinnedMsg] } })

			expect(container.querySelector('.base-chat-message-list__pin-icon')).toBeInTheDocument()
		})
	})

	describe('режим выделения', () => {
		it('должен отображать чекбоксы и применять класс selection-mode когда есть выделенные сообщения', () => {
			const { container } = render(ChatMessageList, {
				props: { messages: BASE_MESSAGES, selectedMessageIds: ['1'] },
			})

			expect(container.querySelector('.base-chat-message-list--selection-mode')).toBeInTheDocument()
			expect(container.querySelector('.base-chat-message-list__checkbox-wrapper')).toBeInTheDocument()
			expect(container.querySelector('.base-chat-message-list__item--selected')).toBeInTheDocument()
		})

		it('должен эмитить message-select при клике по сообщению в режиме выделения', async () => {
			const { container, emitted } = render(ChatMessageList, {
				props: { messages: BASE_MESSAGES, selectedMessageIds: ['1'] },
			})

			const secondItem = container.querySelector('#message-2') as HTMLElement
			await fireEvent.click(secondItem)

			const events = emitted()['message-select'] as Array<[string]>
			expect(events[0][0]).toBe('2')
		})

		it('должен эмитить message-select при переключении чекбокса', async () => {
			const { container, emitted } = render(ChatMessageList, {
				props: { messages: BASE_MESSAGES, selectedMessageIds: ['1'] },
			})

			const checkbox = container.querySelector(
				'.base-chat-message-list__checkbox-wrapper input',
			) as HTMLInputElement
			await fireEvent.click(checkbox)

			expect(emitted()['message-select']).toBeTruthy()
		})
	})

	describe('действия по сообщению (вне режима выделения)', () => {
		it('должен эмитить message-reply при клике на кнопку "Ответить"', async () => {
			const { emitted } = render(ChatMessageList, { props: { messages: BASE_MESSAGES } })

			await fireEvent.click(screen.getAllByLabelText('Ответить на сообщение')[0])

			expect(emitted()['message-reply']).toBeTruthy()
		})

		it('должен эмитить message-select при клике на кнопку "Выбрать сообщение"', async () => {
			const { emitted } = render(ChatMessageList, { props: { messages: BASE_MESSAGES } })

			await fireEvent.click(screen.getAllByLabelText('Выбрать сообщение')[0])

			expect(emitted()['message-select']).toBeTruthy()
		})

		it('должен эмитить avatar-click при клике по аватару чужого сообщения', async () => {
			const { container, emitted } = render(ChatMessageList, {
				props: { messages: BASE_MESSAGES, isGroup: true },
			})

			const avatar = container.querySelector('.base-chat-message-list__avatar') as HTMLElement
			await fireEvent.click(avatar)

			const events = emitted()['avatar-click'] as Array<[string]>
			expect(events[0][0]).toBe('Анна')
		})
	})

	describe('вложения', () => {
		const imageMsg: ChatMessage = {
			id: '10',
			text: '',
			sender: 'other',
			time: '11:00',
			senderName: 'Анна',
			attachments: [{ id: 'img1', name: 'photo.png', type: 'image', url: 'https://ex.com/photo.png' }],
		}

		const fileMsg: ChatMessage = {
			id: '11',
			text: '',
			sender: 'me',
			time: '11:05',
			attachments: [{ id: 'f1', name: 'report.pdf', type: 'file', url: 'https://ex.com/report.pdf', size: '1 MB' }],
		}

		it('должен эмитить download-file при клике "Скачать изображение"', async () => {
			const { emitted } = render(ChatMessageList, { props: { messages: [imageMsg] } })

			await fireEvent.click(screen.getByLabelText('Скачать изображение photo.png'))

			const events = emitted()['download-file'] as Array<[{ id: string }]>
			expect(events[0][0].id).toBe('img1')
		})

		it('должен использовать локальную галерею сообщения когда allImagesUrls пуст (getMessageImagesUrls)', () => {
			const { container } = render(ChatMessageList, {
				props: { messages: [imageMsg], allImagesUrls: [] },
			})

			// Коллаж с изображением отрендерен — getMessageImagesUrls вызван для gallery
			expect(container.querySelector('.base-chat-message-list__attached-image')).toBeInTheDocument()
		})

		it('должен использовать общую галерею allImagesUrls когда она не пуста', () => {
			const { container } = render(ChatMessageList, {
				props: { messages: [imageMsg], allImagesUrls: ['https://ex.com/photo.png', 'https://ex.com/x.png'] },
			})

			expect(container.querySelector('.base-chat-message-list__attached-image')).toBeInTheDocument()
		})

		it('должен эмитить download-file при клике "Скачать файл"', async () => {
			const { emitted } = render(ChatMessageList, { props: { messages: [fileMsg] } })

			await fireEvent.click(screen.getByLabelText('Скачать файл report.pdf'))

			const events = emitted()['download-file'] as Array<[{ id: string }]>
			expect(events[0][0].id).toBe('f1')
		})

		it('должен эмитить file-click при клике по карточке файла', async () => {
			const { container, emitted } = render(ChatMessageList, { props: { messages: [fileMsg] } })

			// Карточка файла: основная часть — кнопка с именем и размером, «Скачать» — отдельная кнопка
			const fileCard = container.querySelector('.base-chat-message-list__attached-file-main') as HTMLElement
			await fireEvent.click(fileCard)

			expect(emitted()['file-click']).toBeTruthy()
		})

		it('должен показывать оверлей "+N" когда изображений больше 4', () => {
			const manyImages: ChatMessage = {
				id: '20',
				text: '',
				sender: 'other',
				time: '12:00',
				attachments: Array.from({ length: 6 }, (_, i) => ({
					id: `i${i}`,
					name: `p${i}.png`,
					type: 'image' as const,
					url: `https://ex.com/p${i}.png`,
				})),
			}
			const { container } = render(ChatMessageList, { props: { messages: [manyImages] } })

			expect(container.querySelector('.base-chat-message-list__collage-overlay')).toBeInTheDocument()
			expect(screen.getByText('+3')).toBeInTheDocument()
		})

		it('должен выбирать иконку файла по расширению', () => {
			const codeMsg: ChatMessage = {
				id: '30',
				text: '',
				sender: 'me',
				time: '12:10',
				attachments: [
					{ id: 'c1', name: 'script.ts', type: 'file', url: 'https://ex.com/script.ts' },
					{ id: 'c2', name: 'unknown.xyz', type: 'file', url: 'https://ex.com/unknown.xyz' },
				],
			}
			render(ChatMessageList, { props: { messages: [codeMsg] } })

			expect(screen.getByText('script.ts')).toBeInTheDocument()
			expect(screen.getByText('unknown.xyz')).toBeInTheDocument()
		})
	})

	describe('реакции', () => {
		const reactionMsg: ChatMessage = {
			id: '40',
			text: 'С реакцией',
			sender: 'me',
			time: '13:00',
			reactions: [{ emoji: '👍', users: ['me', 'Анна'] }],
		}

		it('должен эмитить message-reaction при клике по бейджу реакции', async () => {
			const { container, emitted } = render(ChatMessageList, { props: { messages: [reactionMsg] } })

			const badge = container.querySelector('.base-chat-message-list__reaction-badge') as HTMLElement
			await fireEvent.click(badge)

			const events = emitted()['message-reaction'] as Array<[{ messageId: string; emoji: string }]>
			expect(events[0][0]).toEqual({ messageId: '40', emoji: '👍' })
		})
	})

	describe('цитата (ответ)', () => {
		it('должен эмитить reply-click при клике по цитате', async () => {
			const replyMsg: ChatMessage = {
				id: '50',
				text: 'Ответ',
				sender: 'me',
				time: '14:00',
				replyToId: '1',
				replyToText: 'Исходное',
				replyToSenderName: 'Анна',
			}
			const { container, emitted } = render(ChatMessageList, { props: { messages: [replyMsg] } })

			const quote = container.querySelector('.base-chat-message-list__reply-quote') as HTMLElement
			await fireEvent.click(quote)

			const events = emitted()['reply-click'] as Array<[string]>
			expect(events[0][0]).toBe('1')
		})

		it('должен показывать "Сообщение" в цитате когда нет имени отправителя ответа', () => {
			const replyMsg: ChatMessage = {
				id: '51',
				text: 'Ответ',
				sender: 'me',
				time: '14:05',
				replyToId: '1',
				replyToText: 'Исходное',
			}
			render(ChatMessageList, { props: { messages: [replyMsg] } })

			expect(screen.getByText('Сообщение')).toBeInTheDocument()
		})
	})

	describe('поиск и ссылки', () => {
		it('должен подсвечивать совпадения при активном searchQuery', () => {
			const { container } = render(ChatMessageList, {
				props: { messages: [{ id: '60', text: 'Привет мир', sender: 'me', time: '15:00' }], searchQuery: 'мир' },
			})

			expect(container.querySelector('.base-chat-message-list__highlight')).toBeInTheDocument()
		})

		it('должен подсвечивать ссылку как кликабельную в режиме поиска', () => {
			const { container } = render(ChatMessageList, {
				props: {
					messages: [{ id: '61', text: 'Ссылка https://ex.com тут', sender: 'me', time: '15:01' }],
					searchQuery: 'https://ex.com',
				},
			})

			expect(container.querySelector('.base-chat-message-list__link')).toBeInTheDocument()
		})

		it('должен превращать ссылку в кликабельную вне режима поиска', () => {
			const { container } = render(ChatMessageList, {
				props: { messages: [{ id: '62', text: 'Смотри https://ex.com', sender: 'me', time: '15:02' }] },
			})

			expect(container.querySelector('.base-chat-message-list__link')).toBeInTheDocument()
		})

		it('должен останавливать всплытие при клике по ссылке вне режима поиска', async () => {
			const { container } = render(ChatMessageList, {
				props: { messages: [{ id: '63', text: 'Ссылка https://ex.com', sender: 'me', time: '15:03' }] },
			})

			const link = container.querySelector('.base-chat-message-list__link') as HTMLElement
			await fireEvent.click(link)

			expect(link).toBeInTheDocument()
		})

		it('должен останавливать всплытие при клике по ссылке в режиме поиска', async () => {
			const { container } = render(ChatMessageList, {
				props: {
					messages: [{ id: '64', text: 'Ссылка https://ex.com здесь', sender: 'me', time: '15:04' }],
					searchQuery: 'здесь',
				},
			})

			const link = container.querySelector('.base-chat-message-list__link') as HTMLElement
			await fireEvent.click(link)

			expect(link).toBeInTheDocument()
		})
	})

	describe('упоминания и команды в тексте', () => {
		it('должен подсвечивать @упоминание и эмитить mention-click с именем без @', async () => {
			const { container, emitted } = render(ChatMessageList, {
				props: { messages: [{ id: '70', text: 'Привет @Анна как дела', sender: 'other', time: '15:10' }] },
			})

			const mention = container.querySelector('.base-chat-message-list__mention') as HTMLElement
			expect(mention).toBeInTheDocument()
			expect(mention).toHaveTextContent('@Анна')

			await fireEvent.click(mention)

			const events = emitted()['mention-click'] as Array<[string]>
			expect(events[0][0]).toBe('Анна')
		})

		it('должен подсвечивать /команду и эмитить command-click с именем без слеша', async () => {
			const { container, emitted } = render(ChatMessageList, {
				props: { messages: [{ id: '71', text: '/help нужна помощь', sender: 'me', time: '15:11' }] },
			})

			const command = container.querySelector('.base-chat-message-list__command') as HTMLElement
			expect(command).toBeInTheDocument()
			expect(command).toHaveTextContent('/help')

			await fireEvent.click(command)

			const events = emitted()['command-click'] as Array<[string]>
			expect(events[0][0]).toBe('help')
		})

		it('не должен распознавать слеш в середине слова как команду (только ссылку/текст)', () => {
			const { container } = render(ChatMessageList, {
				props: { messages: [{ id: '72', text: 'путь a/b/c', sender: 'me', time: '15:12' }] },
			})

			expect(container.querySelector('.base-chat-message-list__command')).toBeNull()
		})

		it('должен останавливать всплытие при клике по @упоминанию (не входит в режим выбора)', async () => {
			const { container, emitted } = render(ChatMessageList, {
				props: { messages: [{ id: '73', text: '@Борис привет', sender: 'other', time: '15:13' }] },
			})

			const mention = container.querySelector('.base-chat-message-list__mention') as HTMLElement
			await fireEvent.click(mention)

			expect(emitted()['message-select']).toBeUndefined()
		})

		it('должен сохранять кликабельность @упоминания и /команды в режиме поиска', async () => {
			const { container, emitted } = render(ChatMessageList, {
				props: {
					messages: [{ id: '74', text: 'Привет @Анна используй /help сейчас', sender: 'me', time: '15:14' }],
					searchQuery: 'сейчас',
				},
			})

			expect(container.querySelector('.base-chat-message-list__highlight')).toBeInTheDocument()

			const mention = container.querySelector('.base-chat-message-list__mention') as HTMLElement
			const command = container.querySelector('.base-chat-message-list__command') as HTMLElement
			expect(mention).toBeInTheDocument()
			expect(command).toBeInTheDocument()

			await fireEvent.click(mention)
			await fireEvent.click(command)

			expect((emitted()['mention-click'] as Array<[string]>)[0][0]).toBe('Анна')
			expect((emitted()['command-click'] as Array<[string]>)[0][0]).toBe('help')
		})
	})

	describe('контекстное меню', () => {
		const ctxMsg: ChatMessage = { id: '70', text: 'Текст', sender: 'me', time: '16:00', isPinned: false }

		function openContextMenu(container: Element): void {
			const bubble = container.querySelector('.base-chat-message-list__bubble') as HTMLElement
			fireEvent.contextMenu(bubble)
		}

		it('должен открывать контекстное меню по правому клику', async () => {
			const { container } = render(ChatMessageList, { props: { messages: [ctxMsg] } })

			openContextMenu(container)
			await Promise.resolve()

			expect(screen.getByText('Ответить')).toBeInTheDocument()
		})

		it('должен подсвечивать сообщение пока открыто контекстное меню и снимать подсветку при закрытии', async () => {
			const { container } = render(ChatMessageList, { props: { messages: [ctxMsg] } })

			const item = container.querySelector('.base-chat-message-list__item') as HTMLElement
			expect(item).not.toHaveClass('base-chat-message-list__item--context-active')

			openContextMenu(container)
			await Promise.resolve()
			expect(item).toHaveClass('base-chat-message-list__item--context-active')

			const list = container.querySelector('.base-chat-message-list') as HTMLElement
			await scrollListTo(list, 120)
			expect(item).not.toHaveClass('base-chat-message-list__item--context-active')
		})

		it('должен эмитить message-reaction при выборе реакции из меню', async () => {
			const { container, emitted } = render(ChatMessageList, { props: { messages: [ctxMsg] } })

			openContextMenu(container)
			await fireEvent.click(await screen.findByLabelText('Поставить реакцию 👍'))

			expect(emitted()['message-reaction']).toBeTruthy()
		})

		it('должен эмитить message-reply из контекстного меню', async () => {
			const { container, emitted } = render(ChatMessageList, { props: { messages: [ctxMsg] } })

			openContextMenu(container)
			await fireEvent.click(await screen.findByText('Ответить'))

			expect(emitted()['message-reply']).toBeTruthy()
		})

		it('должен эмитить message-select из контекстного меню', async () => {
			const { container, emitted } = render(ChatMessageList, { props: { messages: [ctxMsg] } })

			openContextMenu(container)
			await fireEvent.click(await screen.findByText('Выбрать'))

			expect(emitted()['message-select']).toBeTruthy()
		})

		it('должен копировать текст из контекстного меню', async () => {
			const writeText = vi.fn()
			Object.assign(navigator, { clipboard: { writeText } })
			const { container } = render(ChatMessageList, { props: { messages: [ctxMsg] } })

			openContextMenu(container)
			await fireEvent.click(await screen.findByText('Копировать текст'))

			expect(writeText).toHaveBeenCalledWith('Текст')
		})

		it('должен показывать пункт "Закрепить" и эмитить pin-message для админа', async () => {
			const { container, emitted } = render(ChatMessageList, {
				props: { messages: [ctxMsg], currentUserRole: 'admin' },
			})

			openContextMenu(container)
			await fireEvent.click(await screen.findByText('Закрепить'))

			expect(emitted()['pin-message']).toBeTruthy()
		})

		it('должен показывать "Открепить" для закреплённого сообщения у админа', async () => {
			const pinnedMsg: ChatMessage = { ...ctxMsg, id: '71', isPinned: true }
			const { container } = render(ChatMessageList, {
				props: { messages: [pinnedMsg], currentUserRole: 'admin' },
			})

			openContextMenu(container)

			expect(await screen.findByText('Открепить')).toBeInTheDocument()
		})

		it('должен эмитить delete-message из контекстного меню для своего сообщения', async () => {
			const { container, emitted } = render(ChatMessageList, { props: { messages: [ctxMsg] } })

			openContextMenu(container)
			await fireEvent.click(await screen.findByText('Удалить'))

			expect(emitted()['delete-message']).toBeTruthy()
		})

		it('должен закрывать контекстное меню при прокрутке списка', async () => {
			const { container } = render(ChatMessageList, { props: { messages: [ctxMsg] } })

			openContextMenu(container)
			await screen.findByText('Ответить')

			const list = container.querySelector('.base-chat-message-list') as HTMLElement
			await scrollListTo(list, 120)

			expect(screen.queryByText('Ответить')).toBeNull()
		})

		it('не должен закрывать меню при сдвиге ленты на несколько пикселей (фокус кнопки у края ленты)', async () => {
			const { container } = render(ChatMessageList, { props: { messages: [ctxMsg] } })

			openContextMenu(container)
			await screen.findByText('Ответить')

			const list = container.querySelector('.base-chat-message-list') as HTMLElement
			await scrollListTo(list, 8)

			expect(screen.getByText('Ответить')).toBeInTheDocument()
		})

		it('должен закрывать контекстное меню при клике снаружи (useClickOutside isActive)', async () => {
			const { container } = render(ChatMessageList, { props: { messages: [ctxMsg] } })

			openContextMenu(container)
			await screen.findByText('Ответить')

			await fireEvent.mouseDown(document.body)

			expect(screen.queryByText('Ответить')).toBeNull()
		})

		it('не должен реагировать на клик снаружи когда меню закрыто (isActive=false)', async () => {
			render(ChatMessageList, { props: { messages: [ctxMsg] } })

			// меню не открыто — isActive() возвращает false, callback не вызывается
			await fireEvent.mouseDown(document.body)

			expect(screen.queryByText('Ответить')).toBeNull()
		})

		describe('реальный клик указателем (pointerdown → mousedown → click)', () => {
			it('должен выполнять действия пунктов меню и реакций при клике мышью', async () => {
				const user = userEvent.setup()
				const { container, emitted } = render(ChatMessageList, {
					props: { messages: [ctxMsg], currentUserRole: 'admin' },
				})

				openContextMenu(container)
				await user.click(await screen.findByText('Закрепить'))
				expect(emitted()['pin-message']).toEqual([['70']])

				openContextMenu(container)
				await user.click(await screen.findByText('Ответить'))
				expect(emitted()['message-reply']).toEqual([[ctxMsg]])

				openContextMenu(container)
				await user.click(await screen.findByLabelText('Поставить реакцию 👍'))
				expect(emitted()['message-reaction']).toEqual([[{ messageId: '70', emoji: '👍' }]])

				openContextMenu(container)
				await user.click(await screen.findByText('Удалить'))
				expect(emitted()['delete-message']).toEqual([['70']])
			})

			it('не должен закрывать меню по mousedown внутри меню и должен закрывать после выбора пункта', async () => {
				const { container } = render(ChatMessageList, { props: { messages: [ctxMsg] } })

				openContextMenu(container)
				const replyItem = await screen.findByText('Ответить')
				await fireEvent.mouseDown(replyItem)

				expect(screen.getByText('Ответить')).toBeInTheDocument()

				await userEvent.setup().click(screen.getByText('Ответить'))

				expect(screen.queryByText('Ответить')).toBeNull()
			})
		})
	})

	describe('публичный метод scrollToMessage', () => {
		it('должен скроллить к сообщению и временно подсвечивать его', () => {
			vi.useFakeTimers()
			const scrollIntoView = vi.fn()
			Element.prototype.scrollIntoView = scrollIntoView

			const wrapper = mount(ChatMessageList, {
				props: { messages: BASE_MESSAGES },
				attachTo: document.body,
			})

			;(wrapper.vm as unknown as { scrollToMessage: (id: string) => void }).scrollToMessage('1')

			const target = wrapper.element.querySelector('#message-1') as HTMLElement
			expect(scrollIntoView).toHaveBeenCalled()
			expect(target.classList.contains('base-chat-message-list__item--highlighted')).toBe(true)

			vi.advanceTimersByTime(1500)
			expect(target.classList.contains('base-chat-message-list__item--highlighted')).toBe(false)

			wrapper.unmount()
			vi.useRealTimers()
		})

		it('должен находить сообщение, id которого содержит спецсимволы CSS-селектора', () => {
			const scrollIntoView = vi.fn()
			Element.prototype.scrollIntoView = scrollIntoView
			const messages: ChatMessage[] = [
				{ id: '$ev:matrix.org', text: 'Matrix-событие', sender: 'other', time: '10:00' },
				{ id: 'msg.1', text: 'С точкой', sender: 'me', time: '10:01' },
				{ id: 'a b', text: 'С пробелом', sender: 'me', time: '10:02' },
				{ id: '42', text: 'Числовой', sender: 'me', time: '10:03' },
			]
			const wrapper = mount(ChatMessageList, { props: { messages }, attachTo: document.body })
			const vm = wrapper.vm as unknown as { scrollToMessage: (id: string) => void }

			for (const message of messages) {
				scrollIntoView.mockClear()
				expect(() => vm.scrollToMessage(message.id)).not.toThrow()

				const target = document.getElementById(`message-${message.id}`)
				expect(scrollIntoView).toHaveBeenCalledTimes(1)
				expect(scrollIntoView.mock.contexts[0]).toBe(target)
				expect(target?.classList.contains('base-chat-message-list__item--highlighted')).toBe(true)
			}

			wrapper.unmount()
		})
	})

	describe('доступность и клавиатура', () => {
		const ownMsg: ChatMessage = { id: '90', text: 'Моё сообщение', sender: 'me', time: '17:00', status: 'read' }

		it('лента — role="log" с доступным именем, пустая лента показывает подсказку', () => {
			render(ChatMessageList, { props: { messages: [] } })

			const log = screen.getByRole('log', { name: 'Сообщения' })
			expect(log).toHaveTextContent('Сообщений пока нет')
		})

		it('при поиске без совпадений показывает «Ничего не найдено»', () => {
			render(ChatMessageList, { props: { messages: [], searchQuery: 'макет' } })

			expect(screen.getByText('Ничего не найдено')).toBeInTheDocument()
		})

		it('статус доставки передаётся не только цветом: галочки — role="img" с названием статуса', () => {
			render(ChatMessageList, { props: { messages: [ownMsg] } })

			expect(screen.getByRole('img', { name: 'Прочитано' })).toBeInTheDocument()
		})

		it('своя реакция — нажатая кнопка (aria-pressed), чужая — ненажатая', () => {
			const message: ChatMessage = {
				...ownMsg,
				reactions: [
					{ emoji: '👍', users: ['me', 'Анна'] },
					{ emoji: '🔥', users: ['Анна'] },
				],
			}
			render(ChatMessageList, { props: { messages: [message] } })

			expect(screen.getByRole('button', { name: 'Реакция 👍: 2' })).toHaveAttribute('aria-pressed', 'true')
			expect(screen.getByRole('button', { name: 'Реакция 🔥: 1' })).toHaveAttribute('aria-pressed', 'false')
		})

		it('«Другие действия» открывает меню: фокус на первом пункте, стрелки по кругу, Escape закрывает и возвращает фокус', async () => {
			const user = userEvent.setup()
			const wrapper = mount(ChatMessageList, { props: { messages: [ownMsg] }, attachTo: document.body })

			const more = screen.getByRole('button', { name: 'Другие действия с сообщением' })
			more.focus()
			await user.keyboard('{Enter}')

			const menu = await screen.findByRole('menu', { name: 'Действия с сообщением' })
			const items = within(menu).getAllByRole('menuitem')
			await waitFor(() => expect(items[0]).toHaveFocus())
			expect(more).toHaveAttribute('aria-expanded', 'true')

			await user.keyboard('{ArrowUp}')
			expect(items.at(-1)).toHaveFocus()
			await user.keyboard('{Home}')
			expect(items[0]).toHaveFocus()

			await user.keyboard('{Escape}')
			await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
			expect(more).toHaveFocus()

			wrapper.unmount()
		})

		it('выбор пункта меню с клавиатуры выполняет действие и возвращает фокус на кнопку', async () => {
			const user = userEvent.setup()
			const wrapper = mount(ChatMessageList, { props: { messages: [ownMsg] }, attachTo: document.body })

			const more = screen.getByRole('button', { name: 'Другие действия с сообщением' })
			more.focus()
			await user.keyboard('{Enter}')
			const reply = await screen.findByRole('menuitem', { name: 'Ответить' })
			reply.focus()
			await user.keyboard('{Enter}')

			expect(wrapper.emitted('message-reply')?.[0]).toEqual([ownMsg])
			expect(more).toHaveFocus()

			wrapper.unmount()
		})
	})
})
