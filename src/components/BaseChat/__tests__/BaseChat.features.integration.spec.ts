import '@testing-library/jest-dom/vitest'
import { beforeEach, vi } from 'vitest'
import BaseChat from '../ui/BaseChat.vue'
import { formatMessage } from '@/locales/state'
import userEvent from '@testing-library/user-event'
import { downloadFile } from '@utils/media/fileUtils'
import { UI_CHAT_TEXT, UI_TEXT } from '@/locales/messages'
import type { ChatMember, ChatMessage } from '../types/BaseChat.types'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'

vi.mock('@utils/media/fileUtils', async importOriginal => ({
	...(await importOriginal<typeof import('@utils/media/fileUtils')>()),
	downloadFile: vi.fn(),
}))

const MESSAGES: ChatMessage[] = [
	{ id: '1', text: 'Привет!', sender: 'other', time: '10:00', senderName: 'Анна' },
	{ id: '2', text: 'Здравствуйте', sender: 'me', time: '10:01', status: 'read' },
]

const GROUP_MEMBERS: ChatMember[] = [
	{ id: 'a1', name: 'Анна', role: 'admin', status: 'online' },
	{ id: 'm1', name: 'Борис', role: 'member', status: 'offline' },
]

function renderChat(props: Partial<InstanceType<typeof BaseChat>['$props']> = {}) {
	return render(BaseChat, { props: { messages: MESSAGES, title: 'Чат с Анной', ...props } })
}

function openMenu(container: Element, index: number): void {
	fireEvent.contextMenu(container.querySelectorAll('.base-chat-message-list__bubble')[index] as HTMLElement)
}

function getInput(): HTMLTextAreaElement {
	return screen.getByPlaceholderText('Напишите сообщение...') as HTMLTextAreaElement
}

describe('BaseChat: подтверждение исключения и бана', () => {
	async function openMemberMenu(name: string, action: string): Promise<void> {
		await fireEvent.click(screen.getByLabelText('Информация о чате'))
		await fireEvent.click(screen.getByLabelText(`Действия с участником ${name}`))
		await fireEvent.click(screen.getByText(action))
	}

	function renderAdminGroup() {
		return renderChat({ isGroup: true, members: GROUP_MEMBERS, currentUserRole: 'admin' })
	}

	it('исключение открывает диалог с именем участника и ничего не эмитит до подтверждения', async () => {
		const { emitted } = renderAdminGroup()

		await openMemberMenu('Борис', 'Исключить')

		expect(await screen.findByRole('dialog', { name: UI_CHAT_TEXT.EXCLUDE })).toBeInTheDocument()
		expect(screen.getByText(formatMessage(UI_CHAT_TEXT.KICK_CONFIRM, { name: 'Борис' }))).toBeInTheDocument()
		expect(emitted()['kick-member']).toBeUndefined()
	})

	it('бан открывает диалог с именем участника и ничего не эмитит до подтверждения', async () => {
		const { emitted } = renderAdminGroup()

		await openMemberMenu('Борис', 'Забанить')

		expect(await screen.findByRole('dialog', { name: UI_CHAT_TEXT.BAN })).toBeInTheDocument()
		expect(screen.getByText(formatMessage(UI_CHAT_TEXT.BAN_CONFIRM, { name: 'Борис' }))).toBeInTheDocument()
		expect(emitted()['ban-member']).toBeUndefined()
	})

	it('«Отмена» закрывает диалог без событий', async () => {
		const { emitted } = renderAdminGroup()
		await openMemberMenu('Борис', 'Исключить')
		await screen.findByRole('dialog', { name: UI_CHAT_TEXT.EXCLUDE })

		await fireEvent.click(screen.getByRole('button', { name: UI_TEXT.CANCEL }))

		await waitFor(() => expect(screen.queryByRole('dialog', { name: UI_CHAT_TEXT.EXCLUDE })).not.toBeInTheDocument())
		expect(emitted()['kick-member']).toBeUndefined()
	})

	it('«Подтвердить» эмитит kick-member с id и закрывает диалог', async () => {
		const { emitted } = renderAdminGroup()
		await openMemberMenu('Борис', 'Исключить')

		await fireEvent.click(await screen.findByRole('button', { name: UI_TEXT.CONFIRM }))

		expect(emitted()['kick-member']).toEqual([['m1']])
		await waitFor(() => expect(screen.queryByRole('dialog', { name: UI_CHAT_TEXT.EXCLUDE })).not.toBeInTheDocument())
	})

	it('«Подтвердить» эмитит ban-member только с memberId', async () => {
		const { emitted } = renderAdminGroup()
		await openMemberMenu('Борис', 'Забанить')

		await fireEvent.click(await screen.findByRole('button', { name: UI_TEXT.CONFIRM }))

		expect(emitted()['ban-member']).toEqual([[{ memberId: 'm1' }]])
	})

	it('участник вне members подтверждается по id, если имени нет', async () => {
		renderChat({ isGroup: true, members: [{ ...GROUP_MEMBERS[0], id: 'a1' }, GROUP_MEMBERS[1]], currentUserRole: 'admin' })
		await openMemberMenu('Анна', 'Забанить')

		expect(await screen.findByText(formatMessage(UI_CHAT_TEXT.BAN_CONFIRM, { name: 'Анна' }))).toBeInTheDocument()
	})

	it('currentUserId скрывает действия админа над самим собой', async () => {
		renderChat({ isGroup: true, members: GROUP_MEMBERS, currentUserRole: 'admin', currentUserId: 'a1' })
		await fireEvent.click(screen.getByLabelText('Информация о чате'))

		expect(screen.queryByLabelText('Действия с участником Анна')).not.toBeInTheDocument()
		expect(screen.getByLabelText('Действия с участником Борис')).toBeInTheDocument()
	})

	it('«Добавить участника» эмитит add-member без данных', async () => {
		const { emitted } = renderAdminGroup()
		await fireEvent.click(screen.getByLabelText('Информация о чате'))

		await fireEvent.click(screen.getByRole('button', { name: UI_CHAT_TEXT.ADD_MEMBER }))

		expect(emitted()['add-member']).toEqual([[]])
	})
})

