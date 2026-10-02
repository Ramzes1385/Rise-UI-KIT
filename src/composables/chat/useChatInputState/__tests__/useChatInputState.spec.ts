import { nextTick } from 'vue'
import { useChatInputState } from '../useChatInputState'
import type { UseChatInputStateOptions } from '../types/useChatInputState.types'
import type { ChatCommand, ChatMember } from '@components/BaseChat/types/BaseChat.types'

const members: ChatMember[] = [
	{ id: 'u1', name: 'Анна', role: 'Модератор' },
	{ id: 'u2', name: 'Борис' },
	{ id: 'u3', name: 'Алексей', role: 'Админ' },
]

const commands: ChatCommand[] = [
	{ name: 'help', description: 'Помощь' },
	{ name: 'hide', description: 'Скрыть' },
	{ name: 'mute', description: 'Без звука' },
]

function setup(props: UseChatInputStateOptions['props'] = { members, commands }, isWithInput = true) {
	const emit = vi.fn()
	const state = useChatInputState({ props, emit: emit as unknown as UseChatInputStateOptions['emit'] })
	const input = document.createElement('textarea')
	document.body.append(input)
	if (isWithInput) state.inputComponentRef.value = { inputRef: input }
	return { state, emit, input }
}

async function type(context: ReturnType<typeof setup>, value: string, cursor = value.length): Promise<void> {
	context.input.value = value
	context.input.setSelectionRange(cursor, cursor)
	context.state.text.value = value
	await nextTick()
	await nextTick()
}

function key(name: string, init: KeyboardEventInit = {}): KeyboardEvent {
	return new KeyboardEvent('keydown', { key: name, cancelable: true, ...init })
}

function selectFiles(input: HTMLInputElement, files: File[]): void {
	Object.defineProperty(input, 'files', { value: files, configurable: true })
}

afterEach(() => {
	document.body.innerHTML = ''
	vi.restoreAllMocks()
})

