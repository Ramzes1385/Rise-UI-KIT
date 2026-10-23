import '@testing-library/jest-dom/vitest'
import { UI_CHAT_TEXT } from '@/locales/messages'
import userEvent from '@testing-library/user-event'
import ChatInput from '../../ui/ChatInput/ChatInput.vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/vue'
import type { ChatCommand, ChatMember, ChatMessage } from '../../types/BaseChat.types'

vi.setConfig({ testTimeout: 60_000 })

const MEMBERS: ChatMember[] = [
	{ id: 'a1', name: 'Анна', role: 'admin' },
	{ id: 'm1', name: 'Борис', role: 'member' },
]

const COMMANDS: ChatCommand[] = [
	{ name: 'help', description: 'Показать справку по командам' },
	{ name: 'clear', description: 'Очистить историю сообщений' },
	{ name: 'mute', description: 'Включить/выключить уведомления' },
]

function getInput(): HTMLTextAreaElement {
	return screen.getByPlaceholderText('Напишите сообщение...') as HTMLTextAreaElement
}

describe('ChatInput unit', () => {
	describe('автодополнение упоминаний (@)', () => {
		it('должен показывать список участников и подставлять упоминание когда вводится @ без пробела перед ним', async () => {
			const user = userEvent.setup()
			render(ChatInput, { props: { isGroup: true, members: MEMBERS } })

			const input = getInput()
			await user.click(input)
			await user.type(input, '@')

			const items = await screen.findAllByText('Анна')
			expect(items.length).toBeGreaterThan(0)

			await fireEvent.click(screen.getAllByText('Анна')[0].closest('.base-chat-input__autocomplete-item')!)

			expect(getInput().value).toBe('@Анна ')
		})

		it('должен фильтровать участников по совпадению роли когда запрос совпадает с ролью', async () => {
			const user = userEvent.setup()
			render(ChatInput, { props: { isGroup: true, members: MEMBERS } })

			const input = getInput()
			await user.click(input)
			await user.type(input, '@admin')

			expect(await screen.findByText('Анна')).toBeInTheDocument()
			expect(screen.queryByText('Борис')).toBeNull()
		})

		it('должен фильтровать участников без роли только по имени', async () => {
			const user = userEvent.setup()
			render(ChatInput, {
				props: { isGroup: true, members: [{ id: 'x', name: 'Виктор' }] },
			})

			const input = getInput()
			await user.click(input)
			await user.type(input, '@вик')

			expect(await screen.findByText('Виктор')).toBeInTheDocument()
		})

		it('должен подставлять упоминание после уже введённого текста с пробелом (ветка lastSpaceIndex !== -1)', async () => {
			const user = userEvent.setup()
			render(ChatInput, { props: { isGroup: true, members: MEMBERS } })

			const input = getInput()
			await user.click(input)
			await user.type(input, 'Привет @')

			await fireEvent.click(screen.getAllByText('Анна')[0].closest('.base-chat-input__autocomplete-item')!)

			expect(getInput().value).toBe('Привет @Анна ')
		})
	})

	describe('автодополнение команд (/)', () => {
		it('должен показывать список команд и подставлять команду когда вводится / без пробела перед ним', async () => {
			const user = userEvent.setup()
			render(ChatInput, { props: { isGroup: true, members: MEMBERS, commands: COMMANDS } })

			const input = getInput()
			await user.click(input)
			await user.type(input, '/')

			const cmd = await screen.findByText('/help')
			await fireEvent.click(cmd.closest('.base-chat-input__autocomplete-item')!)

			expect(getInput().value).toBe('/help ')
		})

		it('должен подставлять команду после текста с пробелом (ветка lastSpaceIndex !== -1)', async () => {
			const user = userEvent.setup()
			render(ChatInput, { props: { isGroup: true, members: MEMBERS, commands: COMMANDS } })

			const input = getInput()
			await user.click(input)
			await user.type(input, 'текст /')

			const cmd = await screen.findByText('/clear')
			await fireEvent.click(cmd.closest('.base-chat-input__autocomplete-item')!)

			expect(getInput().value).toBe('текст /clear ')
		})
	})

	describe('кнопка команд', () => {
		it('не должна отображаться когда команды не переданы', () => {
			render(ChatInput)
			expect(screen.queryByLabelText('Показать команды')).toBeNull()
		})

		it('должна отображаться когда переданы команды', () => {
			render(ChatInput, { props: { commands: COMMANDS } })
			expect(screen.getByLabelText('Показать команды')).toBeInTheDocument()
		})

		it('должна открывать список команд по клику и вставлять "/" в пустое поле', async () => {
			const { container } = render(ChatInput, { props: { commands: COMMANDS } })

			await fireEvent.click(screen.getByLabelText('Показать команды'))

			expect(container.querySelector('.base-chat-input__autocomplete--commands')).toBeInTheDocument()
			expect(getInput().value).toBe('/')
		})

		it('должна закрывать список команд при повторном клике', async () => {
			const { container } = render(ChatInput, { props: { commands: COMMANDS } })

			const btn = screen.getByLabelText('Показать команды')
			await fireEvent.click(btn)
			expect(container.querySelector('.base-chat-input__autocomplete--commands')).toBeInTheDocument()

			await fireEvent.click(btn)
			expect(container.querySelector('.base-chat-input__autocomplete--commands')).toBeNull()
		})

		it('должна вставлять " /" в каретку и не затирать уже введённый текст', async () => {
			const user = userEvent.setup()
			const { container } = render(ChatInput, { props: { commands: COMMANDS } })

			await user.type(getInput(), 'Привет')
			await fireEvent.click(screen.getByLabelText('Показать команды'))

			expect(getInput().value).toBe('Привет /')
			expect(container.querySelector('.base-chat-input__autocomplete--commands')).toBeInTheDocument()
		})

		it('должна показывать команды стабильно после открытия с непустым полем (не закрываться по keyup)', async () => {
			const user = userEvent.setup()
			const { container } = render(ChatInput, { props: { commands: COMMANDS } })

			await user.type(getInput(), 'Привет')
			await fireEvent.click(screen.getByLabelText('Показать команды'))

			await fireEvent.keyUp(getInput())
			await fireEvent.click(getInput())

			expect(container.querySelector('.base-chat-input__autocomplete--commands')).toBeInTheDocument()
		})
	})

	describe('навигация по автодополнению с клавиатуры', () => {
		it('Enter на открытой подсказке @ только выбирает участника и не отправляет сообщение; отправка — следующим Enter', async () => {
			const user = userEvent.setup()
			const { emitted } = render(ChatInput, { props: { isGroup: true, members: MEMBERS } })

			const input = getInput()
			await user.click(input)
			await user.type(input, '@')
			await screen.findByText('Анна')

			await fireEvent.keyDown(input, { key: 'ArrowDown' })
			await fireEvent.keyDown(input, { key: 'ArrowUp' })
			await fireEvent.keyDown(input, { key: 'Enter' })

			await waitFor(() => expect(getInput().value).toBe('@Анна '))
			await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())
			expect(emitted().send).toBeUndefined()

			await fireEvent.keyDown(input, { key: 'Enter' })

			const sendEvents = emitted().send as Array<[{ text: string }]>
			expect(sendEvents).toHaveLength(1)
			expect(sendEvents[0][0].text).toBe('@Анна')
		})

		it('стрелка вниз сдвигает выбор, и Enter подставляет второго участника без отправки', async () => {
			const user = userEvent.setup()
			const { emitted } = render(ChatInput, { props: { isGroup: true, members: MEMBERS } })

			const input = getInput()
			await user.type(input, '@')
			await screen.findByRole('listbox')
			await fireEvent.keyDown(input, { key: 'ArrowDown' })
			await fireEvent.keyDown(input, { key: 'Enter' })

			await waitFor(() => expect(getInput().value).toBe('@Борис '))
			expect(emitted().send).toBeUndefined()
		})

		it('должен закрывать список упоминаний клавишей Escape (keydown и keyup) и связывать поле со списком', async () => {
			const user = userEvent.setup()
			render(ChatInput, { props: { isGroup: true, members: MEMBERS } })

			const input = getInput()
			await user.type(input, '@')
			const listbox = await screen.findByRole('listbox', { name: 'Участники для упоминания' })
			const firstOption = screen.getAllByRole('option')[0]
			expect(input).toHaveAttribute('aria-controls', listbox.id)
			expect(input).toHaveAttribute('aria-activedescendant', firstOption.id)
			expect(firstOption).toHaveAttribute('aria-selected', 'true')

			await user.keyboard('{Escape}')

			expect(screen.queryByRole('listbox')).toBeNull()
			expect(input).not.toHaveAttribute('aria-activedescendant')
		})

		it('должен закрывать список упоминаний по Escape', async () => {
			const user = userEvent.setup()
			const { container } = render(ChatInput, { props: { isGroup: true, members: MEMBERS } })

			const input = getInput()
			await user.click(input)
			await user.type(input, '@')
			await screen.findByText('Анна')

			await fireEvent.keyDown(input, { key: 'Tab' })
			expect(container.querySelector('.base-chat-input__autocomplete--mentions')).toBeInTheDocument()

			await fireEvent.keyDown(input, { key: 'Escape' })

			expect(container.querySelector('.base-chat-input__autocomplete--mentions')).toBeNull()
		})

		it('Enter на открытой подсказке / только подставляет команду и не отправляет сообщение; отправка — следующим Enter', async () => {
			const user = userEvent.setup()
			const { emitted } = render(ChatInput, { props: { isGroup: true, members: MEMBERS, commands: COMMANDS } })

			const input = getInput()
			await user.click(input)
			await user.type(input, '/')
			await screen.findByText('/help')

			await fireEvent.keyDown(input, { key: 'ArrowDown' })
			await fireEvent.keyDown(input, { key: 'ArrowUp' })
			await fireEvent.keyDown(input, { key: 'Enter' })

			await waitFor(() => expect(getInput().value).toBe('/help '))
			await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())
			expect(emitted().send).toBeUndefined()

			await fireEvent.keyDown(input, { key: 'Enter' })

			const sendEvents = emitted().send as Array<[{ text: string }]>
			expect(sendEvents).toHaveLength(1)
			expect(sendEvents[0][0].text).toBe('/help')
		})

		it('должен закрывать список команд по Escape', async () => {
			const user = userEvent.setup()
			const { container } = render(ChatInput, { props: { isGroup: true, members: MEMBERS, commands: COMMANDS } })

			const input = getInput()
			await user.click(input)
			await user.type(input, '/')
			await screen.findByText('/help')

			await fireEvent.keyDown(input, { key: 'Tab' })
			expect(container.querySelector('.base-chat-input__autocomplete--commands')).toBeInTheDocument()

			await fireEvent.keyDown(input, { key: 'Escape' })

			expect(container.querySelector('.base-chat-input__autocomplete--commands')).toBeNull()
		})
	})

	describe('вложения файлов', () => {
		beforeEach(() => {
			vi.stubGlobal('URL', {
				...URL,
				createObjectURL: vi.fn(() => 'blob:mock-url'),
				revokeObjectURL: vi.fn(),
			})
		})

		afterEach(() => {
			vi.unstubAllGlobals()
		})

		it('должен показывать превью файла и эмитить attach при выборе файла', async () => {
			const { container, emitted } = render(ChatInput)

			const fileInput = container.querySelector('.base-chat-input__file-input') as HTMLInputElement
			const file = new File(['hello'], 'doc.txt', { type: 'text/plain' })
			await fireEvent.update(fileInput, '')
			Object.defineProperty(fileInput, 'files', { value: [file], configurable: true })
			await fireEvent.change(fileInput)

			expect(emitted().attach).toBeTruthy()
			expect(screen.getByText('doc.txt')).toBeInTheDocument()
		})

		it('должен показывать превью изображения когда выбран файл image/*', async () => {
			const { container } = render(ChatInput)

			const fileInput = container.querySelector('.base-chat-input__file-input') as HTMLInputElement
			const file = new File(['img'], 'pic.png', { type: 'image/png' })
			Object.defineProperty(fileInput, 'files', { value: [file], configurable: true })
			await fireEvent.change(fileInput)

			expect(container.querySelector('.base-chat-input__preview-image')).toBeInTheDocument()
		})

		it('должен удалять вложение с blob-URL и вызывать revokeObjectURL', async () => {
			const { container } = render(ChatInput)

			const fileInput = container.querySelector('.base-chat-input__file-input') as HTMLInputElement
			const file = new File(['hello'], 'doc.txt', { type: 'text/plain' })
			Object.defineProperty(fileInput, 'files', { value: [file], configurable: true })
			await fireEvent.change(fileInput)

			expect(screen.getByText('doc.txt')).toBeInTheDocument()

			await fireEvent.click(screen.getByLabelText('Удалить вложение doc.txt'))

			expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
			expect(screen.queryByText('doc.txt')).toBeNull()
		})

		it('должен отправлять сообщение с вложениями через emit send', async () => {
			const { container, emitted } = render(ChatInput)

			const fileInput = container.querySelector('.base-chat-input__file-input') as HTMLInputElement
			const file = new File(['hello'], 'doc.txt', { type: 'text/plain' })
			Object.defineProperty(fileInput, 'files', { value: [file], configurable: true })
			await fireEvent.change(fileInput)

			await fireEvent.click(screen.getByLabelText('Отправить сообщение'))

			const sendEvents = emitted().send as Array<[{ text: string; attachments?: unknown[] }]>
			expect(sendEvents).toBeTruthy()
			expect(sendEvents[0][0].attachments).toHaveLength(1)
			expect(sendEvents[0][0].text).toBe('')
		})

		it('должен очищать превью после отправки сообщения с вложением', async () => {
			const { container } = render(ChatInput)

			const fileInput = container.querySelector('.base-chat-input__file-input') as HTMLInputElement
			const file = new File(['hello'], 'doc.txt', { type: 'text/plain' })
			Object.defineProperty(fileInput, 'files', { value: [file], configurable: true })
			await fireEvent.change(fileInput)

			await fireEvent.click(screen.getByLabelText('Отправить сообщение'))

			expect(container.querySelector('.base-chat-input__previews')).toBeNull()
		})
	})

	describe('удаление вложения без blob-URL', () => {
		it('должен удалять вложение без вызова revokeObjectURL когда URL не blob', async () => {
			vi.stubGlobal('URL', {
				...URL,
				createObjectURL: vi.fn(() => 'data:text/plain;base64,aGVsbG8='),
				revokeObjectURL: vi.fn(),
			})

			const { container } = render(ChatInput)
			const fileInput = container.querySelector('.base-chat-input__file-input') as HTMLInputElement
			const file = new File(['hello'], 'note.txt', { type: 'text/plain' })
			Object.defineProperty(fileInput, 'files', { value: [file], configurable: true })
			await fireEvent.change(fileInput)

			await fireEvent.click(screen.getByLabelText('Удалить вложение note.txt'))

			expect(URL.revokeObjectURL).not.toHaveBeenCalled()
			vi.unstubAllGlobals()
		})
	})

	describe('отправка текста', () => {
		it('должен эмитить send с текстом и очищать поле', async () => {
			const user = userEvent.setup()
			const { emitted } = render(ChatInput)

			await user.type(getInput(), 'Привет')
			await fireEvent.click(screen.getByLabelText('Отправить сообщение'))

			const sendEvents = emitted().send as Array<[{ text: string; attachments?: unknown[] }]>
			expect(sendEvents[0][0].text).toBe('Привет')
			expect(sendEvents[0][0].attachments).toBeUndefined()
			expect(getInput().value).toBe('')
			expect(getInput()).toHaveFocus()
		})

		it('не должен эмитить send при пустом поле и без вложений', async () => {
			const { emitted } = render(ChatInput)

			await fireEvent.keyDown(getInput(), { key: 'Enter' })

			expect(emitted().send).toBeUndefined()
		})

		it('поле — многострочное с доступным именем: Shift+Enter переносит строку, а не отправляет', async () => {
			const user = userEvent.setup()
			const { emitted } = render(ChatInput)

			const field = screen.getByRole('textbox', { name: 'Сообщение' })
			expect(field.tagName).toBe('TEXTAREA')
			await user.type(field, 'Первая{Shift>}{Enter}{/Shift}Вторая')

			expect(field).toHaveValue('Первая\nВторая')
			expect(emitted().send).toBeUndefined()
		})

		it('не должен отправлять сообщение по Enter во время IME-композиции', async () => {
			const user = userEvent.setup()
			const { emitted } = render(ChatInput)

			await user.type(getInput(), 'にほん')
			await fireEvent.keyDown(getInput(), { key: 'Enter', isComposing: true })
			expect(emitted().send).toBeUndefined()

			await fireEvent.keyDown(getInput(), { key: 'Enter' })
			expect((emitted().send as Array<[{ text: string }]>)[0][0].text).toBe('にほん')
		})

		it('кнопка «Отправить» отключена (disabled), пока нет текста и вложений', async () => {
			const user = userEvent.setup()
			render(ChatInput)

			const send = screen.getByRole('button', { name: 'Отправить сообщение' })
			expect(send).toBeDisabled()
			await user.type(getInput(), 'Текст')
			expect(send).toBeEnabled()
		})
	})

	describe('эмодзи', () => {
		it('должен открывать BaseEmojiPicker и вставлять выбранный эмодзи в поле', async () => {
			render(ChatInput)

			await fireEvent.click(screen.getByLabelText('Открыть выбор эмодзи'))
			expect(document.querySelector('.base-chat-input__emoji-popover .base-emoji-picker')).toBeInTheDocument()
			await fireEvent.click(await screen.findByLabelText('широко улыбается'))

			expect(getInput().value).toBe('😀')
			expect(document.querySelector('.base-chat-input__emoji-popover')).toBeNull()
		})

		it('должен вставлять эмодзи в позицию курсора, заменяя выделение, и возвращать фокус в поле', async () => {
			render(ChatInput)
			const input = getInput()
			await fireEvent.update(input, 'Привет мир')
			input.setSelectionRange(7, 10)

			await fireEvent.click(screen.getByLabelText('Открыть выбор эмодзи'))
			await fireEvent.click(await screen.findByLabelText('широко улыбается'))

			expect(input.value).toBe('Привет 😀')
			await vi.waitFor(() => expect(input).toHaveFocus())
			expect(input.selectionStart).toBe('Привет 😀'.length)
		})

		it('должен ставить фокус в поиск эмодзи при открытии и закрывать по Escape с возвратом фокуса', async () => {
			const user = userEvent.setup()
			render(ChatInput)
			const trigger = screen.getByLabelText('Открыть выбор эмодзи')

			await user.click(trigger)
			await vi.waitFor(() => expect(screen.getByLabelText('Поиск эмодзи')).toHaveFocus())
			await user.keyboard('{Escape}')

			expect(document.querySelector('.base-chat-input__emoji-popover')).toBeNull()
			expect(trigger).toHaveFocus()
		})

		it('должен выбирать эмодзи с клавиатуры и показывать его в недавних', async () => {
			const user = userEvent.setup()
			render(ChatInput)
			const trigger = screen.getByLabelText('Открыть выбор эмодзи')

			await user.click(trigger)
			await screen.findByLabelText('широко улыбается')
			await vi.waitFor(() => expect(screen.getByLabelText('Поиск эмодзи')).toHaveFocus())
			await user.keyboard('{Enter}')
			expect(getInput().value).toBe('😀')

			await user.click(trigger)
			expect(await screen.findByRole('group', { name: 'Недавние' })).toBeInTheDocument()
		})

		it('Escape при закрытом поповере не перехватывается', async () => {
			render(ChatInput)
			const trigger = screen.getByLabelText('Открыть выбор эмодзи')
			const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })

			trigger.dispatchEvent(event)

			expect(event.defaultPrevented).toBe(false)
		})

		it('должен закрывать поповер эмодзи по клику снаружи', async () => {
			render(ChatInput)

			await fireEvent.click(screen.getByLabelText('Открыть выбор эмодзи'))
			expect(document.querySelector('.base-chat-input__emoji-popover')).toBeInTheDocument()

			await fireEvent.mouseDown(document.body)

			expect(document.querySelector('.base-chat-input__emoji-popover')).toBeNull()
		})

		it('должен переключать поповер эмодзи повторным кликом', async () => {
			render(ChatInput)

			const btn = screen.getByLabelText('Открыть выбор эмодзи')
			await fireEvent.click(btn)
			expect(document.querySelector('.base-chat-input__emoji-popover')).toBeInTheDocument()

			await fireEvent.click(btn)
			expect(document.querySelector('.base-chat-input__emoji-popover')).toBeNull()
		})

		it('не должен закрывать поповер при клике внутри обёртки эмодзи', async () => {
			render(ChatInput)

			await fireEvent.click(screen.getByLabelText('Открыть выбор эмодзи'))
			const popover = document.querySelector('.base-chat-input__emoji-popover') as HTMLElement
			expect(popover).toBeInTheDocument()

			await fireEvent.mouseDown(popover)

			expect(document.querySelector('.base-chat-input__emoji-popover')).toBeInTheDocument()
		})
	})

	describe('кнопка прикрепления файла', () => {
		it('должен вызывать click по скрытому input при нажатии кнопки прикрепления', async () => {
			const { container } = render(ChatInput)

			const fileInput = container.querySelector('.base-chat-input__file-input') as HTMLInputElement
			const clickSpy = vi.spyOn(fileInput, 'click').mockImplementation(() => {})

			await fireEvent.click(screen.getByLabelText('Прикрепить файл'))

			expect(clickSpy).toHaveBeenCalled()
		})
	})

	describe('ответ на сообщение', () => {
		const REPLY: ChatMessage = { id: '1', text: 'Исходное', sender: 'other', time: '10:00', senderName: 'Анна' }

		it('должен показывать панель ответа и эмитить cancel-reply', async () => {
			const { emitted } = render(ChatInput, { props: { replyingTo: REPLY } })

			expect(screen.getByText('Анна')).toBeInTheDocument()
			await fireEvent.click(screen.getByLabelText('Отменить ответ на сообщение'))

			expect(emitted()['cancel-reply']).toBeTruthy()
		})

		it('должен показывать "Сообщение" когда у цитируемого сообщения нет имени отправителя', () => {
			const replyNoName: ChatMessage = { id: '2', text: 'Без имени', sender: 'me', time: '10:05' }
			render(ChatInput, { props: { replyingTo: replyNoName } })

			expect(screen.getByText('Сообщение')).toBeInTheDocument()
		})
	})

	describe('быстрые ответы', () => {
		it('должен эмитить quick-reply с текстом выбранного варианта', async () => {
			const { emitted } = render(ChatInput, { props: { quickReplies: ['Спасибо'] } })

			await fireEvent.click(screen.getByLabelText('Быстрый ответ: Спасибо'))

			const events = emitted()['quick-reply'] as Array<[string]>
			expect(events[0][0]).toBe('Спасибо')
		})
	})

	describe('режим правки', () => {
		const EDITING: ChatMessage = { id: '7', text: 'Старый текст', sender: 'me', time: '10:00' }

		async function renderEditing() {
			const view = render(ChatInput, { props: {} })
			await view.rerender({ editingMessage: EDITING })
			await waitFor(() => expect(getInput().value).toBe('Старый текст'))
			return view
		}

		it('показывает панель «Изменение сообщения» с текстом и заполняет поле', async () => {
			await renderEditing()

			expect(screen.getByText(UI_CHAT_TEXT.EDITING)).toBeInTheDocument()
			expect(screen.getAllByText('Старый текст').length).toBeGreaterThan(0)
		})

		it('без правки панели нет, а кнопка отправки называется «Отправить»', () => {
			render(ChatInput, { props: {} })

			expect(screen.queryByText(UI_CHAT_TEXT.EDITING)).not.toBeInTheDocument()
			expect(screen.queryByRole('button', { name: UI_CHAT_TEXT.CANCEL_EDIT_ARIA })).not.toBeInTheDocument()
			expect(screen.queryByRole('button', { name: UI_CHAT_TEXT.SAVE_EDIT_ARIA })).not.toBeInTheDocument()
			expect(screen.getByRole('button', { name: UI_CHAT_TEXT.SEND_ARIA })).toBeInTheDocument()
		})

		it('кнопка отправки в режиме правки называется «Сохранить изменение сообщения»', async () => {
			render(ChatInput, { props: { editingMessage: EDITING } })

			expect(await screen.findByRole('button', { name: UI_CHAT_TEXT.SAVE_EDIT_ARIA })).toBeInTheDocument()
			expect(screen.queryByRole('button', { name: UI_CHAT_TEXT.SEND_ARIA })).not.toBeInTheDocument()
		})

		it('кнопка «Отменить изменение сообщения» эмитит cancel-edit', async () => {
			const { emitted } = render(ChatInput, { props: { editingMessage: EDITING } })

			await fireEvent.click(screen.getByRole('button', { name: UI_CHAT_TEXT.CANCEL_EDIT_ARIA }))

			expect(emitted()['cancel-edit']).toHaveLength(1)
		})

		it('Enter с изменённым текстом эмитит edit, а не send', async () => {
			const user = userEvent.setup()
			const { emitted } = await renderEditing()

			await user.type(getInput(), ' и новый{Enter}')

			expect(emitted().edit).toEqual([[{ text: 'Старый текст и новый' }]])
			expect(emitted().send).toBeUndefined()
		})

		it('кнопка сохранения эмитит edit', async () => {
			const user = userEvent.setup()
			const { emitted } = await renderEditing()
			await user.type(getInput(), '!')

			await user.click(screen.getByRole('button', { name: UI_CHAT_TEXT.SAVE_EDIT_ARIA }))

			expect(emitted().edit).toEqual([[{ text: 'Старый текст!' }]])
		})

		it('Enter без изменений текста эмитит cancel-edit', async () => {
			const user = userEvent.setup()
			const { emitted } = await renderEditing()

			await user.type(getInput(), '{Enter}')

			expect(emitted()['cancel-edit']).toHaveLength(1)
			expect(emitted().edit).toBeUndefined()
		})

		it('Escape эмитит cancel-edit', async () => {
			const user = userEvent.setup()
			const { emitted } = await renderEditing()

			await user.type(getInput(), '{Escape}')

			expect(emitted()['cancel-edit']).toHaveLength(1)
		})

		it('по окончании правки возвращается набранный до неё черновик', async () => {
			const user = userEvent.setup()
			const { rerender } = render(ChatInput, { props: {} })
			await user.type(getInput(), 'Черновик')

			await rerender({ editingMessage: EDITING })
			await waitFor(() => expect(getInput().value).toBe('Старый текст'))
			await rerender({ editingMessage: null })

			await waitFor(() => expect(getInput().value).toBe('Черновик'))
		})
	})

	describe('ограничения вложений', () => {
		function pickFiles(container: Element, files: File[]): Promise<unknown> {
			const fileInput = container.querySelector('.base-chat-input__file-input') as HTMLInputElement
			Object.defineProperty(fileInput, 'files', { value: files, configurable: true })
			return fireEvent.change(fileInput)
		}

		beforeEach(() => {
			vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
			vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
		})

		afterEach(() => {
			vi.restoreAllMocks()
		})

		it('accept попадает в поле выбора файла', () => {
			const { container } = render(ChatInput, { props: { accept: 'image/*' } })

			expect(container.querySelector('.base-chat-input__file-input')).toHaveAttribute('accept', 'image/*')
		})

		it('без accept атрибута нет', () => {
			const { container } = render(ChatInput, { props: {} })

			expect(container.querySelector('.base-chat-input__file-input')).not.toHaveAttribute('accept')
		})

		it('отказ показывает оповещение со списком, эмитит attach-error и не эмитит attach', async () => {
			const { container, emitted } = render(ChatInput, { props: { accept: 'image/*' } })

			await pickFiles(container, [new File(['x'], 'doc.pdf', { type: 'application/pdf' })])

			const alert = await screen.findByRole('alert')
			expect(alert).toHaveTextContent('doc.pdf')
			expect(within(alert).getAllByRole('listitem')).toHaveLength(1)
			expect(emitted()['attach-error']).toHaveLength(1)
			expect(emitted().attach).toBeUndefined()
		})

		it('кнопка закрытия убирает оповещение', async () => {
			const user = userEvent.setup()
			const { container } = render(ChatInput, { props: { accept: 'image/*' } })
			await pickFiles(container, [new File(['x'], 'doc.pdf', { type: 'application/pdf' })])

			await user.click(await screen.findByRole('button', { name: UI_CHAT_TEXT.ATTACH_ERROR_CLOSE }))

			expect(screen.queryByRole('alert')).toBeNull()
		})

		it('без отказов оповещения нет', async () => {
			const { container, emitted } = render(ChatInput, { props: { accept: 'text/*' } })

			await pickFiles(container, [new File(['x'], 'a.txt', { type: 'text/plain' })])

			expect(screen.queryByRole('alert')).toBeNull()
			expect(emitted().attach).toHaveLength(1)
		})
	})

	describe('нажатие на пункт подсказки', () => {
		it('mousedown на упоминании не уводит фокус из поля', async () => {
			const user = userEvent.setup()
			render(ChatInput, { props: { isGroup: true, members: MEMBERS } })
			await user.type(getInput(), '@')
			const item = (await screen.findAllByText('Анна'))[0].closest('.base-chat-input__autocomplete-item')!

			const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
			item.dispatchEvent(event)

			expect(event.defaultPrevented).toBe(true)
		})

		it('mousedown на команде не уводит фокус из поля', async () => {
			const user = userEvent.setup()
			render(ChatInput, { props: { commands: COMMANDS } })
			await user.type(getInput(), '/')
			const item = (await screen.findByText('/help')).closest('.base-chat-input__autocomplete-item')!

			const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
			item.dispatchEvent(event)

			expect(event.defaultPrevented).toBe(true)
		})
	})
})