describe('BaseChat: правка сообщения', () => {
	it('«Изменить» подставляет текст в поле, Enter эмитит edit с id и закрывает панель правки', async () => {
		const user = userEvent.setup()
		const { container, emitted } = renderChat()

		openMenu(container, 1)
		await fireEvent.click(await screen.findByRole('menuitem', { name: UI_CHAT_TEXT.EDIT }))

		const input = getInput()
		await waitFor(() => expect(input.value).toBe('Здравствуйте'))
		expect(screen.getByText(UI_CHAT_TEXT.EDITING)).toBeInTheDocument()

		await user.type(input, '!{Enter}')

		expect(emitted().edit).toEqual([[{ messageId: '2', text: 'Здравствуйте!' }]])
		expect(emitted().send).toBeUndefined()
		await waitFor(() => expect(screen.queryByText(UI_CHAT_TEXT.EDITING)).not.toBeInTheDocument())
		expect(input.value).toBe('')
	})

	it('Escape отменяет правку и возвращает пустое поле', async () => {
		const user = userEvent.setup()
		const { container, emitted } = renderChat()
		openMenu(container, 1)
		await fireEvent.click(await screen.findByRole('menuitem', { name: UI_CHAT_TEXT.EDIT }))
		const input = getInput()
		await waitFor(() => expect(input.value).toBe('Здравствуйте'))

		await user.type(input, '{Escape}')

		await waitFor(() => expect(screen.queryByText(UI_CHAT_TEXT.EDITING)).not.toBeInTheDocument())
		expect(emitted().edit).toBeUndefined()
		expect(input.value).toBe('')
	})

	it('кнопка отмены в панели правки закрывает её', async () => {
		const { container } = renderChat()
		openMenu(container, 1)
		await fireEvent.click(await screen.findByRole('menuitem', { name: UI_CHAT_TEXT.EDIT }))

		await fireEvent.click(await screen.findByRole('button', { name: UI_CHAT_TEXT.CANCEL_EDIT_ARIA }))

		await waitFor(() => expect(screen.queryByText(UI_CHAT_TEXT.EDITING)).not.toBeInTheDocument())
	})

	it('у чужого сообщения «Изменить» в меню нет', async () => {
		const { container } = renderChat()

		openMenu(container, 0)
		await screen.findByRole('menu')

		expect(screen.queryByRole('menuitem', { name: UI_CHAT_TEXT.EDIT })).not.toBeInTheDocument()
	})

	it('isEdited показывает пометку «изменено»', () => {
		renderChat({ messages: [{ ...MESSAGES[1], isEdited: true }] })

		expect(screen.getByText(UI_CHAT_TEXT.EDITED)).toBeInTheDocument()
	})
})