describe('useChatInputState', () => {
	describe('подсказки', () => {
		it('без участников и команд списки пусты', () => {
			const { state } = setup({})

			expect(state.hasCommands.value).toBe(false)
			expect(state.filteredMembers.value).toEqual([])
			expect(state.filteredCommands.value).toEqual([])
		})

		it('@ показывает участников, отфильтрованных по имени и роли', async () => {
			const context = setup()

			await type(context, 'Привет @а')
			expect(context.state.showMentions.value).toBe(true)
			expect(context.state.showCommands.value).toBe(false)
			expect(context.state.filteredMembers.value.map(member => member.id)).toEqual(['u1', 'u3'])

			await type(context, 'Привет @админ')
			expect(context.state.filteredMembers.value.map(member => member.id)).toEqual(['u3'])
		})

		it('/ показывает команды по началу имени, обычное слово прячет подсказки', async () => {
			const context = setup()

			await type(context, '/h')
			expect(context.state.hasCommands.value).toBe(true)
			expect(context.state.showCommands.value).toBe(true)
			expect(context.state.filteredCommands.value.map(command => command.name)).toEqual(['help', 'hide'])

			await type(context, '/he')
			expect(context.state.filteredCommands.value.map(command => command.name)).toEqual(['help'])

			await type(context, '/help ок')
			expect(context.state.showCommands.value).toBe(false)
			expect(context.state.showMentions.value).toBe(false)
		})

		it('учитывает слово под курсором, а не в конце текста', async () => {
			const context = setup()

			await type(context, '@ан текст', 3)

			expect(context.state.showMentions.value).toBe(true)
		})

		it('стрелки двигают выделение по кругу, Escape закрывает список', async () => {
			const context = setup()
			await type(context, '@')

			const down = key('ArrowDown')
			context.state.handleKeyDown(down)
			expect(down.defaultPrevented).toBe(true)
			expect(context.state.activeSuggestionIndex.value).toBe(1)

			context.state.handleKeyDown(key('ArrowDown'))
			context.state.handleKeyDown(key('ArrowDown'))
			expect(context.state.activeSuggestionIndex.value).toBe(0)

			context.state.handleKeyDown(key('ArrowUp'))
			expect(context.state.activeSuggestionIndex.value).toBe(2)

			context.state.handleKeyDown(key('Escape'))
			expect(context.state.showMentions.value).toBe(false)
		})

		it('новый список подсказок начинает выделение с первого пункта', async () => {
			const context = setup()
			await type(context, '@')
			context.state.handleKeyDown(key('ArrowDown'))

			await type(context, '/')

			expect(context.state.activeSuggestionIndex.value).toBe(0)
		})

		it('Enter вставляет выбранного участника и отправляет сообщение', async () => {
			const context = setup()
			await type(context, 'Привет @бо')
			const focus = vi.spyOn(context.input, 'focus')

			context.state.handleKeyDown(key('Enter'))
			await nextTick()

			expect(context.emit).toHaveBeenCalledWith('send', { text: 'Привет @Борис', attachments: undefined })
			expect(context.state.text.value).toBe('')
			expect(focus).toHaveBeenCalled()
		})

		it('Enter в списке команд вставляет команду', async () => {
			const context = setup()
			await type(context, '/mu')

			context.state.handleKeyDown(key('Enter'))

			expect(context.emit).toHaveBeenCalledWith('send', { text: '/mute', attachments: undefined })
		})

		it('Escape закрывает список команд', async () => {
			const context = setup()
			await type(context, '/')

			context.state.handleKeyDown(key('Escape'))

			expect(context.state.showCommands.value).toBe(false)
		})

		it('Enter без пункта под выделением ничего не отправляет', async () => {
			const context = setup()
			await type(context, '@')
			context.state.handleKeyDown(key('ArrowDown'))
			context.state.handleKeyDown(key('ArrowDown'))

			await type(context, '@бор')
			context.state.handleKeyDown(key('Enter'))

			expect(context.emit).not.toHaveBeenCalled()
		})

		it('другие клавиши при открытом списке не перехватываются', async () => {
			const context = setup()
			await type(context, '@')
			const event = key('a')

			context.state.handleKeyDown(event)

			expect(event.defaultPrevented).toBe(false)
			expect(context.state.showMentions.value).toBe(true)
		})

		it('пустой список подсказок не мешает отправке по Enter', async () => {
			const context = setup()
			await type(context, 'Привет @никто')

			context.state.handleKeyDown(key('Enter'))

			expect(context.emit).toHaveBeenCalledWith('send', { text: 'Привет @никто', attachments: undefined })
		})

		it('без поля ввода выбор подсказки ничего не отправляет', () => {
			const { state, emit } = setup({ members, commands }, false)
			state.text.value = '@'
			state.showMentions.value = true

			state.handleKeyDown(key('Enter'))

			expect(emit).not.toHaveBeenCalled()
		})
	})

	describe('replaceCurrentWord', () => {
		it('заменяет слово под курсором и ставит курсор после вставки', async () => {
			const context = setup()
			await type(context, 'Привет @ан, как дела', 10)
			const select = vi.spyOn(context.input, 'setSelectionRange')

			const result = context.state.replaceCurrentWord('@', 'Анна')
			await nextTick()

			expect(result).toBe('Привет @Анна , как дела')
			expect(context.state.showMentions.value).toBe(false)
			expect(select).toHaveBeenCalledWith(13, 13)
		})
	})

	describe('кнопка команд', () => {
		it('в пустом поле вставляет «/» и открывает команды', async () => {
			const context = setup()
			const select = vi.spyOn(context.input, 'setSelectionRange')

			context.state.toggleCommands()
			await nextTick()

			expect(context.state.text.value).toBe('/')
			expect(context.state.showCommands.value).toBe(true)
			expect(select).toHaveBeenCalledWith(1, 1)
		})

		it('после слова добавляет пробел, после пробела — нет', async () => {
			const context = setup()
			await type(context, 'Привет')
			context.state.toggleCommands()
			expect(context.state.text.value).toBe('Привет /')

			context.state.toggleCommands()
			expect(context.state.showCommands.value).toBe(false)

			await type(context, 'Привет ')
			context.state.toggleCommands()
			expect(context.state.text.value).toBe('Привет /')
		})

		it('без поля ввода вставляет в конец текста', async () => {
			const { state } = setup({ commands }, false)
			state.text.value = 'ок'

			state.toggleCommands()
			await nextTick()

			expect(state.text.value).toBe('ок /')
		})
	})

	describe('клавиатура', () => {
		it('Enter отправляет, Shift+Enter — нет', async () => {
			const context = setup()
			await type(context, '  Привет  ')

			const shift = key('Enter', { shiftKey: true })
			context.state.handleKeyDown(shift)
			expect(context.emit).not.toHaveBeenCalled()

			const enter = key('Enter')
			context.state.handleKeyDown(enter)
			expect(enter.defaultPrevented).toBe(true)
			expect(context.emit).toHaveBeenCalledWith('send', { text: 'Привет', attachments: undefined })
		})

		it('Enter во время IME-композиции не отправляет', async () => {
			const context = setup()
			await type(context, 'こんにちは')

			context.state.handleKeyDown(key('Enter', { isComposing: true }))
			context.state.handleKeyDown(key('Enter', { keyCode: 229 }))

			expect(context.emit).not.toHaveBeenCalled()
		})

		it('пустое сообщение без вложений не отправляется', () => {
			const { state, emit } = setup()
			state.text.value = '   '

			state.handleSend()

			expect(emit).not.toHaveBeenCalled()
		})
	})

	describe('вложения', () => {
		it('кнопка вложения открывает выбор файла', () => {
			const { state } = setup()
			const fileInput = document.createElement('input')
			const click = vi.spyOn(fileInput, 'click')
			state.fileInputRef.value = fileInput

			state.triggerFileSelect()

			expect(click).toHaveBeenCalledOnce()
		})

		it('без поля файла кнопка вложения ничего не ломает', () => {
			const { state } = setup()

			expect(() => state.triggerFileSelect()).not.toThrow()
		})

		it('выбранные файлы становятся вложениями и уходят с сообщением', () => {
			vi.spyOn(URL, 'createObjectURL').mockImplementation(file => `blob:${(file as File).name}`)
			const { state, emit } = setup()
			const fileInput = document.createElement('input')
			fileInput.type = 'file'
			const files = [new File(['x'], 'photo.png', { type: 'image/png' }), new File(['abc'], 'doc.pdf', { type: 'application/pdf' })]
			selectFiles(fileInput, files)

			state.handleFileChange({ target: fileInput } as unknown as Event)

			expect(emit).toHaveBeenCalledWith('attach', files)
			expect(state.attachments.value.map(item => [item.name, item.type, item.url])).toEqual([
				['photo.png', 'image', 'blob:photo.png'],
				['doc.pdf', 'file', 'blob:doc.pdf'],
			])

			state.handleSend()

			expect(emit).toHaveBeenLastCalledWith('send', {
				text: '',
				attachments: expect.arrayContaining([expect.objectContaining({ name: 'doc.pdf' })]),
			})
			expect(state.attachments.value).toEqual([])
		})

		it('ошибка blob-ссылки на N-м файле не теряет добавленные раньше', () => {
			vi.spyOn(URL, 'createObjectURL').mockImplementation(file => {
				if ((file as File).name === 'broken.pdf') throw new Error('quota')
				return `blob:${(file as File).name}`
			})
			const { state } = setup()
			const fileInput = document.createElement('input')
			fileInput.type = 'file'
			const files = [
				new File(['x'], 'photo.png', { type: 'image/png' }),
				new File(['abc'], 'broken.pdf', { type: 'application/pdf' }),
			]
			selectFiles(fileInput, files)

			expect(() => state.handleFileChange({ target: fileInput } as unknown as Event)).toThrow('quota')

			expect(state.attachments.value.map(item => item.name)).toEqual(['photo.png'])
		})

		it('событие не от поля ввода игнорируется', () => {
			const { state, emit } = setup()

			state.handleFileChange({ target: document.createElement('div') } as unknown as Event)

			expect(emit).not.toHaveBeenCalled()
		})

		it('удаление вложения освобождает blob-ссылку', () => {
			const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
			const { state } = setup()
			state.attachments.value = [
				{ id: 'a', name: 'a.png', type: 'image', url: 'blob:a' },
				{ id: 'b', name: 'b.png', type: 'image', url: 'https://example.com/b.png' },
			]

			state.removeAttachment(1)
			expect(revoke).not.toHaveBeenCalled()

			state.removeAttachment(0)
			expect(revoke).toHaveBeenCalledWith('blob:a')
			expect(state.attachments.value).toEqual([])
		})
	})

	describe('эмодзи', () => {
		it('заменяет выделенный текст и ставит курсор после эмодзи', async () => {
			const context = setup()
			await type(context, 'Привет мир')
			context.input.setSelectionRange(7, 10)
			const select = vi.spyOn(context.input, 'setSelectionRange')

			context.state.insertEmoji('🙂')
			await nextTick()

			expect(context.state.text.value).toBe('Привет 🙂')
			expect(select).toHaveBeenCalledWith(9, 9)
		})

		it('без поля ввода добавляет эмодзи в конец', async () => {
			const { state } = setup({}, false)
			state.text.value = 'Ок'

			state.insertEmoji('👍')
			await nextTick()

			expect(state.text.value).toBe('Ок👍')
		})
	})
})
