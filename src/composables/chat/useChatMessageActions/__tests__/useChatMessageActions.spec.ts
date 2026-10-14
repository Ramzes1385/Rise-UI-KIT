import '@testing-library/jest-dom/vitest'
import { render } from '@testing-library/vue'
import { defineComponent, h, nextTick } from 'vue'
import { useChatMessageActions } from '../useChatMessageActions'
import type { UseChatMessageActionsOptions } from '../types/useChatMessageActions.types'
import type { ChatMessage, ChatMessageAttachment } from '@components/BaseChat/types/BaseChat.types'

type Actions = ReturnType<typeof useChatMessageActions>

const message: ChatMessage = { id: 'm1', text: 'Привет', sender: 'other', senderId: 'u1', time: '10:00' }
const file: ChatMessageAttachment = { id: 'f1', name: 'doc.pdf', type: 'file', url: 'https://example.com/doc.pdf' }

function setup(selected: readonly string[] = []) {
	const emit = vi.fn()
	let actions!: Actions
	const view = render(
		defineComponent({
			setup() {
				actions = useChatMessageActions({
					selectedMessageIds: { value: selected },
					emit: emit as unknown as UseChatMessageActionsOptions['emit'],
				})
				return () => h('div')
			},
		}),
	)
	const list = document.createElement('div')
	const menu = document.createElement('div')
	const menuButton = document.createElement('button')
	menu.append(menuButton)
	document.body.append(list, menu)
	actions.listRef.value = list
	actions.contextMenuRef.value = { menuRef: menu }
	return { actions, emit, list, menu, menuButton, view }
}

function rightClick(x = 100, y = 120): MouseEvent {
	return new MouseEvent('contextmenu', { clientX: x, clientY: y })
}

function addMessage(list: HTMLElement, id: string): HTMLElement {
	const element = document.createElement('div')
	element.id = `message-${id}`
	list.append(element)
	return element
}

afterEach(() => {
	document.body.innerHTML = ''
	vi.restoreAllMocks()
	vi.unstubAllGlobals()
	vi.useRealTimers()
})