describe('BaseChat: закрепы — проп, открепление из меню и границы', () => {
	const PINNED: ChatMessage[] = [
		{ id: '1', text: 'Закреп 1', sender: 'me', time: '10:00', isPinned: true },
		{ id: '2', text: 'Закреп 2', sender: 'me', time: '10:01', isPinned: true },
		{ id: '3', text: 'Закреп 3', sender: 'me', time: '10:02', isPinned: true },
	]

	it('«Открепить» в меню закреплённого сообщения эмитит unpin-message', async () => {
		const { container, emitted } = renderChat({ messages: [PINNED[0]], currentUserRole: 'admin' })

		openMenu(container, 0)
		await fireEvent.click(await screen.findByRole('menuitem', { name: UI_CHAT_TEXT.UNPIN }))

		expect(emitted()['unpin-message']).toEqual([['1']])
		expect(emitted()['pin-message']).toBeUndefined()
	})

	it('проп pinnedMessages задаёт панель независимо от isPinned в messages', () => {
		renderChat({
			pinnedMessages: [
				{ id: 'x1', text: 'Внешний 1', sender: 'other', time: '09:00' },
				{ id: 'x2', text: 'Внешний 2', sender: 'other', time: '09:01' },
			],
		})

		expect(screen.getByText('Закреплённое сообщение (2 из 2)')).toBeInTheDocument()
		expect(screen.getByText('Внешний 2')).toBeInTheDocument()
	})

	it('после открепления последнего счётчик не выходит за список (не «3 из 2»)', async () => {
		const { rerender } = renderChat({ messages: PINNED })
		expect(screen.getByText('Закреплённое сообщение (3 из 3)')).toBeInTheDocument()

		await rerender({ messages: PINNED.map(item => (item.id === '3' ? { ...item, isPinned: false } : item)) })

		expect(screen.getByText('Закреплённое сообщение (2 из 2)')).toBeInTheDocument()
		expect(screen.queryByText(/3 из 2/)).not.toBeInTheDocument()
	})
})

describe('BaseChat: событие search', () => {
	it('эмитит поисковый запрос и пустую строку при закрытии поиска', async () => {
		const user = userEvent.setup()
		const { container, emitted } = renderChat()

		await fireEvent.click(screen.getByLabelText('Поиск по сообщениям'))
		await user.type(container.querySelector('.base-chat-header__search-input input') as HTMLInputElement, 'При')
		expect((emitted().search as Array<[string]>).at(-1)).toEqual(['При'])

		await fireEvent.click(screen.getByLabelText('Закрыть поиск'))

		expect((emitted().search as Array<[string]>).at(-1)).toEqual([''])
	})

	it('без поиска событие не эмитится', () => {
		const { emitted } = renderChat()

		expect(emitted().search).toBeUndefined()
	})
})

describe('BaseChat: смена chatId', () => {
	it('сбрасывает ответ, поиск и черновик в поле ввода', async () => {
		const user = userEvent.setup()
		const { container, rerender } = renderChat({ chatId: 'a' })
		openMenu(container, 0)
		await fireEvent.click(await screen.findByRole('menuitem', { name: 'Ответить' }))
		expect(await screen.findByLabelText('Отменить ответ на сообщение')).toBeInTheDocument()
		await user.type(getInput(), 'Черновик')
		await fireEvent.click(screen.getByLabelText('Поиск по сообщениям'))
		await user.type(container.querySelector('.base-chat-header__search-input input') as HTMLInputElement, 'При')

		await rerender({ chatId: 'b' })

		await waitFor(() => expect(screen.queryByLabelText('Отменить ответ на сообщение')).not.toBeInTheDocument())
		expect(getInput().value).toBe('')
		expect(container.querySelector('.base-chat-header__search-input')).toBeNull()
		expect(container.querySelectorAll('.base-chat-message-list__item')).toHaveLength(2)
	})

	it('закрывает открытую панель «Информация»', async () => {
		const { rerender } = renderChat({ chatId: 'a', isGroup: true, members: GROUP_MEMBERS })
		await fireEvent.click(screen.getByLabelText('Информация о чате'))
		expect(await screen.findByRole('dialog', { name: UI_CHAT_TEXT.INFORMATION })).toBeInTheDocument()

		await rerender({ chatId: 'b' })

		await waitFor(() => expect(screen.queryByRole('dialog', { name: UI_CHAT_TEXT.INFORMATION })).not.toBeInTheDocument())
	})

	it('без смены chatId черновик остаётся', async () => {
		const user = userEvent.setup()
		const { rerender } = renderChat({ chatId: 'a' })
		await user.type(getInput(), 'Черновик')

		await rerender({ title: 'Другой заголовок' })

		expect(getInput().value).toBe('Черновик')
	})
})

