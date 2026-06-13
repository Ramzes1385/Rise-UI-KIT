/**
 * Unit/Integration-тесты для ChatInput.
 * Покрывают автодополнение упоминаний (@) и команд (/), вложения файлов,
 * отправку, эмодзи-поповер и быстрые ответы.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen } from '@testing-library/vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { ChatCommand, ChatMember, ChatMessage } from '../BaseChat.types'
import ChatInput from './ChatInput.vue'

const MEMBERS: ChatMember[] = [
	{ id: 'a1', name: 'Анна', role: 'admin' },
	{ id: 'm1', name: 'Борис', role: 'member' },
]

const COMMANDS: ChatCommand[] = [
	{ name: 'help', description: 'Показать справку по командам' },
	{ name: 'clear', description: 'Очистить историю сообщений' },
	{ name: 'mute', description: 'Включить/выключить уведомления' },
]

function getInput(): HTMLInputElement {
	return screen.getByPlaceholderText('Напишите сообщение...') as HTMLInputElement
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

			// admin совпадает только с ролью Анны (ветка member.role.toLowerCase().includes)
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

			// Симулируем последующее взаимодействие с полем — список должен остаться открытым
			await fireEvent.keyUp(getInput())
			await fireEvent.click(getInput())

			expect(container.querySelector('.base-chat-input__autocomplete--commands')).toBeInTheDocument()
		})
	})

	describe('навигация по автодополнению с клавиатуры', () => {
		it('должен выбирать упоминание по Enter с переключением по стрелкам', async () => {
			const user = userEvent.setup()
			const { emitted } = render(ChatInput, { props: { isGroup: true, members: MEMBERS } })

			const input = getInput()
			await user.click(input)
			await user.type(input, '@')
			await screen.findByText('Анна')

			await fireEvent.keyDown(input, { key: 'ArrowDown' })
			await fireEvent.keyDown(input, { key: 'ArrowUp' })
			// Enter одновременно выбирает упоминание (handleKeyDown) и отправляет (keydown.enter)
			await fireEvent.keyDown(input, { key: 'Enter' })

			const sendEvents = emitted().send as Array<[{ text: string }]>
			expect(sendEvents[0][0].text).toBe('@Анна')
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

		it('должен выбирать команду по Enter с переключением по стрелкам', async () => {
			const user = userEvent.setup()
			const { emitted } = render(ChatInput, { props: { isGroup: true, members: MEMBERS, commands: COMMANDS } })

			const input = getInput()
			await user.click(input)
			await user.type(input, '/')
			await screen.findByText('/help')

			await fireEvent.keyDown(input, { key: 'ArrowDown' })
			await fireEvent.keyDown(input, { key: 'ArrowUp' })
			await fireEvent.keyDown(input, { key: 'Enter' })

			const sendEvents = emitted().send as Array<[{ text: string }]>
			expect(sendEvents[0][0].text).toBe('/help')
		})

		it('должен закрывать список команд по Escape', async () => {
			const user = userEvent.setup()
			const { container } = render(ChatInput, { props: { isGroup: true, members: MEMBERS, commands: COMMANDS } })

			const input = getInput()
			await user.click(input)
			await user.type(input, '/')
			await screen.findByText('/help')

			// Нейтральная клавиша — ветка Escape оценивается как ложная, список остаётся
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
		})

		it('не должен эмитить send при пустом поле и без вложений', async () => {
			const { emitted } = render(ChatInput)

			await fireEvent.keyDown(getInput(), { key: 'Enter' })

			expect(emitted().send).toBeUndefined()
		})
	})

	describe('эмодзи', () => {
		it('должен открывать поповер эмодзи и вставлять выбранный эмодзи в поле', async () => {
			render(ChatInput)

			await fireEvent.click(screen.getByLabelText('Открыть выбор эмодзи'))
			await fireEvent.click(screen.getByLabelText('Вставить эмодзи 😀'))

			expect(getInput().value).toBe('😀')
		})

		it('должен закрывать поповер эмодзи по клику снаружи', async () => {
			const { container } = render(ChatInput)

			await fireEvent.click(screen.getByLabelText('Открыть выбор эмодзи'))
			expect(container.querySelector('.base-chat-input__emoji-popover')).toBeInTheDocument()

			await fireEvent.mouseDown(document.body)

			expect(container.querySelector('.base-chat-input__emoji-popover')).toBeNull()
		})

		it('должен переключать поповер эмодзи повторным кликом', async () => {
			const { container } = render(ChatInput)

			const btn = screen.getByLabelText('Открыть выбор эмодзи')
			await fireEvent.click(btn)
			expect(container.querySelector('.base-chat-input__emoji-popover')).toBeInTheDocument()

			await fireEvent.click(btn)
			expect(container.querySelector('.base-chat-input__emoji-popover')).toBeNull()
		})

		it('не должен закрывать поповер при клике внутри обёртки эмодзи', async () => {
			const { container } = render(ChatInput)

			await fireEvent.click(screen.getByLabelText('Открыть выбор эмодзи'))
			const popover = container.querySelector('.base-chat-input__emoji-popover') as HTMLElement
			expect(popover).toBeInTheDocument()

			// mousedown по элементу внутри wrapper не считается внешним кликом
			await fireEvent.mouseDown(popover)

			expect(container.querySelector('.base-chat-input__emoji-popover')).toBeInTheDocument()
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
})
