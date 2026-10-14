import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import BaseChat from '../ui/BaseChat.vue'
import { createUiKitPlugin } from '@/plugin'
import { formatMessage } from '@/locales/state'
import userEvent from '@testing-library/user-event'
import { UI_CHAT_TEXT, UI_WARNINGS } from '@/locales/messages'
import type { ChatMember, ChatMessage } from '../types/BaseChat.types'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'

const MESSAGES: ChatMessage[] = [
	{ id: '1', text: 'Привет!', sender: 'other', time: '10:00', senderName: 'Анна' },
	{ id: '2', text: 'Здравствуйте', sender: 'me', time: '10:01', status: 'read' },
	{ id: '3', text: 'Как дела?', sender: 'other', time: '10:02', senderName: 'Анна' },
]

const GROUP_MEMBERS: ChatMember[] = [
	{ id: 'a1', name: 'Анна', role: 'admin', status: 'online' },
	{ id: 'm1', name: 'Борис', role: 'member', status: 'offline', warningsCount: 2 },
]

function renderChat(props: Record<string, unknown> = {}, plugins: unknown[] = []) {
	return render(BaseChat, {
		props: { messages: MESSAGES, title: 'Чат с Анной', ...props } as never,
		global: { plugins: plugins as never[] },
	})
}

function getInput(): HTMLTextAreaElement {
	return screen.getByPlaceholderText('Напишите сообщение...') as HTMLTextAreaElement
}

async function enterSelection(): Promise<void> {
	await fireEvent.click(screen.getAllByLabelText('Выбрать сообщение')[0])
}

afterEach(() => {
	vi.restoreAllMocks()
	Reflect.deleteProperty(Element.prototype, 'scrollBy')
})

describe('BaseChat: выбор всех сообщений', () => {
	it('«Выбрать всё» выбирает видимые сообщения и блокируется', async () => {
		const { container, emitted } = renderChat()
		await enterSelection()

		await fireEvent.click(screen.getByRole('button', { name: UI_CHAT_TEXT.SELECT_ALL }))

		expect(container.querySelectorAll('.base-chat-message-list__item--selected')).toHaveLength(3)
		expect(emitted()['message-select']).toHaveLength(3)
		expect(screen.getByRole('button', { name: UI_CHAT_TEXT.SELECT_ALL })).toHaveAttribute('aria-disabled', 'true')
	})

	it('при поиске выбирает только найденные', async () => {
		const { container } = renderChat()
		await fireEvent.click(screen.getByLabelText('Поиск по сообщениям'))
		await userEvent.type(container.querySelector('.base-chat-header__search-input input') as HTMLElement, 'дела')
		await enterSelection()

		await fireEvent.click(screen.getByRole('button', { name: UI_CHAT_TEXT.SELECT_ALL }))

		expect(container.querySelectorAll('.base-chat-message-list__item--selected')).toHaveLength(1)
	})

	it('выбрано невидимое при поиске сообщение: «Выбрать всё» остаётся доступным для найденных', async () => {
		const { container } = renderChat()
		await enterSelection()
		await fireEvent.click(screen.getByLabelText('Поиск по сообщениям'))
		await userEvent.type(container.querySelector('.base-chat-header__search-input input') as HTMLElement, 'дела')

		const selectAll = screen.getByRole('button', { name: UI_CHAT_TEXT.SELECT_ALL })
		expect(selectAll).not.toHaveAttribute('aria-disabled', 'true')
		await fireEvent.click(selectAll)

		expect(container.querySelectorAll('.base-chat-message-list__item--selected')).toHaveLength(1)
		expect(screen.getByRole('button', { name: UI_CHAT_TEXT.SELECT_ALL })).toHaveAttribute('aria-disabled', 'true')
	})
})