describe('BaseChat: загрузка ленты', () => {
	it('isLoading показывает скелетон вместо сообщений', () => {
		renderChat({ isLoading: true })

		expect(screen.getByRole('status', { name: UI_CHAT_TEXT.LOADING_MESSAGES })).toBeInTheDocument()
		expect(screen.queryByText('Привет!')).not.toBeInTheDocument()
	})

	it('isLoadingMore показывает индикатор подгрузки', () => {
		renderChat({ isLoadingMore: true })

		expect(screen.getByRole('status', { name: UI_CHAT_TEXT.LOADING_MORE })).toBeInTheDocument()
	})

	it('hasMoreMessages: короткая лента сразу эмитит load-more, а без него — нет', () => {
		const more = renderChat({ hasMoreMessages: true })
		expect(more.emitted()['load-more']).toHaveLength(1)
		more.unmount()

		const none = renderChat()
		expect(none.emitted()['load-more']).toBeUndefined()
	})

	it('lastReadMessageId и createdAt дают разделители «Непрочитанные» и дат', () => {
		renderChat({
			today: new Date(2026, 2, 10, 15),
			lastReadMessageId: '1',
			messages: [
				{ id: '1', text: 'Старое', sender: 'other', time: '10:00', createdAt: new Date(2026, 2, 9, 10) },
				{ id: '2', text: 'Новое', sender: 'other', time: '10:01', createdAt: new Date(2026, 2, 10, 10) },
			],
		})

		expect(screen.getByRole('separator', { name: UI_CHAT_TEXT.YESTERDAY })).toBeInTheDocument()
		expect(screen.getByRole('separator', { name: UI_CHAT_TEXT.TODAY })).toBeInTheDocument()
		expect(screen.getByRole('separator', { name: '1 непрочитанное сообщение' })).toBeInTheDocument()
	})
})

describe('BaseChat: autoDownload', () => {
	const FILE_MESSAGE: ChatMessage = {
		id: '1',
		text: '',
		sender: 'me',
		time: '10:00',
		attachments: [{ id: 'f1', name: 'doc.pdf', type: 'file', url: 'https://ex.com/doc.pdf' }],
	}

	async function clickFile(): Promise<void> {
		await fireEvent.click(screen.getByLabelText('Информация о чате'))
		await fireEvent.click(screen.getByText('Файлы'))
		await fireEvent.click(document.querySelector('.base-chat-slideover__file-main') as HTMLElement)
	}

	beforeEach(() => {
		vi.mocked(downloadFile).mockClear()
	})

	it('по умолчанию скачивает файл и эмитит download-file', async () => {
		const { emitted } = renderChat({ isGroup: true, members: GROUP_MEMBERS, messages: [FILE_MESSAGE] })

		await clickFile()

		expect(downloadFile).toHaveBeenCalledWith('https://ex.com/doc.pdf', 'doc.pdf')
		expect(emitted()['download-file']).toHaveLength(1)
	})

	it('autoDownload=false только эмитит download-file и файл не скачивает', async () => {
		const { emitted } = renderChat({ isGroup: true, members: GROUP_MEMBERS, messages: [FILE_MESSAGE], autoDownload: false })

		await clickFile()

		expect(downloadFile).not.toHaveBeenCalled()
		expect(emitted()['download-file']).toHaveLength(1)
	})
})

describe('BaseChat: ограничения вложений', () => {
	function pickFiles(container: Element, files: File[]): Promise<unknown> {
		const fileInput = container.querySelector('.base-chat-input__file-input') as HTMLInputElement
		Object.defineProperty(fileInput, 'files', { value: files, configurable: true })
		return fireEvent.change(fileInput)
	}

	it('слишком большой файл: сообщение на экране, событие error, attach не вызван', async () => {
		const { container, emitted } = renderChat({ maxFileSize: 1 })

		await pickFiles(container, [new File([new Uint8Array(2 * 1024 * 1024)], 'big.bin', { type: 'application/octet-stream' })])

		const alert = await screen.findByRole('alert')
		expect(alert).toHaveTextContent(formatMessage(UI_TEXT.FILE_TOO_LARGE, { name: 'big.bin', size: '1' }))
		expect(emitted().error).toHaveLength(1)
		expect((emitted().error as unknown[][])[0][0]).toMatchObject({
			type: 'attachment',
			detail: [expect.objectContaining({ name: 'big.bin', reason: 'size' })],
		})
		expect(emitted().attach).toBeUndefined()
	})

	it('accept передаётся в поле выбора файла', () => {
		const { container } = renderChat({ accept: '.pdf' })

		expect(container.querySelector('.base-chat-input__file-input')).toHaveAttribute('accept', '.pdf')
	})
})

describe('BaseChat: неотправленное сообщение', () => {
	const failed: ChatMessage = { id: 'f1', text: 'Не дошло', sender: 'me', time: '10:05', status: 'failed' }

	it('«Повторить» эмитит retry-message с id', async () => {
		const { emitted } = renderChat({ messages: [failed] })

		await fireEvent.click(screen.getByRole('button', { name: UI_CHAT_TEXT.RETRY_ARIA }))

		expect(emitted()['retry-message']).toEqual([['f1']])
	})

	it('«Удалить» эмитит discard-message с id', async () => {
		const { emitted } = renderChat({ messages: [failed] })

		await fireEvent.click(screen.getByRole('button', { name: UI_CHAT_TEXT.DISCARD_ARIA }))

		expect(emitted()['discard-message']).toEqual([['f1']])
	})
})