describe('useChatMessageActions', () => {
	describe('события сообщения', () => {
		it('клик по аватару собеседника открывает его профиль', () => {
			const { actions, emit } = setup()

			actions.handleAvatarClick(message)

			expect(emit).toHaveBeenCalledWith('avatar-click', 'u1')
		})

		it('клик по цитате ведёт к исходному сообщению', () => {
			const { actions, emit } = setup()

			actions.handleReplyClick('m0')

			expect(emit).toHaveBeenCalledWith('reply-click', 'm0')
		})

		it.each([
			['handleSelect', 'message-select', 'm1'],
			['handleRetry', 'retry-message', 'm1'],
			['handleDiscard', 'discard-message', 'm1'],
			['handleReplyAction', 'message-reply', message],
			['handleDownload', 'download-file', file],
			['handleFileClick', 'file-click', file],
			['handleMentionClick', 'mention-click', '@anna'],
			['handleCommandClick', 'command-click', '/help'],
		] as const)('%s отдаёт событие %s', (handler, event, payload) => {
			const { actions, emit } = setup()

			;(actions[handler] as (value: unknown) => void)(payload)

			expect(emit).toHaveBeenCalledWith(event, payload)
		})

		describe('фокус после «Повторить» и «Удалить»', () => {
			const keyboardClick = new MouseEvent('click', { detail: 0 })
			const mouseClick = new MouseEvent('click', { detail: 1 })

			function setupFailed() {
				const context = setup()
				const chat = document.createElement('div')
				chat.className = 'base-chat'
				const input = document.createElement('textarea')
				input.className = 'base-chat-input__field'
				const button = document.createElement('button')
				chat.append(context.list, input)
				context.list.append(button)
				document.body.append(chat)
				return { ...context, button, input }
			}

			afterEach(() => {
				vi.useRealTimers()
			})

			it.each(['handleRetry', 'handleDiscard'] as const)(
				'%s с клавиатуры: кнопка пропала вместе с фокусом, он уходит в поле ввода',
				async handler => {
					const { actions, button, input } = setupFailed()
					button.focus()

					actions[handler]('m1', keyboardClick)
					button.remove()
					await vi.waitFor(() => expect(input).toHaveFocus())
				},
			)

			it('ждёт исчезновения кнопки: пока она в DOM, фокус остаётся на ней', async () => {
				const { actions, button, input, list } = setupFailed()
				button.focus()

				actions.handleRetry('m1', keyboardClick)
				list.append(document.createElement('span'))
				await nextTick()
				await new Promise(resolve => setTimeout(resolve, 0))

				expect(button).toHaveFocus()
				expect(input).not.toHaveFocus()
				button.remove()
				await vi.waitFor(() => expect(input).toHaveFocus())
			})

			it.each([
				['клик мышью или касание', mouseClick],
				['вызов без события', undefined],
			])('%s: фокус в поле ввода не переносится (экранная клавиатура)', async (_name, trigger) => {
				const { actions, button, input } = setupFailed()
				button.focus()

				actions.handleRetry('m1', trigger)
				button.remove()
				await new Promise(resolve => setTimeout(resolve, 0))

				expect(input).not.toHaveFocus()
			})

			it('фокус, который успел встать на другой элемент, не переносится', async () => {
				const { actions, button, input } = setupFailed()
				const other = document.createElement('button')
				document.body.append(other)
				button.focus()

				actions.handleRetry('m1', keyboardClick)
				other.focus()
				button.remove()
				await new Promise(resolve => setTimeout(resolve, 0))

				expect(other).toHaveFocus()
				expect(input).not.toHaveFocus()
			})

			it('фокус вне ленты (клавиатуру не трогали) остаётся на месте', async () => {
				const { actions, button, input } = setupFailed()

				actions.handleDiscard('m1', keyboardClick)
				button.remove()
				await new Promise(resolve => setTimeout(resolve, 0))

				expect(input).not.toHaveFocus()
			})

			it('без ленты в DOM ничего не делает', () => {
				const { actions } = setup()
				actions.listRef.value = null

				expect(() => actions.handleRetry('m1', keyboardClick)).not.toThrow()
			})

			it('кнопка не ушла за 10 секунд: ожидание снимается, позднее исчезновение фокус не переносит', async () => {
				vi.useFakeTimers()
				const { actions, button, input } = setupFailed()
				button.focus()

				actions.handleRetry('m1', keyboardClick)
				vi.advanceTimersByTime(10_000)
				button.remove()
				await vi.advanceTimersByTimeAsync(10)

				expect(input).not.toHaveFocus()
			})

			it('новое нажатие отменяет прежнее ожидание', async () => {
				const { actions, button, input } = setupFailed()
				button.focus()

				actions.handleRetry('m1', keyboardClick)
				actions.handleDiscard('m1', keyboardClick)
				button.remove()
				await vi.waitFor(() => expect(input).toHaveFocus())
			})
		})

		it('реакция на сообщении переключается', () => {
			const { actions, emit } = setup()

			actions.handleToggleReaction('m1', '👍')

			expect(emit).toHaveBeenCalledWith('message-reaction', { messageId: 'm1', emoji: '👍' })
		})
	})

	describe('контекстное меню', () => {
		it('открывается у курсора и не уходит за левый и верхний край', () => {
			const { actions } = setup()

			actions.handleContextMenu(rightClick(100, 120), message)
			expect(actions.contextMenu.value).toEqual({ isOpen: true, x: 100, y: 120, message })

			actions.handleContextMenu(rightClick(0, 4), message)
			expect(actions.contextMenu.value).toMatchObject({ x: 16, y: 16 })
		})

		it.each([
			{ handler: 'handleSelectReaction', args: ['🔥'], event: 'message-reaction', payload: { messageId: 'm1', emoji: '🔥' } },
			{ handler: 'handleContextMenuReply', args: [], event: 'message-reply', payload: message },
			{ handler: 'handleContextMenuSelect', args: [], event: 'message-select', payload: 'm1' },
			{ handler: 'handleContextMenuPin', args: [], event: 'pin-message', payload: 'm1' },
			{ handler: 'handleContextMenuDelete', args: [], event: 'delete-message', payload: 'm1' },
		] as const)('пункт $handler отдаёт $event и закрывает меню', ({ handler, args, event, payload }) => {
			const { actions, emit } = setup()
			actions.handleContextMenu(rightClick(), message)

			;(actions[handler] as (...values: unknown[]) => void)(...args)

			expect(emit).toHaveBeenCalledWith(event, payload)
			expect(actions.contextMenu.value.isOpen).toBe(false)
			expect(actions.contextMenu.value.message).toBeNull()
		})

		it('пункт «Закрепить» у закреплённого сообщения отдаёт unpin-message, а не pin-message', () => {
			const { actions, emit } = setup()
			actions.handleContextMenu(rightClick(), { ...message, isPinned: true })

			actions.handleContextMenuPin()

			expect(emit).toHaveBeenCalledWith('unpin-message', 'm1')
			expect(emit).not.toHaveBeenCalledWith('pin-message', expect.anything())
			expect(actions.contextMenu.value.isOpen).toBe(false)
		})

		it('пункт «Изменить» отдаёт message-edit с сообщением и закрывает меню', () => {
			const own: ChatMessage = { ...message, sender: 'me' }
			const { actions, emit } = setup()
			actions.handleContextMenu(rightClick(), own)

			actions.handleContextMenuEdit()

			expect(emit).toHaveBeenCalledWith('message-edit', own)
			expect(actions.contextMenu.value.isOpen).toBe(false)
		})

		it('«Копировать» кладёт текст в буфер обмена', async () => {
			const writeText = vi.fn<(text: string) => Promise<void>>().mockResolvedValue()
			vi.stubGlobal('navigator', { clipboard: { writeText } })
			const { actions } = setup()
			actions.handleContextMenu(rightClick(), message)

			await actions.handleContextMenuCopy()

			expect(writeText).toHaveBeenCalledWith('Привет')
			expect(actions.contextMenu.value.isOpen).toBe(false)
		})

		it('ошибка буфера обмена не мешает закрыть меню', async () => {
			vi.stubGlobal('navigator', { clipboard: { writeText: () => Promise.reject(new Error('denied')) } })
			const { actions } = setup()
			actions.handleContextMenu(rightClick(), message)

			await expect(actions.handleContextMenuCopy()).resolves.toBeUndefined()
			expect(actions.contextMenu.value.isOpen).toBe(false)
		})

		it('сообщение без текста не копируется', async () => {
			const writeText = vi.fn<(text: string) => Promise<void>>()
			vi.stubGlobal('navigator', { clipboard: { writeText } })
			const { actions } = setup()
			actions.handleContextMenu(rightClick(), { ...message, text: '' })

			await actions.handleContextMenuCopy()

			expect(writeText).not.toHaveBeenCalled()
		})

		it('после выбора пункта фокус возвращается на кнопку, с которой открыли меню', () => {
			const { actions, menuButton } = setup()
			const opener = document.createElement('button')
			document.body.append(opener)
			opener.focus()
			actions.handleContextMenu(rightClick(), message)
			menuButton.focus()

			actions.closeContextMenu()

			expect(document.activeElement).toBe(opener)
		})

		it('лента в iframe: фокус возвращается на кнопку из документа ленты', () => {
			const { actions, list, menu, menuButton } = setup()
			const frame = document.createElement('iframe')
			document.body.append(frame)
			const frameDocument = frame.contentDocument as Document
			const opener = frameDocument.createElement('button')
			frameDocument.body.append(list, menu, opener)
			opener.focus()

			actions.handleContextMenu(rightClick(), message)
			menuButton.focus()
			expect(opener).not.toBeInstanceOf(HTMLElement)
			expect(frameDocument.activeElement).toBe(menuButton)

			actions.closeContextMenu()

			expect(frameDocument.activeElement).toBe(opener)
		})

		it('фокус на SVG-элементе не запоминается', () => {
			const { actions, menuButton } = setup()
			const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
			icon.setAttribute('tabindex', '0')
			document.body.append(icon)
			icon.focus()
			expect(document.activeElement).toBe(icon)
			actions.handleContextMenu(rightClick(), message)
			menuButton.focus()

			actions.closeContextMenu()

			expect(document.activeElement).toBe(menuButton)
		})

		it('фокус не возвращается, если кнопки уже нет в DOM или фокус был вне меню', () => {
			const { actions, menuButton } = setup()
			const opener = document.createElement('button')
			document.body.append(opener)
			opener.focus()
			actions.handleContextMenu(rightClick(), message)
			menuButton.focus()
			opener.remove()

			actions.closeContextMenu()
			expect(document.activeElement).toBe(menuButton)

			const other = document.createElement('button')
			document.body.append(other)
			opener.focus()
			actions.handleContextMenu(rightClick(), message)
			other.focus()
			actions.closeContextMenu()
			expect(document.activeElement).toBe(other)
		})

		it('без элемента в фокусе меню открывается и закрывается', () => {
			vi.spyOn(document, 'activeElement', 'get').mockReturnValue(null)
			const { actions } = setup()
			actions.contextMenuRef.value = null
			actions.listRef.value = null

			actions.handleContextMenu(rightClick(), message)
			actions.handleListScroll()
			actions.closeContextMenu()

			expect(actions.contextMenu.value.isOpen).toBe(false)
		})

		it('нажатие мыши вне меню закрывает его, внутри — нет', async () => {
			const { actions, menuButton } = setup()
			actions.handleContextMenu(rightClick(), message)
			await nextTick()

			menuButton.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
			expect(actions.contextMenu.value.isOpen).toBe(true)

			document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
			expect(actions.contextMenu.value.isOpen).toBe(false)
		})

		it('заметная прокрутка ленты закрывает меню, мелкая — нет', () => {
			const { actions, list } = setup()
			list.scrollTop = 100
			actions.handleListScroll()
			actions.handleContextMenu(rightClick(), message)

			list.scrollTop = 110
			actions.handleListScroll()
			expect(actions.contextMenu.value.isOpen).toBe(true)

			list.scrollTop = 130
			actions.handleListScroll()
			expect(actions.contextMenu.value.isOpen).toBe(false)
		})
	})

	describe('переход к сообщению', () => {
		function measure(list: HTMLElement, element: HTMLElement): void {
			Object.defineProperty(list, 'clientHeight', { value: 400, configurable: true })
			list.getBoundingClientRect = () => ({ top: 50 }) as DOMRect
			element.getBoundingClientRect = () => ({ top: 650, height: 100 }) as DOMRect
		}

		it('ставит сообщение по центру ленты и подсвечивает на время', () => {
			vi.useFakeTimers()
			const { actions, list } = setup()
			const element = addMessage(list, 'a.b:c 1')
			measure(list, element)
			const scrollBy = vi.fn()
			list.scrollBy = scrollBy

			actions.scrollToMessage('a.b:c 1')

			expect(scrollBy).toHaveBeenCalledWith({ top: 450, behavior: 'smooth' })
			expect(element).toHaveClass('base-chat-message-list__item--highlighted')

			vi.advanceTimersByTime(1500)
			expect(element).not.toHaveClass('base-chat-message-list__item--highlighted')
		})

		it('находит сообщения с любыми символами в id и снимает подсветку с предыдущего', () => {
			const { actions, list } = setup()
			list.scrollBy = vi.fn()
			const ids = ['a.b', 'room:42', 'с пробелом', 'x$y', '-1', '1a', 'tab\u0001', 'x\u0000y', 'a#b[c]']
			const elements = ids.map(id => addMessage(list, id))

			ids.forEach((id, index) => {
				actions.scrollToMessage(id)
				expect(elements[index]).toHaveClass('base-chat-message-list__item--highlighted')
				elements
					.filter((_, other) => other !== index)
					.forEach(element => expect(element).not.toHaveClass('base-chat-message-list__item--highlighted'))
			})
		})

		it('без сообщения с таким id ничего не прокручивает', () => {
			const { actions, list } = setup()
			const scrollBy = vi.fn()
			list.scrollBy = scrollBy
			addMessage(list, 'm1')

			actions.scrollToMessage('m2')

			expect(scrollBy).not.toHaveBeenCalled()
		})

		it('не трогает элемент с таким id вне ленты', () => {
			const { actions, list } = setup()
			const scrollBy = vi.fn()
			list.scrollBy = scrollBy
			const outside = document.createElement('div')
			outside.id = 'message-m1'
			document.body.append(outside)

			actions.scrollToMessage('m1')

			expect(scrollBy).not.toHaveBeenCalled()
			expect(outside).not.toHaveClass('base-chat-message-list__item--highlighted')
		})

		it('находит сообщение в ленте внутри shadow root', () => {
			const { actions, list } = setup()
			const host = document.createElement('div')
			document.body.append(host)
			host.attachShadow({ mode: 'open' }).append(list)
			list.scrollBy = vi.fn()
			const element = addMessage(list, 'a.b')

			actions.scrollToMessage('a.b')

			expect(element).toHaveClass('base-chat-message-list__item--highlighted')
		})

		it('находит сообщение в ленте внутри iframe', () => {
			const { actions, list } = setup()
			const frame = document.createElement('iframe')
			document.body.append(frame)
			const frameDocument = frame.contentDocument as Document
			frameDocument.body.append(list)
			const scrollBy = vi.fn()
			list.scrollBy = scrollBy
			const element = addMessage(list, 'm1')

			actions.scrollToMessage('m1')

			expect(list.getRootNode()).toBe(frameDocument)
			expect(list.getRootNode()).not.toBeInstanceOf(Document)
			expect(scrollBy).toHaveBeenCalled()
			expect(element.classList.contains('base-chat-message-list__item--highlighted')).toBe(true)
		})

		it('у ленты вне документа ничего не прокручивает', () => {
			const { actions, list } = setup()
			const scrollBy = vi.fn()
			list.scrollBy = scrollBy
			const element = addMessage(list, 'm1')
			list.remove()

			actions.scrollToMessage('m1')

			expect(scrollBy).not.toHaveBeenCalled()
			expect(element).not.toHaveClass('base-chat-message-list__item--highlighted')
		})

		it('при «уменьшить движение» прокручивает без анимации', () => {
			vi.stubGlobal('matchMedia', (query: string) => ({ matches: query.includes('reduce') }))
			const { actions, list } = setup()
			const scrollBy = vi.fn()
			list.scrollBy = scrollBy
			addMessage(list, 'm1')

			actions.scrollToMessage('m1')

			expect(scrollBy).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'auto' }))
		})

		it('при размонтировании подсветка снимается', () => {
			const { actions, list, view } = setup()
			list.scrollBy = vi.fn()
			const element = addMessage(list, 'm1')
			actions.scrollToMessage('m1')

			view.unmount()

			expect(element).not.toHaveClass('base-chat-message-list__item--highlighted')
		})
	})
})