describe('BaseChat: смена чата', () => {
	it('закрывает диалог удаления сообщений и сбрасывает выбор', async () => {
		const { container, rerender } = renderChat({ chatId: 'a', isGroup: true, members: GROUP_MEMBERS, currentUserRole: 'admin' })
		await enterSelection()
		await fireEvent.click(screen.getByText('Удалить'))
		expect(screen.getByText('Удалить сообщения?')).toBeInTheDocument()

		await rerender({ chatId: 'b' })

		await waitFor(() => expect(screen.queryByText('Удалить сообщения?')).not.toBeInTheDocument())
		expect(container.querySelector('.base-chat-selection-toolbar')).toBeNull()
	})

	it('закрывает подтверждение исключения', async () => {
		const { rerender } = renderChat({ chatId: 'a', isGroup: true, members: GROUP_MEMBERS, currentUserRole: 'admin' })
		await fireEvent.click(screen.getByLabelText('Информация о чате'))
		await fireEvent.click(screen.getByLabelText('Действия с участником Борис'))
		await fireEvent.click(screen.getByText(UI_CHAT_TEXT.EXCLUDE))
		const confirm = formatMessage(UI_CHAT_TEXT.KICK_CONFIRM, { name: 'Борис' })
		expect(screen.getByText(confirm)).toBeInTheDocument()

		await rerender({ chatId: 'b' })

		await waitFor(() => expect(screen.queryByText(confirm)).not.toBeInTheDocument())
	})

	it('лента пересоздаётся: состояние прокрутки не переезжает в другой чат', async () => {
		const { container, rerender } = renderChat({ chatId: 'a' })
		const before = container.querySelector('.base-chat-message-list')

		await rerender({ chatId: 'b' })

		expect(container.querySelector('.base-chat-message-list')).not.toBe(before)
	})
})

describe('BaseChat: Escape в режиме выбора', () => {
	it('из ленты отменяет выбор и возвращает фокус в поле', async () => {
		const { container } = renderChat()
		await enterSelection()

		await fireEvent.keyDown(container.querySelector('.base-chat-message-list') as HTMLElement, { key: 'Escape' })

		await waitFor(() => expect(container.querySelectorAll('.base-chat-message-list__item--selected')).toHaveLength(0))
		await waitFor(() => expect(getInput()).toHaveFocus())
	})

	it('из панели выбора отменяет выбор', async () => {
		const { container } = renderChat()
		await enterSelection()

		await fireEvent.keyDown(screen.getByRole('button', { name: UI_CHAT_TEXT.SELECT_ALL }), { key: 'Escape' })

		await waitFor(() => expect(container.querySelector('.base-chat-selection-toolbar')).toBeNull())
	})

	it('из окна подтверждения удаления выбор не сбрасывает', async () => {
		const { container } = renderChat()
		await enterSelection()
		await fireEvent.click(screen.getByText('Удалить'))
		expect(screen.getByText('Удалить сообщения?')).toBeInTheDocument()

		await fireEvent.keyDown(screen.getByText('Удалить сообщения?'), { key: 'Escape' })

		expect(container.querySelectorAll('.base-chat-message-list__item--selected')).toHaveLength(1)
	})
})

describe('BaseChat: предупреждения участника', () => {
	async function openProfile(container: Element): Promise<void> {
		await fireEvent.click(screen.getByLabelText('Информация о чате'))
		const mains = container.querySelectorAll('.base-chat-slideover__member-main')
		await fireEvent.click(mains[1] as HTMLElement)
	}

	it('по умолчанию предел 3', async () => {
		const { container } = renderChat({ isGroup: true, members: GROUP_MEMBERS })
		await openProfile(container)

		expect(screen.getByText(formatMessage(UI_CHAT_TEXT.WARNINGS_LIMIT, { count: 2, max: 3 }))).toBeInTheDocument()
	})

	it('проп maxWarnings меняет предел', async () => {
		const { container } = renderChat({ isGroup: true, members: GROUP_MEMBERS, maxWarnings: 10 })
		await openProfile(container)

		expect(screen.getByText(formatMessage(UI_CHAT_TEXT.WARNINGS_LIMIT, { count: 2, max: 10 }))).toBeInTheDocument()
	})

	it('maxWarnings из defaults плагина применяется', async () => {
		const { container } = renderChat({ isGroup: true, members: GROUP_MEMBERS }, [
			createUiKitPlugin({ defaults: { BaseChat: { maxWarnings: 6 } } }),
		])
		await openProfile(container)

		expect(screen.getByText(formatMessage(UI_CHAT_TEXT.WARNINGS_LIMIT, { count: 2, max: 6 }))).toBeInTheDocument()
	})
})

describe('BaseChat: write-message', () => {
	async function clickWrite(container: Element): Promise<void> {
		await fireEvent.click(screen.getByLabelText('Информация о чате'))
		await fireEvent.click(container.querySelector('.base-chat-slideover__member-main') as HTMLElement)
		await fireEvent.click(screen.getByText('Написать сообщение'))
	}

	it('без слушателей эмитит только write-message и без предупреждения', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const { container, emitted } = renderChat({ isGroup: true, members: GROUP_MEMBERS })

		await clickWrite(container)

		expect((emitted()['write-message'] as Array<[string]>).at(-1)?.[0]).toBe('a1')
		expect(emitted()['avatar-click']).toBeUndefined()
		expect(warn).not.toHaveBeenCalled()
	})

	it('только со слушателем avatar-click приходит avatar-click и предупреждение об устаревании', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const onAvatarClick = vi.fn()
		const { container } = renderChat({ isGroup: true, members: GROUP_MEMBERS, onAvatarClick })

		await clickWrite(container)

		expect(onAvatarClick).toHaveBeenCalledExactlyOnceWith('a1')
		expect(warn).toHaveBeenCalledWith(`[rise-ui-kit] ${formatMessage(UI_WARNINGS.CHAT_WRITE_MESSAGE_AVATAR_CLICK, {})}`)
	})

	it('при обоих слушателях реакция одна: write-message, а avatar-click не вызывается', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const onAvatarClick = vi.fn()
		const onWriteMessage = vi.fn()
		const { container } = renderChat({ isGroup: true, members: GROUP_MEMBERS, onAvatarClick, onWriteMessage })

		await clickWrite(container)

		expect(onWriteMessage).toHaveBeenCalledExactlyOnceWith('a1')
		expect(onAvatarClick).not.toHaveBeenCalled()
		expect(warn).not.toHaveBeenCalled()
	})
})

describe('BaseChat: ArrowUp в пустом поле', () => {
	it('начинает правку последнего своего сообщения', async () => {
		renderChat()

		await fireEvent.keyDown(getInput(), { key: 'ArrowUp' })

		await waitFor(() => expect(getInput()).toHaveValue('Здравствуйте'))
		expect(screen.getByLabelText(UI_CHAT_TEXT.CANCEL_EDIT_ARIA)).toBeInTheDocument()
	})

	it('Escape отменяет правку', async () => {
		renderChat()
		await fireEvent.keyDown(getInput(), { key: 'ArrowUp' })
		await waitFor(() => expect(getInput()).toHaveValue('Здравствуйте'))

		await fireEvent.keyDown(getInput(), { key: 'Escape' })

		await waitFor(() => expect(getInput()).toHaveValue(''))
	})

	it('если своих отправленных сообщений нет, поле остаётся пустым', async () => {
		renderChat({ messages: [MESSAGES[0]] })

		await fireEvent.keyDown(getInput(), { key: 'ArrowUp' })

		expect(getInput()).toHaveValue('')
	})
})

describe('BaseChat: jump-to-message', () => {
	const FAR: ChatMessage = { id: 'far', text: 'Давнее', sender: 'other', time: '09:00', isPinned: true }

	it('закреп вне загруженной истории: событие, а после подгрузки прокрутка', async () => {
		const scrollBy = vi.fn()
		Element.prototype.scrollBy = scrollBy
		const { container, emitted, rerender } = renderChat({ pinnedMessages: [FAR] })

		await fireEvent.click(container.querySelector('.base-chat-pinned-panel__content') as HTMLElement)

		expect(emitted()['jump-to-message']).toEqual([['far']])
		expect(scrollBy).not.toHaveBeenCalled()

		await rerender({ messages: [FAR, ...MESSAGES], pinnedMessages: [FAR] })

		await waitFor(() => expect(scrollBy).toHaveBeenCalledOnce())
		expect(container.querySelector('#message-far')).toBeInTheDocument()
	})

	it('загруженный закреп прокручивается без события', async () => {
		const scrollBy = vi.fn()
		Element.prototype.scrollBy = scrollBy
		const { container, emitted } = renderChat({ messages: [FAR, ...MESSAGES] })

		await fireEvent.click(container.querySelector('.base-chat-pinned-panel__content') as HTMLElement)

		expect(scrollBy).toHaveBeenCalledOnce()
		expect(emitted()['jump-to-message']).toBeUndefined()
	})
})
