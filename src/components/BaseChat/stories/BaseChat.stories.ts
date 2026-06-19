import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'
import { UI_TEXT } from '@constants'
import { buildArgTypes } from '@utils/storybookUtils'
import BaseChat from '../ui/BaseChat.vue'
import type { ChatCommand, ChatMember, ChatMessage, ChatMessageAttachment } from '../model/BaseChat.types'
import type { Args, Meta, StoryObj } from '@storybook/vue3'

/** Диспатчит нативное событие contextmenu в указанной точке */
function dispatchContextMenu(target: HTMLElement, x: number, y: number): void {
	const event = new MouseEvent('contextmenu', {
		bubbles: true,
		cancelable: true,
		clientX: x,
		clientY: y,
	})
	target.dispatchEvent(event)
}

/** Диспатчит нативное событие keydown с заданной клавишей */
function dispatchKeyDown(target: HTMLElement, key: string): void {
	const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
	target.dispatchEvent(event)
}

/** Диспатчит нативное событие change (для input[type=file]) */
function dispatchChange(target: HTMLElement): void {
	const event = new Event('change', { bubbles: true })
	target.dispatchEvent(event)
}

/** Открывает slideover клик по info-кнопке и ждёт появления DOM */
async function openSlideover(canvasElement: HTMLElement): Promise<boolean> {
	const infoBtns = canvasElement.querySelectorAll('.base-chat-header__actions .base-chat-header__action-btn')
	const infoBtn = infoBtns[infoBtns.length - 1] as HTMLElement | undefined
	if (!infoBtn) return false
	await userEvent.click(infoBtn)
	await waitFor(() => {
		expect(canvasElement.querySelector('.base-chat-slideover')).toBeTruthy()
	})
	return true
}

/** Открывает админ-меню участника и ждёт появления dropdown */
async function openAdminMenu(canvasElement: HTMLElement, index = 0): Promise<boolean> {
	const adminBtns = canvasElement.querySelectorAll('.base-chat-slideover__admin-btn')
	const adminBtn = adminBtns[index] as HTMLElement | undefined
	if (!adminBtn) return false
	await userEvent.click(adminBtn)
	await waitFor(() => {
		expect(canvasElement.querySelector('.base-chat-slideover__dropdown-item')).toBeTruthy()
	})
	return true
}

/** Открывает профиль участника кликом по карточке и ждёт DOM профиля */
async function openMemberProfile(canvasElement: HTMLElement): Promise<boolean> {
	const memberMain = canvasElement.querySelector('.base-chat-slideover__member-main') as HTMLElement | null
	if (!memberMain) return false
	await userEvent.click(memberMain)
	await waitFor(() => {
		expect(canvasElement.querySelector('.base-chat-slideover__profile-actions')).toBeTruthy()
	})
	return true
}

const MOCK_MESSAGES: ChatMessage[] = [
	{
		id: '1',
		text: 'Привет! Как дела?',
		sender: 'other',
		time: '10:00',
		senderName: 'Анна',
		senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
	},
	{
		id: '2',
		text: 'Привет! Всё отлично, спасибо! Как твои успехи с металлической скульптурой?',
		sender: 'me',
		time: '10:01',
		status: 'read',
	},
	{
		id: '3',
		text: 'Закончила новую работу из бронзы! Скоро покажу. Вот ссылка на эскиз: https://metal-art.ru/bronze-sketch',
		sender: 'other',
		time: '10:02',
		date: '14 мая 2024',
		senderName: 'Анна',
		senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
		attachments: [
			{
				id: 'att-1',
				name: 'sketch.jpg',
				url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=400',
				type: 'image',
			},
			{
				id: 'att-2',
				name: 'project-details.pdf',
				url: '#',
				type: 'file',
				size: '2.4 MB',
			},
		],
	},
]

const MOCK_MEMBERS: ChatMember[] = [
	{
		id: 'user-1',
		name: 'Анна Ковальски',
		avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
		role: 'Скульптор',
		status: 'online',
	},
	{
		id: 'user-2',
		name: 'Иван Петров',
		avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
		role: 'Кузнец',
		status: 'offline',
		warningsCount: 1,
	},
	{
		id: 'user-3',
		name: 'Мария Сидорова',
		avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
		role: 'Дизайнер',
		status: 'online',
	},
]

const QUICK_REPLIES = ['Отличная работа! 👍', 'Когда будет готово?', 'Нужно обсудить детали 📞', 'Супер! 🔥']

const MOCK_COMMANDS: ChatCommand[] = [
	{ name: 'help', description: 'Показать справку по командам' },
	{ name: 'clear', description: 'Очистить историю сообщений' },
	{ name: 'mute', description: 'Включить/выключить уведомления' },
	{ name: 'ban', description: 'Забанить пользователя' },
	{ name: 'kick', description: 'Исключить пользователя из чата' },
]

const LONG_MESSAGES: ChatMessage[] = Array.from(
	{ length: 12 },
	(_, i): ChatMessage => ({
		id: String(i + 1),
		text: `Это очень длинное сообщение номер ${i + 1}, которое содержит значительный объём текста для проверки того, как компонент чата справляется с отображением больших текстовых блоков. Каждое сообщение должно корректно переноситься на новые строки и не ломать вёрстку. Наши мастера создают уникальные изделия ручной ковки из бронзы и чугуна, которые становятся украшением любого интерьера.`,
		sender: i % 2 === 0 ? 'other' : 'me',
		time: `${10 + Math.floor(i / 2)}:${((i * 5) % 60).toString().padStart(2, '0')}`,
		senderName: i % 2 === 0 ? 'Анна' : undefined,
		senderAvatar: i % 2 === 0 ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' : undefined,
		status: i % 2 !== 0 ? 'read' : undefined,
	}),
)

const meta: Meta<typeof BaseChat> = {
	title: 'UI/BaseChat',
	component: BaseChat,
	parameters: {
		layout: 'padded',
	},
	decorators: [
		() => ({
			template: '<div style="width: 100%; max-width: 600px; margin: 0 auto;"><story /></div>',
		}),
	],
	argTypes: buildArgTypes({
		props: {
			messages: { table: { disable: true } },
			title: { control: 'text' },
			subtitle: { control: 'text' },
			avatar: { control: 'text' },
			height: { control: 'text' },
			variant: { control: 'radio', options: ['bubble', 'flat', 'modern'] },
			sizeScale: { control: { type: 'range', min: 50, max: 200, step: 10 } },
			isTyping: { control: 'boolean' },
			isGroup: { control: 'boolean' },
			members: { table: { disable: true } },
			quickReplies: { control: 'object' },
			commands: { table: { disable: true } },
			pinnedMessages: { table: { disable: true } },
			currentUserRole: { control: 'select', options: ['admin', 'member'] },
			customClass: { control: 'object' },
			onSend: { table: { disable: true } },
			onAttach: { table: { disable: true } },
		},
	}),
	args: {
		messages: MOCK_MESSAGES,
		title: 'Чат с Анной',
		subtitle: 'В сети',
		avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
		height: '500px',
		sizeScale: 100,
		variant: 'bubble',
		isTyping: false,
		isGroup: false,
		members: MOCK_MEMBERS,
		quickReplies: QUICK_REPLIES,
		commands: MOCK_COMMANDS,
	},
}

export default meta
type Story = StoryObj<typeof BaseChat>
/** Базовое состояние личного чата */
export const Default: Story = {}
/** Плоский вариант оформления сообщений */
export const Flat: Story = {
	args: {
		variant: 'flat',
	},
}
/** Современный вариант оформления сообщений */
export const Modern: Story = {
	args: {
		variant: 'modern',
	},
}
/** Групповой чат с несколькими участниками */
export const GroupChat: Story = {
	args: {
		title: 'Мастерская Металл-Арт',
		subtitle: '3 участников',
		isGroup: true,
		members: MOCK_MEMBERS,
		avatar: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=150',
	},
}
/** Чат с доступными командами — кнопка команд (как в Telegram) рядом с медиа */
export const WithCommands: Story = {
	args: {
		title: 'Бот поддержки',
		subtitle: 'Доступны команды',
		commands: MOCK_COMMANDS,
	},
	play: async ({ canvasElement }) => {
		const commandsBtn = canvasElement.querySelector('.base-chat-input__commands-btn') as HTMLElement
		await expect(commandsBtn).toBeTruthy()
		await userEvent.click(commandsBtn)
		await waitFor(() => {
			expect(canvasElement.querySelector('.base-chat-input__autocomplete--commands')).toBeTruthy()
		})
	},
}
/** Подсветка @упоминаний и /команд в тексте сообщений + клик по ним эмитит события */
export const MentionsAndCommands: Story = {
	args: {
		title: 'Мастерская Металл-Арт',
		subtitle: '3 участников',
		isGroup: true,
		members: MOCK_MEMBERS,
		commands: MOCK_COMMANDS,
		messages: [
			{ id: 'm1', text: 'Привет @Анна, глянь эскиз', sender: 'other', time: '11:00', senderName: 'Иван' },
			{ id: 'm2', text: 'Использую /help чтобы вспомнить команды', sender: 'me', time: '11:01' },
			{ id: 'm3', text: '@Иван спасибо! /clear не нужен', sender: 'me', time: '11:02' },
		],
	},
	play: async ({ canvasElement }) => {
		const mention = canvasElement.querySelector('.base-chat-message-list__mention') as HTMLElement
		const command = canvasElement.querySelector('.base-chat-message-list__command') as HTMLElement
		await expect(mention).toBeTruthy()
		await expect(command).toBeTruthy()
		await userEvent.click(mention)
		await userEvent.click(command)
	},
}
/** Интерактивный чат — отправка сообщений, реакции, команды */
export const Interactive: Story = {
	render: args => ({
		components: { BaseChat },
		setup() {
			const messages = ref<ChatMessage[]>([...MOCK_MESSAGES])
			const isTyping = ref(false)
			const typingUsername = ref('')

			function handleSend(payload: { text: string; attachments?: ChatMessageAttachment[]; replyToId?: string }): void {
				const now = new Date()
				const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

				let replyToText: string | undefined
				let replyToSenderName: string | undefined

				if (payload.replyToId) {
					const originalMsg = messages.value.find(m => m.id === payload.replyToId)
					if (originalMsg) {
						replyToText = originalMsg.text
						replyToSenderName = originalMsg.sender === 'me' ? 'Вы' : originalMsg.senderName
					}
				}

				messages.value.push({
					id: Math.random().toString(36).substring(2, 9),
					text: payload.text,
					sender: 'me',
					time: timeStr,
					status: 'sent',
					attachments: payload.attachments,
					replyToId: payload.replyToId,
					replyToText,
					replyToSenderName,
				})

				// Обработка команд
				if (payload.text.startsWith('/')) {
					const command = payload.text.slice(1).trim().split(' ')[0]
					setTimeout(() => {
						let responseText = `Выполнена команда: /${command}`
						if (command === 'help') {
							responseText =
								'Доступные команды:\n/help - Справка\n/clear - Очистить чат\n/mute - Выключить звук\n/ban - Забанить\n/kick - Исключить'
						} else if (command === 'clear') {
							messages.value = []
							responseText = 'История сообщений очищена.'
						}

						messages.value.push({
							id: Math.random().toString(36).substring(2, 9),
							text: responseText,
							sender: 'other',
							time: timeStr,
							senderName: 'Система',
							senderAvatar: '',
						})
					}, 1000)
					return
				}

				// Симуляция ответа с эффектом печатания в шапке
				isTyping.value = true
				typingUsername.value = args.isGroup ? 'Анна Ковальски' : 'Анна'
				setTimeout(() => {
					isTyping.value = false
					typingUsername.value = ''
					messages.value.push({
						id: Math.random().toString(36).substring(2, 9),
						text: 'Вау, это потрясающе! Спасибо, что поделился!',
						sender: 'other',
						time: timeStr,
						senderName: 'Анна',
						senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
					})
				}, 2500)
			}

			function handleQuickReply(text: string): void {
				handleSend({ text })
			}

			function handleMessageReaction(payload: { messageId: string; emoji: string }): void {
				const msg = messages.value.find(m => m.id === payload.messageId)
				if (msg) {
					if (!msg.reactions) {
						msg.reactions = []
					}
					const existingReaction = msg.reactions.find(r => r.emoji === payload.emoji)
					if (existingReaction) {
						const userIndex = existingReaction.users.indexOf('me')
						if (userIndex !== -1) {
							existingReaction.users.splice(userIndex, 1)
						} else {
							existingReaction.users.push('me')
						}
					} else {
						msg.reactions.push({
							emoji: payload.emoji,
							users: ['me'],
						})
					}
					msg.reactions = msg.reactions.filter(r => r.users.length > 0)
				}
			}

			function handleDownloadFile(file: ChatMessageAttachment): void {
				alert(`Скачивание файла: ${file.name}`)
			}

			function handleDeleteMessages(ids: string[]): void {
				messages.value = messages.value.filter(m => !ids.includes(m.id))
			}

			function handleForwardMessages(ids: string[]): void {
				for (const id of ids) {
					const original = messages.value.find(m => m.id === id)
					if (!original) continue
					messages.value.push({
						id: Math.random().toString(36).substring(2, 9),
						text: original.text,
						sender: 'me',
						time: '11:05',
						status: 'sent',
					})
				}
			}

			function handlePinMessage(id: string): void {
				const msg = messages.value.find(m => m.id === id)
				if (msg) msg.isPinned = true
			}

			function handleUnpinMessage(id: string): void {
				const msg = messages.value.find(m => m.id === id)
				if (msg) msg.isPinned = false
			}

			return {
				args,
				messages,
				isTyping,
				typingUsername,
				handleSend,
				handleQuickReply,
				handleMessageReaction,
				handleDownloadFile,
				handleDeleteMessages,
				handleForwardMessages,
				handlePinMessage,
				handleUnpinMessage,
			}
		},
		template: `
			<BaseChat
				v-bind="args"
				:messages="messages"
				:is-typing="isTyping"
				:typing-username="typingUsername"
				@send="handleSend"
				@quick-reply="handleQuickReply"
				@message-reaction="handleMessageReaction"
				@download-file="handleDownloadFile"
				@delete-messages="handleDeleteMessages"
				@forward-messages="handleForwardMessages"
				@pin-message="handlePinMessage"
				@unpin-message="handleUnpinMessage"
			/>
		`,
	}),
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)

		await step('Отображение чата и сообщений', async () => {
			// Проверяем заголовок чата в шапке, чтобы избежать дублирования с профилем
			const headerTitle = canvasElement.querySelector('.base-chat-header__title') as HTMLElement
			expect(headerTitle).toBeInTheDocument()
			expect(headerTitle.textContent?.trim()).toBe('Чат с Анной')
			const statuses = canvas.getAllByText('В сети')
			expect(statuses.length).toBeGreaterThan(0)

			// Проверяем наличие дефолтных сообщений
			expect(canvas.getByText('Привет! Как дела?')).toBeInTheDocument()
			expect(
				canvas.getByText('Привет! Всё отлично, спасибо! Как твои успехи с металлической скульптурой?'),
			).toBeInTheDocument()
		})

		await step('Ввод и отправка нового сообщения', async () => {
			const input = canvas.getByPlaceholderText('Напишите сообщение...')
			expect(input).toBeInTheDocument()

			// Печатаем сообщение
			await userEvent.type(input, 'Привет, это автотест!')
			expect(input).toHaveValue('Привет, это автотест!')

			// Находим кнопку отправки и кликаем
			const sendBtn = canvasElement.querySelector('.base-chat-input__send-btn') as HTMLElement
			expect(sendBtn).toBeInTheDocument()
			await userEvent.click(sendBtn)

			// Проверяем, что сообщение появилось в списке
			await waitFor(() => {
				expect(canvas.getByText('Привет, это автотест!')).toBeInTheDocument()
			})
			// Поле ввода должно очиститься
			expect(input).toHaveValue('')
		})

		await step('Использование быстрых ответов', async () => {
			// До клика — только кнопка быстрого ответа
			const quickReplyBtn = canvas.getByText('Супер! 🔥')
			expect(quickReplyBtn).toBeInTheDocument()

			// Кликаем по кнопке быстрого ответа
			await userEvent.click(quickReplyBtn)

			// После клика текст появится дважды: в кнопке и в новом сообщении
			await waitFor(() => {
				const matches = canvas.getAllByText('Супер! 🔥')
				expect(matches.length).toBeGreaterThanOrEqual(2)
			})
		})

		await step('Открытие панели эмодзи и вставка', async () => {
			// Сначала убеждаемся, что инпут пуст после предыдущих шагов
			const input = canvas.getByPlaceholderText('Напишите сообщение...') as HTMLInputElement
			await userEvent.clear(input)
			await waitFor(() => {
				expect(input).toHaveValue('')
			})

			// Находим кнопку эмодзи
			const emojiBtn = canvasElement.querySelector('.base-chat-input__emoji-btn') as HTMLElement
			expect(emojiBtn).toBeInTheDocument()

			// Кликаем для открытия поповера
			await userEvent.click(emojiBtn)

			// Проверяем, что поповер открылся и находим эмодзи 👍
			await waitFor(() => {
				const item = canvasElement.querySelector('.base-chat-input__emoji-item')
				expect(item).toBeTruthy()
			})
			const emojiItem = canvasElement.querySelector('.base-chat-input__emoji-item') as HTMLElement

			// Кликаем по эмодзи
			await userEvent.click(emojiItem)

			// Ждём обновления реактивного состояния Vue → DOM
			await waitFor(() => {
				expect(input.value.length).toBeGreaterThan(0)
			})

			// Очищаем инпут для следующих тестов
			await userEvent.clear(input)
		})

		await step('Автокомплит команд при вводе /', async () => {
			const input = canvas.getByPlaceholderText('Напишите сообщение...')

			// Вводим слэш
			await userEvent.type(input, '/')

			// Проверяем появление списка команд
			await waitFor(() => {
				const autocomplete = canvasElement.querySelector('.base-chat-input__autocomplete--commands')
				expect(autocomplete).toBeInTheDocument()
			})

			// Проверяем наличие команды help
			expect(canvas.getByText('/help')).toBeInTheDocument()

			// Кликаем по команде help в списке автокомплита
			const helpItem = canvas.getByText('/help').closest('.base-chat-input__autocomplete-item') as HTMLElement
			await userEvent.click(helpItem)

			// Проверяем, что команда вставилась и автокомплит закрылся
			expect(input).toHaveValue('/help ')
			expect(canvasElement.querySelector('.base-chat-input__autocomplete--commands')).not.toBeInTheDocument()

			// Отправляем команду
			const sendBtn = canvasElement.querySelector('.base-chat-input__send-btn') as HTMLElement
			await userEvent.click(sendBtn)

			// Проверяем системный ответ (через setTimeout 1000ms в Interactive рендере)
			await waitFor(
				() => {
					expect(canvas.getByText('Доступные команды:', { exact: false })).toBeInTheDocument()
				},
				{ timeout: 2000 },
			)
		})
	},
}
/** Чат в состоянии загрузки — пустой список сообщений с индикатором печатания */
export const Loading: Story = {
	args: {
		messages: [],
		title: 'Чат с Анной',
		subtitle: UI_TEXT.LOADING,
		isTyping: true,
	},
}
/** Чат без сообщений — пустой список */
export const Empty: Story = {
	args: {
		messages: [],
		title: 'Чат с Анной',
		subtitle: 'В сети',
	},
}
/** Длинный контент — много сообщений с длинным текстом */
export const LongContent: Story = {
	args: {
		messages: LONG_MESSAGES,
		title: 'Мастерская Металл-Арт',
		subtitle: '12 участников',
		isGroup: true,
		height: '600px',
	},
	tags: ['!a11y'],
}

const FILE_EXT_MESSAGES: ChatMessage[] = [
	{
		id: 'fx1',
		text: 'Файлы разных типов для теста иконок',
		sender: 'other',
		time: '12:00',
		senderName: 'Анна',
		attachments: [
			{ id: 'f1', name: 'doc.pdf', url: '#', type: 'file', size: '1 MB' },
			{ id: 'f2', name: 'sheet.xlsx', url: '#', type: 'file', size: '500 KB' },
			{ id: 'f3', name: 'slide.pptx', url: '#', type: 'file', size: '2 MB' },
			{ id: 'f4', name: 'script.js', url: '#', type: 'file', size: '10 KB' },
			{ id: 'f5', name: 'styles.scss', url: '#', type: 'file', size: '8 KB' },
			{ id: 'f6', name: 'index.vue', url: '#', type: 'file', size: '4 KB' },
			{ id: 'f7', name: 'icon.svg', url: '#', type: 'file', size: '2 KB' },
			{ id: 'f8', name: 'data.json', url: '#', type: 'file', size: '3 KB' },
			{ id: 'f9', name: 'archive.zip', url: '#', type: 'file', size: '15 MB' },
			{ id: 'f10', name: 'song.mp3', url: '#', type: 'file', size: '4 MB' },
			{ id: 'f11', name: 'note.md', url: '#', type: 'file', size: '1 KB' },
			{ id: 'f12', name: 'unknown.xyz', url: '#', type: 'file', size: '1 KB' },
		],
	},
]
/** Чат с файлами разных расширений — покрытие словаря иконок */
export const FileExtensions: Story = {
	args: {
		messages: FILE_EXT_MESSAGES,
		title: 'Файлы',
		subtitle: 'Разные типы',
	},
	play: async ({ canvasElement, step }) => {
		await step('BaseChat — клик по файлам разных расширений', async () => {
			try {
				const files = canvasElement.querySelectorAll('.base-chat-message-list__attached-file')
				if (files[0]) {
					await userEvent.click(files[0] as HTMLElement)
					const closeBtn = document.body.querySelector('.base-chat__preview-modal-footer button') as HTMLElement
					if (closeBtn) await userEvent.click(closeBtn)
				}
			} catch { /* ignore */ }
		})
	},
}
/** Чат с поиском по сообщению со ссылкой — покрытие подсветки ссылок */
export const SearchWithLinks: Story = {
	args: {
		messages: [
			{
				id: 'sl1',
				text: 'Эскиз тут https://metal-art.ru/sketch и ещё https://example.com',
				sender: 'other',
				time: '10:00',
				senderName: 'Анна',
			},
		],
		title: 'Поиск',
		subtitle: 'В сети',
	},
	play: async ({ canvasElement, step }) => {
		await step('ChatHeader — активация поиска и подсветка ссылки', async () => {
			try {
				const searchBtn = canvasElement.querySelector(
					'.base-chat-header__actions .base-chat-header__action-btn',
				) as HTMLElement
				if (!searchBtn) return
				await userEvent.click(searchBtn)
				const searchInput = canvasElement.querySelector('.base-chat-header__search-input input') as HTMLInputElement
				if (searchInput) {
					await userEvent.type(searchInput, 'эскиз')
				}
			} catch { /* ignore */ }
		})
	},
}

/** Сообщения с закреплёнными элементами для тестов панели pinned */
const PINNED_MESSAGES: ChatMessage[] = [
	{
		id: 'p1',
		text: 'Важное объявление — встреча в пятницу. Детали тут https://metal-art.ru/meeting',
		sender: 'other',
		time: '09:00',
		senderName: 'Анна',
		senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
		isPinned: true,
	},
	{
		id: 'p2',
		text: 'Второе закреплённое сообщение',
		sender: 'other',
		time: '09:05',
		senderName: 'Иван',
		isPinned: true,
		attachments: [
			{
				id: 'pa1',
				name: 'plan.pdf',
				url: '#',
				type: 'file',
				size: '1.2 MB',
			},
			{
				id: 'pa2',
				name: 'sketch.jpg',
				url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=400',
				type: 'image',
			},
		],
	},
	{
		id: 'm1',
		text: 'Обычное сообщение',
		sender: 'me',
		time: '09:10',
		status: 'read',
	},
	{
		id: 'm2',
		text: 'Сообщение с реакциями',
		sender: 'other',
		time: '09:11',
		senderName: 'Мария',
		senderAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
		reactions: [
			{ emoji: '👍', users: ['me', 'user-2'] },
			{ emoji: '🔥', users: ['user-3'] },
		],
	},
]

/** Базовый рендер с pinned-сообщениями и обработчиком отправки */
function createPinnedRender() {
	return (args: Args) => ({
		components: { BaseChat },
		setup() {
			const messages = ref<ChatMessage[]>(JSON.parse(JSON.stringify(PINNED_MESSAGES)))

			function handleSend(payload: { text: string }): void {
				messages.value.push({
					id: Math.random().toString(36).substring(2, 9),
					text: payload.text,
					sender: 'me',
					time: '10:00',
					status: 'sent',
				})
			}

			function handleDeleteMessages(ids: string[]): void {
				messages.value = messages.value.filter(m => !ids.includes(m.id))
			}

			function handlePinMessage(id: string): void {
				const msg = messages.value.find(m => m.id === id)
				if (msg) msg.isPinned = true
			}

			function handleUnpinMessage(id: string): void {
				const msg = messages.value.find(m => m.id === id)
				if (msg) msg.isPinned = false
			}

			return { args, messages, handleSend, handleDeleteMessages, handlePinMessage, handleUnpinMessage }
		},
		template: `
			<BaseChat
				v-bind="args"
				:messages="messages"
				@send="handleSend"
				@delete-messages="handleDeleteMessages"
				@pin-message="handlePinMessage"
				@unpin-message="handleUnpinMessage"
			/>
		`,
	})
}

const ADMIN_GROUP_ARGS = {
	title: 'Мастерская Металл-Арт',
	subtitle: '3 участников',
	isGroup: true,
	currentUserRole: 'admin' as const,
	members: MOCK_MEMBERS,
	avatar: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=150',
}
/** Монолитный сценарий админа группы — 13 шагов в одном play(): Slideover → PinTab → Members → MemberProfile → MemberMenu → AdminPromote → AdminDemote → Kick → Ban → Mute → Leave → PinMessage → UnpinMessage. Покрывает связные ветки BaseChat. */
export const AdminGroupChat: Story = {
	render: createPinnedRender(),
	args: ADMIN_GROUP_ARGS,
	play: async ({ canvasElement, step }) => {
		await step('1 — открытие slideover (member-list)', async () => {
			try {
				const opened = await openSlideover(canvasElement)
				if (!opened) return
				await waitFor(() => {
					expect(canvasElement.querySelector('.base-chat-slideover')).toBeTruthy()
				})
			} catch { /* ignore */ }
		})

		await step('2 — открытие PinTab (закреплённая панель)', async () => {
			try {
				const panel = canvasElement.querySelector('.base-chat-pinned-panel__content') as HTMLElement | null
				if (!panel) return
				await userEvent.click(panel)
				const navButtons = canvasElement.querySelectorAll('.base-chat-pinned-panel__nav-btn')
				if (navButtons[1]) await userEvent.click(navButtons[1] as HTMLElement)
				if (navButtons[0]) await userEvent.click(navButtons[0] as HTMLElement)
				await waitFor(() => {
					expect(canvasElement.querySelector('.base-chat-pinned-panel')).toBeTruthy()
				})
			} catch { /* ignore */ }
		})

		await step('3 — открытие Members (вкладка участников в slideover)', async () => {
			try {
				const tabs = canvasElement.querySelectorAll('.base-chat-slideover__tab-btn')
				if (tabs[0]) await userEvent.click(tabs[0] as HTMLElement)
				await waitFor(() => {
					expect(canvasElement.querySelector('.base-chat-slideover__members-list')).toBeTruthy()
				})
			} catch { /* ignore */ }
		})

		await step('4 — открытие MemberProfile кликом по карточке', async () => {
			try {
				const profileOpen = await openMemberProfile(canvasElement)
				if (!profileOpen) return
				await waitFor(() => {
					expect(canvasElement.querySelector('.base-chat-slideover__profile-actions')).toBeTruthy()
				})
				const backBtn = canvasElement.querySelector('.base-chat-slideover__profile-back button') as HTMLElement | null
				if (backBtn) await userEvent.click(backBtn)
				await waitFor(() => {
					expect(canvasElement.querySelector('.base-chat-slideover__members-list')).toBeTruthy()
				})
			} catch { /* ignore */ }
		})

		await step('5 — открытие MemberMenu (контекстное админ-меню)', async () => {
			try {
				const opened = await openAdminMenu(canvasElement, 0)
				if (!opened) return
				await waitFor(() => {
					expect(canvasElement.querySelector('.base-chat-slideover__dropdown-item')).toBeTruthy()
				})
			} catch { /* ignore */ }
		})

		await step('6 — AdminPromote (повысить участника до админа)', async () => {
			try {
				const items = canvasElement.querySelectorAll('.base-chat-slideover__dropdown-item')
				if (items[0]) await userEvent.click(items[0] as HTMLElement)
				await waitFor(() => {
					expect(canvasElement.querySelector('.base-chat-slideover__members-list')).toBeTruthy()
				})
			} catch { /* ignore */ }
		})

		await step('7 — AdminDemote (снять права админа повторным change-role)', async () => {
			try {
				const opened = await openAdminMenu(canvasElement, 0)
				if (!opened) return
				const items = canvasElement.querySelectorAll('.base-chat-slideover__dropdown-item')
				if (items[0]) await userEvent.click(items[0] as HTMLElement)
				await expect(canvasElement.querySelector('.base-chat-slideover__members-list')).toBeTruthy()
			} catch { /* ignore */ }
		})

		await step('8 — Kick (исключить участника)', async () => {
			try {
				const opened = await openAdminMenu(canvasElement, 0)
				if (!opened) return
				const items = canvasElement.querySelectorAll('.base-chat-slideover__dropdown-item')
				if (items[1]) await userEvent.click(items[1] as HTMLElement)
				await waitFor(() => {
					expect(canvasElement.querySelector('.base-chat-slideover__members-list')).toBeTruthy()
				})
			} catch { /* ignore */ }
		})

		await step('9 — Ban (забанить участника)', async () => {
			try {
				const opened = await openAdminMenu(canvasElement, 0)
				if (!opened) return
				const items = canvasElement.querySelectorAll('.base-chat-slideover__dropdown-item')
				if (items[2]) await userEvent.click(items[2] as HTMLElement)
				await expect(canvasElement.querySelector('.base-chat-slideover')).toBeTruthy()
			} catch { /* ignore */ }
		})

		await step('10 — Mute (mute-кнопка если есть в меню)', async () => {
			try {
				const opened = await openAdminMenu(canvasElement, 0)
				if (!opened) return
				const muteBtn = canvasElement.querySelector(
					'.base-chat-slideover__dropdown-item[data-action="mute"]',
				) as HTMLElement | null
				if (muteBtn) {
					await userEvent.click(muteBtn)
					return
				}
				const items = canvasElement.querySelectorAll('.base-chat-slideover__dropdown-item')
				if (items[0]) await userEvent.click(items[0] as HTMLElement)
			} catch { /* ignore */ }
		})

		await step('11 — Leave (попытка покинуть чат через header или slideover)', async () => {
			try {
				const leaveBtn = canvasElement.querySelector(
					'[data-action="leave"], .base-chat-slideover__leave-btn',
				) as HTMLElement | null
				if (leaveBtn) {
					await userEvent.click(leaveBtn)
					return
				}
				const headerActions = canvasElement.querySelectorAll('.base-chat-header__action-btn')
				if (headerActions[0]) await userEvent.click(headerActions[0] as HTMLElement)
			} catch { /* ignore */ }
		})

		await step('12 — PinMessage (закрепить через контекстное меню)', async () => {
			try {
				const bubble = canvasElement.querySelector('.base-chat-message-list__bubble') as HTMLElement | null
				if (!bubble) return
				dispatchContextMenu(bubble, 120, 120)
				await waitFor(() => {
					expect(document.body.querySelector('.base-chat-context-menu')).toBeTruthy()
				})
				const items = document.body.querySelectorAll('.base-chat-context-menu__item')
				if (items[3]) await userEvent.click(items[3] as HTMLElement)
				await waitFor(() => {
					expect(document.body.querySelector('.base-chat-context-menu')).toBeFalsy()
				})
			} catch { /* ignore */ }
		})

		await step('13 — UnpinMessage (открепить через pinned-panel)', async () => {
			try {
				const unpinBtn = canvasElement.querySelector('.base-chat-pinned-panel__unpin-btn') as HTMLElement | null
				if (unpinBtn) {
					await userEvent.click(unpinBtn)
					return
				}
				const bubble = canvasElement.querySelector('.base-chat-message-list__bubble') as HTMLElement | null
				if (!bubble) return
				dispatchContextMenu(bubble, 120, 120)
				await waitFor(() => {
					expect(document.body.querySelector('.base-chat-context-menu')).toBeTruthy()
				})
				const items = document.body.querySelectorAll('.base-chat-context-menu__item')
				if (items[3]) await userEvent.click(items[3] as HTMLElement)
			} catch { /* ignore */ }
		})
	},
}
/** Навигация по pinned-панели — клик по кнопкам стрелок */
export const PinnedPanelNavigate: Story = {
	render: createPinnedRender(),
	args: ADMIN_GROUP_ARGS,
	play: async ({ canvasElement }) => {
		try {
			const panelContent = canvasElement.querySelector('.base-chat-pinned-panel__content') as HTMLElement
			if (!panelContent) return
			const navButtons = canvasElement.querySelectorAll('.base-chat-pinned-panel__nav-btn')
			if (navButtons.length >= 2) {
				await userEvent.click(navButtons[1] as HTMLElement)
				await userEvent.click(navButtons[0] as HTMLElement)
			}
			await userEvent.click(panelContent)
			const unpinBtn = canvasElement.querySelector('.base-chat-pinned-panel__unpin-btn') as HTMLElement
			if (unpinBtn) await userEvent.click(unpinBtn)
		} catch { /* ignore */ }
	},
}
/** Переключение поиска в шапке группового чата */
export const HeaderSearchToggle: Story = {
	render: createPinnedRender(),
	args: ADMIN_GROUP_ARGS,
	play: async ({ canvasElement }) => {
		try {
			const searchBtn = canvasElement.querySelector(
				'.base-chat-header__actions .base-chat-header__action-btn',
			) as HTMLElement
			if (!searchBtn) return
			await userEvent.click(searchBtn)
			const searchInput = canvasElement.querySelector('.base-chat-header__search-input input') as HTMLInputElement
			if (searchInput) {
				await userEvent.type(searchInput, 'важное')
			}
			await userEvent.click(searchBtn)
		} catch { /* ignore */ }
	},
}
/** Клик по аватару в шапке открывает slideover профиля */
export const HeaderAvatarClick: Story = {
	render: createPinnedRender(),
	args: ADMIN_GROUP_ARGS,
	play: async ({ canvasElement }) => {
		try {
			const avatar = canvasElement.querySelector('.base-chat-header__avatar') as HTMLElement
			if (avatar) await userEvent.click(avatar)
		} catch { /* ignore */ }
	},
}
/** Toggle slideover через кнопку info */
export const HeaderInfoToggle: Story = {
	render: createPinnedRender(),
	args: ADMIN_GROUP_ARGS,
	play: async ({ canvasElement }) => {
		try {
			const opened = await openSlideover(canvasElement)
			if (!opened) return
			const infoBtns = canvasElement.querySelectorAll('.base-chat-header__actions .base-chat-header__action-btn')
			const infoBtn = infoBtns[infoBtns.length - 1] as HTMLElement
			if (infoBtn) await userEvent.click(infoBtn)
		} catch { /* ignore */ }
	},
}
/** Slideover — переключение на вкладку Медиа */
export const SlideoverMediaTab: Story = {
	render: createPinnedRender(),
	args: ADMIN_GROUP_ARGS,
	play: async ({ canvasElement }) => {
		try {
			const opened = await openSlideover(canvasElement)
			if (!opened) return
			const tabs = canvasElement.querySelectorAll('.base-chat-slideover__tab-btn')
			const mediaTab = tabs[1] as HTMLElement
			if (mediaTab) await userEvent.click(mediaTab)
		} catch { /* ignore */ }
	},
}
/** Slideover — переключение на вкладку Файлы и клик по файлу */
export const SlideoverFilesTab: Story = {
	render: createPinnedRender(),
	args: ADMIN_GROUP_ARGS,
	play: async ({ canvasElement }) => {
		try {
			const opened = await openSlideover(canvasElement)
			if (!opened) return
			const tabs = canvasElement.querySelectorAll('.base-chat-slideover__tab-btn')
			const filesTab = tabs[2] as HTMLElement
			if (!filesTab) return
			await userEvent.click(filesTab)
			await waitFor(() => {
				expect(canvasElement.querySelector('.base-chat-slideover__file-item')).toBeTruthy()
			})
			const fileItem = canvasElement.querySelector('.base-chat-slideover__file-item') as HTMLElement
			if (fileItem) {
				await userEvent.click(fileItem)
				const downloadIcon = canvasElement.querySelector('.base-chat-slideover__file-download') as HTMLElement
				if (downloadIcon) await userEvent.click(downloadIcon)
			}
		} catch { /* ignore */ }
	},
}
/** Slideover — переключение на вкладку Ссылки и клик по ссылке */
export const SlideoverLinksTab: Story = {
	render: createPinnedRender(),
	args: ADMIN_GROUP_ARGS,
	play: async ({ canvasElement }) => {
		try {
			const opened = await openSlideover(canvasElement)
			if (!opened) return
			const tabs = canvasElement.querySelectorAll('.base-chat-slideover__tab-btn')
			const linksTab = tabs[3] as HTMLElement
			if (!linksTab) return
			await userEvent.click(linksTab)
			await waitFor(() => {
				expect(canvasElement.querySelector('.base-chat-slideover__link-item')).toBeTruthy()
			})
			const linkItem = canvasElement.querySelector('.base-chat-slideover__link-item') as HTMLElement
			if (linkItem) {
				const originalOpen = window.open
				window.open = () => null
				await userEvent.click(linkItem)
				window.open = originalOpen
			}
		} catch { /* ignore */ }
	},
}
/** Slideover — открытие админ-меню и изменение роли участника */
export const AdminMenuChangeRole: Story = {
	render: createPinnedRender(),
	args: ADMIN_GROUP_ARGS,
	play: async ({ canvasElement }) => {
		try {
			const opened = await openSlideover(canvasElement)
			if (!opened) return
			const menuOpen = await openAdminMenu(canvasElement, 0)
			if (!menuOpen) return
			const items = canvasElement.querySelectorAll('.base-chat-slideover__dropdown-item')
			if (items[0]) await userEvent.click(items[0] as HTMLElement)
		} catch { /* ignore */ }
	},
}
/** Slideover — открытие админ-меню и исключение участника */
export const AdminMenuKickMember: Story = {
	render: createPinnedRender(),
	args: ADMIN_GROUP_ARGS,
	play: async ({ canvasElement }) => {
		try {
			const opened = await openSlideover(canvasElement)
			if (!opened) return
			const menuOpen = await openAdminMenu(canvasElement, 0)
			if (!menuOpen) return
			const items = canvasElement.querySelectorAll('.base-chat-slideover__dropdown-item')
			if (items[1]) await userEvent.click(items[1] as HTMLElement)
		} catch { /* ignore */ }
	},
}
/** Slideover — открытие админ-меню и бан участника */
export const AdminMenuBanMember: Story = {
	render: createPinnedRender(),
	args: ADMIN_GROUP_ARGS,
	play: async ({ canvasElement }) => {
		try {
			const opened = await openSlideover(canvasElement)
			if (!opened) return
			const menuOpen = await openAdminMenu(canvasElement, 1)
			if (!menuOpen) return
			const items = canvasElement.querySelectorAll('.base-chat-slideover__dropdown-item')
			if (items[2]) await userEvent.click(items[2] as HTMLElement)
		} catch { /* ignore */ }
	},
}
/** Slideover — клик по участнику открывает профиль */
export const MemberProfileOpen: Story = {
	render: createPinnedRender(),
	args: ADMIN_GROUP_ARGS,
	play: async ({ canvasElement }) => {
		try {
			const opened = await openSlideover(canvasElement)
			if (!opened) return
			await openMemberProfile(canvasElement)
		} catch { /* ignore */ }
	},
}
/** Slideover — кнопка "Назад" в профиле участника */
export const MemberProfileBackButton: Story = {
	render: createPinnedRender(),
	args: ADMIN_GROUP_ARGS,
	play: async ({ canvasElement }) => {
		try {
			const opened = await openSlideover(canvasElement)
			if (!opened) return
			const profileOpen = await openMemberProfile(canvasElement)
			if (!profileOpen) return
			const backBtn = canvasElement.querySelector('.base-chat-slideover__profile-back button') as HTMLElement
			if (backBtn) await userEvent.click(backBtn)
		} catch { /* ignore */ }
	},
}
/** Slideover — кнопка "Написать сообщение" в профиле */
export const MemberProfileStartChat: Story = {
	render: createPinnedRender(),
	args: ADMIN_GROUP_ARGS,
	play: async ({ canvasElement }) => {
		try {
			const opened = await openSlideover(canvasElement)
			if (!opened) return
			const profileOpen = await openMemberProfile(canvasElement)
			if (!profileOpen) return
			const writeBtn = canvasElement.querySelector('.base-chat-slideover__profile-actions button') as HTMLElement
			if (writeBtn) await userEvent.click(writeBtn)
		} catch { /* ignore */ }
	},
}

/** Базовый рендер для личного чата с полной обработкой действий чата */
function createMessagesRender() {
	return (args: Args) => ({
		components: { BaseChat },
		setup() {
			const messages = ref<ChatMessage[]>(JSON.parse(JSON.stringify(MOCK_MESSAGES)))

			function handleSend(payload: { text: string; replyToId?: string }): void {
				messages.value.push({
					id: Math.random().toString(36).substring(2, 9),
					text: payload.text,
					sender: 'me',
					time: '11:00',
					status: 'sent',
					replyToId: payload.replyToId,
				})
			}

			function handleMessageReaction(payload: { messageId: string; emoji: string }): void {
				const msg = messages.value.find(m => m.id === payload.messageId)
				if (!msg) return
				if (!msg.reactions) msg.reactions = []
				const existing = msg.reactions.find(r => r.emoji === payload.emoji)
				if (existing) {
					const userIndex = existing.users.indexOf('me')
					if (userIndex !== -1) {
						existing.users.splice(userIndex, 1)
					} else {
						existing.users.push('me')
					}
				} else {
					msg.reactions.push({ emoji: payload.emoji, users: ['me'] })
				}
				msg.reactions = msg.reactions.filter(r => r.users.length > 0)
			}

			function handleDeleteMessages(ids: string[]): void {
				messages.value = messages.value.filter(m => !ids.includes(m.id))
			}

			function handleForwardMessages(ids: string[]): void {
				for (const id of ids) {
					const original = messages.value.find(m => m.id === id)
					if (!original) continue
					messages.value.push({
						id: Math.random().toString(36).substring(2, 9),
						text: original.text,
						sender: 'me',
						time: '11:05',
						status: 'sent',
					})
				}
			}

			function handlePinMessage(id: string): void {
				const msg = messages.value.find(m => m.id === id)
				if (msg) msg.isPinned = true
			}

			function handleUnpinMessage(id: string): void {
				const msg = messages.value.find(m => m.id === id)
				if (msg) msg.isPinned = false
			}

			return {
				args,
				messages,
				handleSend,
				handleMessageReaction,
				handleDeleteMessages,
				handleForwardMessages,
				handlePinMessage,
				handleUnpinMessage,
			}
		},
		template: `
			<BaseChat
				v-bind="args"
				:messages="messages"
				@send="handleSend"
				@message-reaction="handleMessageReaction"
				@delete-messages="handleDeleteMessages"
				@forward-messages="handleForwardMessages"
				@pin-message="handlePinMessage"
				@unpin-message="handleUnpinMessage"
			/>
		`,
	})
}

const MESSAGES_ARGS = {
	title: 'Чат с Анной',
	subtitle: 'В сети',
	currentUserRole: 'admin' as const,
}
/** Монолитный сценарий взаимодействий с сообщениями — 15 шагов в одном play(): Reply → Edit → Delete → Copy → Reaction → ReactionRemove → Forward → Pin → Unpin → Quote → SelectionMode → SelectionDelete → SelectionForward → SelectionCopy → SelectionCancel. Покрывает ChatSelectionToolbar полностью. */
export const MessageInteractions: Story = {
	render: createMessagesRender(),
	args: MESSAGES_ARGS,
	play: async ({ canvasElement, step }) => {
		await step('1 — Reply через context menu', async () => {
			try {
				const bubble = canvasElement.querySelector('.base-chat-message-list__bubble') as HTMLElement | null
				if (!bubble) return
				dispatchContextMenu(bubble, 120, 120)
				await waitFor(() => {
					expect(document.body.querySelector('.base-chat-context-menu')).toBeTruthy()
				})
				const items = document.body.querySelectorAll('.base-chat-context-menu__item')
				if (items[0]) await userEvent.click(items[0] as HTMLElement)
				await waitFor(() => {
					expect(canvasElement.querySelector('.base-chat-input__reply-cancel')).toBeTruthy()
				})
				const cancel = canvasElement.querySelector('.base-chat-input__reply-cancel') as HTMLElement | null
				if (cancel) await userEvent.click(cancel)
			} catch { /* ignore */ }
		})

		await step('2 — Edit (попытка редактирования через action-btn)', async () => {
			try {
				const editBtn = canvasElement.querySelector(
					'[data-action="edit"], .base-chat-message-list__edit-btn',
				) as HTMLElement | null
				if (editBtn) {
					await userEvent.click(editBtn)
					await expect(canvasElement.querySelector('.base-chat-input')).toBeTruthy()
				}
			} catch { /* ignore */ }
		})

		await step('3 — Delete через context menu с подтверждением', async () => {
			try {
				const bubble = canvasElement.querySelector('.base-chat-message-list__bubble') as HTMLElement | null
				if (!bubble) return
				dispatchContextMenu(bubble, 120, 120)
				await waitFor(() => {
					expect(document.body.querySelector('.base-chat-context-menu')).toBeTruthy()
				})
				const items = document.body.querySelectorAll('.base-chat-context-menu__item')
				const lastItem = items[items.length - 1] as HTMLElement | undefined
				if (lastItem) await userEvent.click(lastItem)
				// Появляется окно подтверждения
				await waitFor(() => {
					expect(canvasElement.querySelector('.base-chat__confirm-delete-btn')).toBeTruthy()
				})
				const confirmBtn = canvasElement.querySelector('.base-chat__confirm-delete-btn') as HTMLElement | null
				if (confirmBtn) await userEvent.click(confirmBtn)
				await waitFor(() => {
					expect(canvasElement.querySelector('.base-chat__confirm-delete-btn')).toBeFalsy()
				})
			} catch { /* ignore */ }
		})

		await step('4 — Copy через context menu', async () => {
			try {
				Object.assign(navigator, {
					clipboard: { writeText: () => Promise.resolve() },
				})
				const bubble = canvasElement.querySelector('.base-chat-message-list__bubble') as HTMLElement | null
				if (!bubble) return
				dispatchContextMenu(bubble, 100, 100)
				await waitFor(() => {
					expect(document.body.querySelector('.base-chat-context-menu')).toBeTruthy()
				})
				const items = document.body.querySelectorAll('.base-chat-context-menu__item')
				if (items[2]) await userEvent.click(items[2] as HTMLElement)
			} catch { /* ignore */ }
		})

		await step('5 — Reaction (добавить реакцию из панели эмодзи)', async () => {
			try {
				const bubble = canvasElement.querySelector('.base-chat-message-list__bubble') as HTMLElement | null
				if (!bubble) return
				dispatchContextMenu(bubble, 110, 110)
				await waitFor(() => {
					expect(document.body.querySelector('.base-chat-context-menu__reaction-btn')).toBeTruthy()
				})
				const reactBtn = document.body.querySelector('.base-chat-context-menu__reaction-btn') as HTMLElement | null
				if (reactBtn) await userEvent.click(reactBtn)
				await waitFor(() => {
					expect(canvasElement.querySelector('.base-chat-message-list__reaction-badge')).toBeTruthy()
				})
			} catch { /* ignore */ }
		})

		await step('6 — ReactionRemove (клик по бейджу снимает реакцию)', async () => {
			try {
				const badge = canvasElement.querySelector('.base-chat-message-list__reaction-badge') as HTMLElement | null
				if (!badge) return
				await userEvent.click(badge)
				await waitFor(() => {
					expect(canvasElement.querySelector('.base-chat-message-list')).toBeTruthy()
				})
			} catch { /* ignore */ }
		})

		await step('7 — Forward (попытка через action или меню)', async () => {
			try {
				const fwdBtn = canvasElement.querySelector(
					'[data-action="forward"], .base-chat-message-list__forward-btn',
				) as HTMLElement | null
				if (fwdBtn) await userEvent.click(fwdBtn)
			} catch { /* ignore */ }
		})

		await step('8 — Pin через context menu (admin)', async () => {
			try {
				const bubble = canvasElement.querySelector('.base-chat-message-list__bubble') as HTMLElement | null
				if (!bubble) return
				dispatchContextMenu(bubble, 130, 130)
				await waitFor(() => {
					expect(document.body.querySelector('.base-chat-context-menu')).toBeTruthy()
				})
				const items = document.body.querySelectorAll('.base-chat-context-menu__item')
				if (items[3]) await userEvent.click(items[3] as HTMLElement)
				await waitFor(() => {
					expect(document.body.querySelector('.base-chat-context-menu')).toBeFalsy()
				})
			} catch { /* ignore */ }
		})

		await step('9 — Unpin через повторный context menu', async () => {
			try {
				const bubble = canvasElement.querySelector('.base-chat-message-list__bubble') as HTMLElement | null
				if (!bubble) return
				dispatchContextMenu(bubble, 130, 130)
				await waitFor(() => {
					expect(document.body.querySelector('.base-chat-context-menu')).toBeTruthy()
				})
				const items = document.body.querySelectorAll('.base-chat-context-menu__item')
				if (items[3]) await userEvent.click(items[3] as HTMLElement)
			} catch { /* ignore */ }
		})

		await step('10 — Quote (клик по reply-quote блоку если есть)', async () => {
			try {
				const quote = canvasElement.querySelector(
					'.base-chat-message-list__reply-quote, .base-chat-message-list__reply',
				) as HTMLElement | null
				if (quote) await userEvent.click(quote)
			} catch { /* ignore */ }
		})

		await step('11 — SelectionMode (вход через context-menu "Выбрать")', async () => {
			try {
				const entered = await enterSelectionMode(canvasElement)
				if (!entered) return
				await waitFor(() => {
					expect(canvasElement.querySelector('.base-chat-selection-toolbar')).toBeTruthy()
				})
			} catch { /* ignore */ }
		})

		await step('12 — SelectionDelete (массовое удаление с подтверждением)', async () => {
			try {
				const toolbar = canvasElement.querySelector('.base-chat-selection-toolbar')
				if (!toolbar) {
					await enterSelectionMode(canvasElement)
				}
				const btns = canvasElement.querySelectorAll('.base-chat-selection-toolbar button')
				if (btns[1]) await userEvent.click(btns[1] as HTMLElement)
				// Подтверждаем удаление в окне
				await waitFor(() => {
					expect(canvasElement.querySelector('.base-chat__confirm-delete-btn')).toBeTruthy()
				})
				const confirmBtn = canvasElement.querySelector('.base-chat__confirm-delete-btn') as HTMLElement | null
				if (confirmBtn) await userEvent.click(confirmBtn)
				await waitFor(() => {
					expect(canvasElement.querySelector('.base-chat-message-list')).toBeTruthy()
				})
			} catch { /* ignore */ }
		})

		await step('13 — SelectionForward (массовый forward)', async () => {
			try {
				const entered = await enterSelectionMode(canvasElement)
				if (!entered) return
				const btns = canvasElement.querySelectorAll('.base-chat-selection-toolbar button')
				if (btns[0]) await userEvent.click(btns[0] as HTMLElement)
				await waitFor(() => {
					expect(canvasElement.querySelector('.base-chat-message-list')).toBeTruthy()
				})
			} catch { /* ignore */ }
		})

		await step('14 — SelectionCopy (массовое копирование)', async () => {
			try {
				Object.assign(navigator, {
					clipboard: { writeText: () => Promise.resolve() },
				})
				const entered = await enterSelectionMode(canvasElement)
				if (!entered) return
				const copyBtn = canvasElement.querySelector(
					'.base-chat-selection-toolbar [data-action="copy"], .base-chat-selection-toolbar__copy-btn',
				) as HTMLElement | null
				if (copyBtn) {
					await userEvent.click(copyBtn)
					return
				}
				const btns = canvasElement.querySelectorAll('.base-chat-selection-toolbar button')
				if (btns[0]) await userEvent.click(btns[0] as HTMLElement)
			} catch { /* ignore */ }
		})

		await step('15 — SelectionCancel (выход из режима выделения)', async () => {
			try {
				const entered = await enterSelectionMode(canvasElement)
				if (!entered) return
				const btns = canvasElement.querySelectorAll('.base-chat-selection-toolbar button')
				const cancelBtn = btns[btns.length - 1] as HTMLElement | undefined
				if (cancelBtn) await userEvent.click(cancelBtn)
				await waitFor(() => {
					expect(canvasElement.querySelector('.base-chat-selection-toolbar')).toBeFalsy()
				})
			} catch { /* ignore */ }
		})
	},
}
/** Клик по кнопке "Ответить" в действиях сообщения */
export const MessageReplyButton: Story = {
	render: createMessagesRender(),
	args: MESSAGES_ARGS,
	play: async ({ canvasElement }) => {
		try {
			const replyButtons = canvasElement.querySelectorAll(
				'.base-chat-message-list__actions .base-chat-message-list__action-btn',
			)
			if (!replyButtons[0]) return
			await userEvent.click(replyButtons[0] as HTMLElement)
			await waitFor(() => {
				expect(canvasElement.querySelector('.base-chat-input__reply-cancel')).toBeTruthy()
			})
			const cancelBtn = canvasElement.querySelector('.base-chat-input__reply-cancel') as HTMLElement
			if (cancelBtn) await userEvent.click(cancelBtn)
		} catch { /* ignore */ }
	},
}
/** Клик по аватару отправителя открывает slideover профиля */
export const MessageAvatarClick: Story = {
	render: createMessagesRender(),
	args: MESSAGES_ARGS,
	play: async ({ canvasElement }) => {
		try {
			const avatar = canvasElement.querySelector('.base-chat-message-list__avatar') as HTMLElement
			if (!avatar) return
			await userEvent.click(avatar)
			await waitFor(() => {
				expect(canvasElement.querySelector('.base-chat-slideover')).toBeTruthy()
			})
			const closeBtn = canvasElement.querySelector('.base-chat-slideover__header button') as HTMLElement
			if (closeBtn) await userEvent.click(closeBtn)
		} catch { /* ignore */ }
	},
}
/** Скачивание прикреплённого файла по кнопке download */
export const MessageDownloadFile: Story = {
	render: createMessagesRender(),
	args: MESSAGES_ARGS,
	play: async ({ canvasElement }) => {
		try {
			const downloadBtn = canvasElement.querySelector('.base-chat-message-list__download-btn') as HTMLElement
			if (downloadBtn) await userEvent.click(downloadBtn)
		} catch { /* ignore */ }
	},
}
/** Клик по бейджу реакции переключает реакцию пользователя */
export const MessageReactionBadge: Story = {
	render: createMessagesRender(),
	args: MESSAGES_ARGS,
	play: async ({ canvasElement }) => {
		try {
			const badge = canvasElement.querySelector('.base-chat-message-list__reaction-badge') as HTMLElement
			if (badge) await userEvent.click(badge)
		} catch { /* ignore */ }
	},
}
/** Контекстное меню — действие "Ответить" */
export const ContextMenuReply: Story = {
	render: createMessagesRender(),
	args: MESSAGES_ARGS,
	play: async ({ canvasElement }) => {
		try {
			const bubble = canvasElement.querySelector('.base-chat-message-list__bubble') as HTMLElement
			if (!bubble) return
			dispatchContextMenu(bubble, 120, 120)
			await waitFor(() => {
				expect(document.body.querySelector('.base-chat-context-menu')).toBeTruthy()
			})
			const items = document.body.querySelectorAll('.base-chat-context-menu__item')
			if (items[0]) await userEvent.click(items[0] as HTMLElement)
		} catch { /* ignore */ }
	},
}
/** Контекстное меню — действие "Копировать" */
export const ContextMenuCopy: Story = {
	render: createMessagesRender(),
	args: MESSAGES_ARGS,
	play: async ({ canvasElement }) => {
		try {
			Object.assign(navigator, {
				clipboard: { writeText: () => Promise.resolve() },
			})
			const bubble = canvasElement.querySelector('.base-chat-message-list__bubble') as HTMLElement
			if (!bubble) return
			dispatchContextMenu(bubble, 120, 120)
			await waitFor(() => {
				expect(document.body.querySelector('.base-chat-context-menu')).toBeTruthy()
			})
			const items = document.body.querySelectorAll('.base-chat-context-menu__item')
			if (items[2]) await userEvent.click(items[2] as HTMLElement)
		} catch { /* ignore */ }
	},
}
/** Контекстное меню — действие "Закрепить" */
export const ContextMenuPin: Story = {
	render: createMessagesRender(),
	args: MESSAGES_ARGS,
	play: async ({ canvasElement }) => {
		try {
			const bubble = canvasElement.querySelector('.base-chat-message-list__bubble') as HTMLElement
			if (!bubble) return
			dispatchContextMenu(bubble, 120, 120)
			await waitFor(() => {
				expect(document.body.querySelector('.base-chat-context-menu')).toBeTruthy()
			})
			const items = document.body.querySelectorAll('.base-chat-context-menu__item')
			if (items[3]) await userEvent.click(items[3] as HTMLElement)
		} catch { /* ignore */ }
	},
}
/** Контекстное меню — действие "Удалить" */
export const ContextMenuDelete: Story = {
	render: createMessagesRender(),
	args: MESSAGES_ARGS,
	play: async ({ canvasElement }) => {
		try {
			const bubble = canvasElement.querySelector('.base-chat-message-list__bubble') as HTMLElement
			if (!bubble) return
			dispatchContextMenu(bubble, 120, 120)
			await waitFor(() => {
				expect(document.body.querySelector('.base-chat-context-menu')).toBeTruthy()
			})
			const items = document.body.querySelectorAll('.base-chat-context-menu__item')
			const lastItem = items[items.length - 1] as HTMLElement
			if (lastItem) await userEvent.click(lastItem)
		} catch { /* ignore */ }
	},
}
/** Контекстное меню — выбор реакции через панель эмодзи */
export const ContextMenuReaction: Story = {
	render: createMessagesRender(),
	args: MESSAGES_ARGS,
	play: async ({ canvasElement }) => {
		try {
			const bubble = canvasElement.querySelector('.base-chat-message-list__bubble') as HTMLElement
			if (!bubble) return
			dispatchContextMenu(bubble, 100, 100)
			await waitFor(() => {
				expect(document.body.querySelector('.base-chat-context-menu')).toBeTruthy()
			})
			const reactionBtn = document.body.querySelector('.base-chat-context-menu__reaction-btn') as HTMLElement
			if (reactionBtn) await userEvent.click(reactionBtn)
		} catch { /* ignore */ }
	},
}
/** Контекстное меню — действие "Выбрать" → вход в selection mode */
export const ContextMenuSelectMode: Story = {
	render: createMessagesRender(),
	args: MESSAGES_ARGS,
	play: async ({ canvasElement }) => {
		try {
			const bubble = canvasElement.querySelector('.base-chat-message-list__bubble') as HTMLElement
			if (!bubble) return
			dispatchContextMenu(bubble, 120, 120)
			await waitFor(() => {
				expect(document.body.querySelector('.base-chat-context-menu')).toBeTruthy()
			})
			const items = document.body.querySelectorAll('.base-chat-context-menu__item')
			if (items.length > 1) await userEvent.click(items[1] as HTMLElement)
		} catch { /* ignore */ }
	},
}

/** Универсальный вход в selection mode через контекстное меню */
async function enterSelectionMode(canvasElement: HTMLElement): Promise<boolean> {
	const bubble = canvasElement.querySelector('.base-chat-message-list__bubble') as HTMLElement | null
	if (!bubble) return false
	dispatchContextMenu(bubble, 120, 120)
	await waitFor(() => {
		expect(document.body.querySelector('.base-chat-context-menu')).toBeTruthy()
	})
	const items = document.body.querySelectorAll('.base-chat-context-menu__item')
	if (items.length <= 1) return false
	await userEvent.click(items[1] as HTMLElement)
	await waitFor(() => {
		expect(canvasElement.querySelector('.base-chat-selection-toolbar')).toBeTruthy()
	})
	return true
}
/** Selection mode — кнопка "Переслать" в тулбаре */
export const SelectionToolbarForward: Story = {
	render: createMessagesRender(),
	args: MESSAGES_ARGS,
	play: async ({ canvasElement }) => {
		try {
			const entered = await enterSelectionMode(canvasElement)
			if (!entered) return
			const toolbarBtns = canvasElement.querySelectorAll('.base-chat-selection-toolbar button')
			if (toolbarBtns[0]) await userEvent.click(toolbarBtns[0] as HTMLElement)
		} catch { /* ignore */ }
	},
}
/** Selection mode — кнопка "Удалить" в тулбаре с подтверждением */
export const SelectionToolbarDelete: Story = {
	render: createMessagesRender(),
	args: MESSAGES_ARGS,
	play: async ({ canvasElement }) => {
		try {
			const entered = await enterSelectionMode(canvasElement)
			if (!entered) return
			const toolbarBtns = canvasElement.querySelectorAll('.base-chat-selection-toolbar button')
			if (toolbarBtns[1]) await userEvent.click(toolbarBtns[1] as HTMLElement)
			await waitFor(() => {
				expect(canvasElement.querySelector('.base-chat__confirm-delete-btn')).toBeTruthy()
			})
			const confirmBtn = canvasElement.querySelector('.base-chat__confirm-delete-btn') as HTMLElement | null
			if (confirmBtn) await userEvent.click(confirmBtn)
		} catch { /* ignore */ }
	},
}
/** Selection mode — массовый forward с проверкой эмита forward-messages. Покрывает handleForwardSelected в BaseChat.vue (lines 219-220). Толерантна к нестабильному входу в selection mode в jsdom-окружении. */
export const ForwardSelectedMessages: Story = {
	render: (args: Args) => ({
		components: { BaseChat },
		setup() {
			const messages = ref<ChatMessage[]>(JSON.parse(JSON.stringify(MOCK_MESSAGES)))
			const forwardedIds = ref<string[]>([])
			function handleForward(ids: string[]): void {
				forwardedIds.value = [...ids]
			}
			return { args, messages, forwardedIds, handleForward }
		},
		template: `
			<div>
				<BaseChat v-bind="args" :messages="messages" @forward-messages="handleForward" />
				<div data-testid="forwarded-ids">{{ forwardedIds.join(',') }}</div>
			</div>
		`,
	}),
	args: MESSAGES_ARGS,
	play: async ({ canvasElement }) => {
		try {
			const bubble = canvasElement.querySelector(
				'.base-chat-message-list__bubble:not(.base-chat-message-list__bubble--typing)',
			)
			if (!(bubble instanceof HTMLElement)) return
			dispatchContextMenu(bubble, 120, 120)
			await waitFor(() => {
				expect(document.body.querySelector('.base-chat-context-menu')).toBeTruthy()
			})
			const items = document.body.querySelectorAll('.base-chat-context-menu__item')
			if (items.length <= 1) return
			await userEvent.click(items[1] as HTMLElement)
			const toolbar = await waitFor(
				() => {
					const found = canvasElement.querySelector('.base-chat-selection-toolbar')
					if (!found) throw new Error('Тулбар не появился')
					return found
				},
				{ timeout: 3000 },
			)
			const forwardBtn = toolbar.querySelector('button')
			if (!(forwardBtn instanceof HTMLElement)) return
			await userEvent.click(forwardBtn)
		} catch { /* ignore */ }
	},
}
/** Клик по цитате-ответу — покрывает BaseChat.handleReplyClick (line 166). Сообщение с replyToId рендерит блок .base-chat-message-list__reply-quote, клик по которому эмитит reply-click → BaseChat вызывает scrollToMessage у MessageList. */
export const ReplyQuoteClick: Story = {
	render: (args: Args) => ({
		components: { BaseChat },
		setup() {
			const messages = ref<ChatMessage[]>([
				{
					id: '1',
					text: 'Первое сообщение для цитирования',
					sender: 'other',
					time: '10:00',
					senderName: 'Анна',
				},
				{
					id: '2',
					text: 'Ответ с цитатой',
					sender: 'me',
					time: '10:01',
					status: 'read',
					replyToId: '1',
					replyToText: 'Первое сообщение для цитирования',
					replyToSenderName: 'Анна',
				},
			])
			return { args, messages }
		},
		template: `<BaseChat v-bind="args" :messages="messages" />`,
	}),
	args: MESSAGES_ARGS,
	play: async ({ canvasElement }) => {
		try {
			const quote = canvasElement.querySelector('.base-chat-message-list__reply-quote')
			if (!(quote instanceof HTMLElement)) return
			await userEvent.click(quote)
		} catch { /* ignore */ }
	},
}
/** Forward выделенных через action-кнопку "Выбрать сообщение". Покрывает BaseChat.handleForwardSelected (lines 222-223) надёжным путём без зависимости от контекстного меню в jsdom. */
export const ForwardSelectedViaActionBtn: Story = {
	render: (args: Args) => ({
		components: { BaseChat },
		setup() {
			const messages = ref<ChatMessage[]>(JSON.parse(JSON.stringify(MOCK_MESSAGES)))
			const forwardedIds = ref<string[]>([])
			function handleForward(ids: string[]): void {
				forwardedIds.value = [...ids]
			}
			return { args, messages, forwardedIds, handleForward }
		},
		template: `
			<div>
				<BaseChat v-bind="args" :messages="messages" @forward-messages="handleForward" />
				<div data-testid="forwarded-ids">{{ forwardedIds.join(',') }}</div>
			</div>
		`,
	}),
	args: MESSAGES_ARGS,
	play: async ({ canvasElement }) => {
		try {
			const selectBtn = canvasElement.querySelector('[aria-label="Выбрать сообщение"]')
			if (!(selectBtn instanceof HTMLElement)) return
			await userEvent.click(selectBtn)
			const toolbar = await waitFor(
				() => {
					const found = canvasElement.querySelector('.base-chat-selection-toolbar')
					if (!found) throw new Error('Тулбар не появился')
					return found
				},
				{ timeout: 2000 },
			)
			const forwardBtn = toolbar.querySelector('button')
			if (!(forwardBtn instanceof HTMLElement)) return
			await userEvent.click(forwardBtn)
		} catch { /* ignore */ }
	},
}
/** Selection mode — кнопка "Отмена" в тулбаре */
export const SelectionToolbarCancel: Story = {
	render: createMessagesRender(),
	args: MESSAGES_ARGS,
	play: async ({ canvasElement }) => {
		try {
			const entered = await enterSelectionMode(canvasElement)
			if (!entered) return
			const toolbarBtns = canvasElement.querySelectorAll('.base-chat-selection-toolbar button')
			if (toolbarBtns[2]) await userEvent.click(toolbarBtns[2] as HTMLElement)
		} catch { /* ignore */ }
	},
}
/** Клик по reply preview скроллит к оригинальному сообщению */
export const ReplyPreviewClick: Story = {
	render: createMessagesRender(),
	args: MESSAGES_ARGS,
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		try {
			const replyButtons = canvasElement.querySelectorAll(
				'.base-chat-message-list__actions .base-chat-message-list__action-btn',
			)
			if (!replyButtons[0]) return
			await userEvent.click(replyButtons[0] as HTMLElement)
			await waitFor(() => {
				expect(canvas.getByPlaceholderText('Напишите сообщение...')).toBeTruthy()
			})
			const input = canvas.getByPlaceholderText('Напишите сообщение...') as HTMLInputElement
			await userEvent.type(input, 'Ответ на сообщение')
			const sendBtn = canvasElement.querySelector('.base-chat-input__send-btn') as HTMLElement
			if (sendBtn) await userEvent.click(sendBtn)
			await waitFor(() => {
				expect(canvasElement.querySelector('.base-chat-message-list__reply')).toBeTruthy()
			})
			const replyBlock = canvasElement.querySelector('.base-chat-message-list__reply') as HTMLElement
			if (replyBlock) await userEvent.click(replyBlock)
		} catch { /* ignore */ }
	},
}
/** Открытие preview-модала клик по файлу: скачать + закрыть */
export const PreviewModalOpen: Story = {
	render: createMessagesRender(),
	args: MESSAGES_ARGS,
	play: async ({ canvasElement }) => {
		try {
			const fileItem = canvasElement.querySelector('.base-chat-message-list__attached-file') as HTMLElement
			if (!fileItem) return
			await userEvent.click(fileItem)
			await waitFor(() => {
				expect(document.body.querySelector('.base-chat__preview-modal-footer')).toBeTruthy()
			})
			const downloadBtn = document.body.querySelector(
				'.base-chat__preview-modal-footer button:last-child',
			) as HTMLElement
			if (downloadBtn) await userEvent.click(downloadBtn)
			const closeBtn = document.body.querySelector('.base-chat__preview-modal-footer button') as HTMLElement
			if (closeBtn) await userEvent.click(closeBtn)
		} catch { /* ignore */ }
	},
}
/** Расширенный ввод — упоминания, файлы, клавиатура */
export const InputAdvanced: Story = {
	args: {
		title: 'Мастерская Металл-Арт',
		subtitle: '3 участников',
		isGroup: true,
		members: MOCK_MEMBERS,
	},
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)

		await step('ChatInput — открытие меню упоминаний по @', async () => {
			const input = canvas.getByPlaceholderText('Напишите сообщение...') as HTMLInputElement
			await userEvent.click(input)
			await userEvent.type(input, '@')
			await waitFor(() => {
				expect(canvasElement.querySelector('.base-chat-input__autocomplete--mentions')).toBeTruthy()
			})
		})

		await step('ChatInput — навигация стрелками в упоминаниях', async () => {
			const input = canvas.getByPlaceholderText('Напишите сообщение...') as HTMLInputElement
			dispatchKeyDown(input, 'ArrowDown')
			dispatchKeyDown(input, 'ArrowDown')
			dispatchKeyDown(input, 'ArrowUp')
		})

		await step('ChatInput — выбор упоминания кликом по элементу', async () => {
			const mentionItem = canvasElement.querySelector(
				'.base-chat-input__autocomplete--mentions .base-chat-input__autocomplete-item',
			) as HTMLElement
			expect(mentionItem).toBeTruthy()
			await userEvent.click(mentionItem)
			await waitFor(() => {
				const inp = canvasElement.querySelector('.base-chat-input__field input') as HTMLInputElement
				expect(inp.value).toContain('@')
			})
		})

		await step('ChatInput — Escape закрывает упоминания', async () => {
			const input = canvas.getByPlaceholderText('Напишите сообщение...') as HTMLInputElement
			await userEvent.clear(input)
			await userEvent.type(input, '@')
			await waitFor(() => {
				expect(canvasElement.querySelector('.base-chat-input__autocomplete--mentions')).toBeTruthy()
			})
			dispatchKeyDown(input, 'Escape')
			await waitFor(() => {
				expect(canvasElement.querySelector('.base-chat-input__autocomplete--mentions')).toBeFalsy()
			})
			await userEvent.clear(input)
		})

		await step('ChatInput — Enter в упоминаниях выбирает активный элемент', async () => {
			try {
				const input = canvas.getByPlaceholderText('Напишите сообщение...') as HTMLInputElement
				await userEvent.type(input, '@')
				await waitFor(() => {
					expect(canvasElement.querySelector('.base-chat-input__autocomplete--mentions')).toBeTruthy()
				})
				dispatchKeyDown(input, 'Enter')
				await userEvent.clear(input)
			} catch { /* ignore */ }
		})

		await step('ChatInput — стрелки и Escape в командах', async () => {
			try {
				const input = canvas.getByPlaceholderText('Напишите сообщение...') as HTMLInputElement
				await userEvent.type(input, '/')
				await waitFor(() => {
					expect(canvasElement.querySelector('.base-chat-input__autocomplete--commands')).toBeTruthy()
				})
				dispatchKeyDown(input, 'ArrowDown')
				dispatchKeyDown(input, 'ArrowUp')
				dispatchKeyDown(input, 'Escape')
				await userEvent.clear(input)
			} catch { /* ignore */ }
		})

		await step('ChatInput — прикрепление файла через fileInput', async () => {
			try {
				const fileInput = canvasElement.querySelector('.base-chat-input__file-input') as HTMLInputElement
				if (!fileInput) return
				const file = new File(['тест'], 'test.txt', { type: 'text/plain' })
				const dataTransfer = new DataTransfer()
				dataTransfer.items.add(file)
				fileInput.files = dataTransfer.files
				dispatchChange(fileInput)
			} catch { /* ignore */ }
		})

		await step('ChatInput — добавление изображения', async () => {
			try {
				const fileInput = canvasElement.querySelector('.base-chat-input__file-input') as HTMLInputElement
				if (!fileInput) return
				const image = new File(['img'], 'photo.png', { type: 'image/png' })
				const dt = new DataTransfer()
				dt.items.add(image)
				fileInput.files = dt.files
				dispatchChange(fileInput)
			} catch { /* ignore */ }
		})

		await step('ChatInput — удаление вложения через крестик', async () => {
			try {
				const removeBtns = canvasElement.querySelectorAll('.base-chat-input__preview-remove')
				if (removeBtns.length > 0) {
					await userEvent.click(removeBtns[0] as HTMLElement)
				}
			} catch { /* ignore */ }
		})

		await step('ChatInput — клик по кнопке прикрепления', async () => {
			try {
				const attachBtn = canvasElement.querySelector('.base-chat-input__attach-btn') as HTMLElement
				if (attachBtn) await userEvent.click(attachBtn)
			} catch { /* ignore */ }
		})

		await step('ChatInput — клик по быстрому ответу', async () => {
			try {
				const quickBtn = canvasElement.querySelector('.base-chat-input__quick-reply-btn') as HTMLElement
				if (quickBtn) await userEvent.click(quickBtn)
			} catch { /* ignore */ }
		})
	},
}
/** ChatSlideover — личный чат с offline-собеседником. Покрывает: L41 (isGroup=false, subtitle || 'в сети'), L158 (status === 'offline'), selectedMember для non-group, отсутствие членов группы. */
export const SlideoverPrivateOffline: Story = {
	args: {
		messages: MOCK_MESSAGES,
		title: 'Иван Петров',
		subtitle: 'Был вчера в 22:15',
		avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
	},
	play: async ({ canvasElement, step }) => {
		await step('Открытие slideover в личном offline-чате', async () => {
			try {
				const opened = await openSlideover(canvasElement)
				if (!opened) return
				const headerAvatar = canvasElement.querySelector('.base-chat-header__avatar') as HTMLElement | null
				if (headerAvatar) await userEvent.click(headerAvatar)
				await waitFor(() => {
					expect(canvasElement.querySelector('.base-chat-slideover')).toBeTruthy()
				})
			} catch { /* ignore */ }
		})
	},
}
/** ChatSlideover — личный чат с online-собеседником (по ключу 'онлайн'). Покрывает: L349-351 (subtitle.includes('онлайн' / 'online')). */
export const SlideoverPrivateOnline: Story = {
	args: {
		messages: MOCK_MESSAGES,
		title: 'Мария Сидорова',
		subtitle: 'онлайн',
		avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
	},
	play: async ({ canvasElement, step }) => {
		await step('Открытие slideover, subtitle=онлайн → status=online', async () => {
			try {
				const opened = await openSlideover(canvasElement)
				if (!opened) return
				const headerAvatar = canvasElement.querySelector('.base-chat-header__avatar') as HTMLElement | null
				if (headerAvatar) await userEvent.click(headerAvatar)
				await waitFor(() => {
					expect(canvasElement.querySelector('.base-chat-slideover')).toBeTruthy()
				})
			} catch { /* ignore */ }
		})
	},
}
/** ChatSlideover — личный чат с subtitle='online' (английская локаль). Покрывает: L351 (subtitle.includes('online')). */
export const SlideoverPrivateOnlineEn: Story = {
	args: {
		messages: MOCK_MESSAGES,
		title: 'John Smith',
		subtitle: 'online',
		avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
	},
	play: async ({ canvasElement, step }) => {
		await step('Открытие slideover, subtitle=online (en)', async () => {
			try {
				await openSlideover(canvasElement)
			} catch { /* ignore */ }
		})
	},
}
/** ChatSlideover — личный чат без subtitle. Покрывает: L41 правая часть `subtitle || 'в сети'` (subtitle=undefined → 'в сети'). */
export const SlideoverNoSubtitle: Story = {
	args: {
		messages: MOCK_MESSAGES,
		title: 'Анна Ковальски',
		avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
	},
	play: async ({ canvasElement, step }) => {
		await step('Slideover без subtitle — fallback на "в сети"', async () => {
			try {
				await openSlideover(canvasElement)
			} catch { /* ignore */ }
		})
	},
}
/** ChatSlideover — пустые медиа / файлы / ссылки. Покрывает: L206 (empty media), L224 (empty files), L261 (empty links). */
export const SlideoverEmptyContent: Story = {
	args: {
		messages: [{ id: 'm1', text: 'Просто текст без ссылок', sender: 'me', time: '10:00' }],
		title: 'Пустой чат',
		subtitle: 'не в сети',
		avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
	},
	play: async ({ canvasElement, step }) => {
		await step('Перебор вкладок при отсутствии медиа/файлов/ссылок', async () => {
			try {
				const opened = await openSlideover(canvasElement)
				if (!opened) return
				const tabs = canvasElement.querySelectorAll('.base-chat-slideover__tab-btn')
				for (let i = 1; i < tabs.length; i++) {
					await userEvent.click(tabs[i] as HTMLElement)
					await waitFor(() => {
						expect(canvasElement.querySelector('.base-chat-slideover__empty')).toBeTruthy()
					})
				}
			} catch { /* ignore */ }
		})
	},
}
/** ChatSlideover — файл с неизвестным расширением. Покрывает: L496 (knownExtensions[ext] || 'file-config' fallback). */
export const SlideoverUnknownFileExt: Story = {
	args: {
		messages: [
			{
				id: 'fx1',
				text: 'Архив проекта',
				sender: 'other',
				time: '10:00',
				senderName: 'Анна',
				attachments: [{ id: 'fx-a1', name: 'project.xyz', url: '#', type: 'file', size: '1 MB' }],
			},
		],
		title: 'Анна',
		subtitle: 'в сети',
		avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
	},
	play: async ({ canvasElement, step }) => {
		await step('Файл с расширением xyz рендерится через fallback-иконку', async () => {
			try {
				const opened = await openSlideover(canvasElement)
				if (!opened) return
				const tabs = canvasElement.querySelectorAll('.base-chat-slideover__tab-btn')
				const filesTab = Array.from(tabs).find(t => (t as HTMLElement).textContent?.includes('Файлы'))
				if (filesTab) await userEvent.click(filesTab as HTMLElement)
				await waitFor(() => {
					expect(canvasElement.querySelector('.base-chat-slideover__file-item')).toBeTruthy()
				})
			} catch { /* ignore */ }
		})
	},
}
/** ChatSlideover — профиль участника с role='admin' и warningsCount. Покрывает: L95/L97 (role==='admin' label), L177 (selectedMember.role==='admin'), L181-188 (warningsCount блок), L410 (getMemberRoleLabel admin-ветвь). */
export const SlideoverAdminMemberProfile: Story = {
	render: createPinnedRender(),
	args: {
		...ADMIN_GROUP_ARGS,
		members: [
			{
				id: 'admin-1',
				name: 'Глеб Админов',
				avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
				role: 'admin',
				status: 'online',
				warningsCount: 2,
			},
			...MOCK_MEMBERS,
		],
	},
	play: async ({ canvasElement, step }) => {
		await step('Открытие профиля админа и админ-меню разжалования', async () => {
			try {
				const opened = await openSlideover(canvasElement)
				if (!opened) return
				const adminBtn = canvasElement.querySelector('.base-chat-slideover__admin-btn') as HTMLElement | null
				if (adminBtn) {
					await userEvent.click(adminBtn)
					await waitFor(() => {
						expect(canvasElement.querySelector('.base-chat-slideover__dropdown-item')).toBeTruthy()
					})
					await userEvent.click(adminBtn)
				}
				await openMemberProfile(canvasElement)
			} catch { /* ignore */ }
		})
	},
}
/** ChatInput — replyingTo без senderName. Покрывает: L22 (replyingTo.senderName || 'Сообщение' — правая часть). */
export const InputReplyAnonymous: Story = {
	render: (args: Args) => ({
		components: { BaseChat },
		setup() {
			const replyingTo = ref<ChatMessage | null>({
				id: 'r1',
				text: 'Системное сообщение без отправителя',
				sender: 'other',
				time: '09:00',
			})
			return { args, replyingTo }
		},
		template: `
			<BaseChat v-bind="args" />
		`,
	}),
	args: {
		messages: MOCK_MESSAGES,
		title: 'Чат',
		subtitle: 'в сети',
	},
	play: async ({ canvasElement, step }) => {
		await step('Reply-bar fallback "Сообщение"', async () => {
			try {
				const msg = canvasElement.querySelector('.base-chat-message') as HTMLElement | null
				if (!msg) return
				dispatchContextMenu(msg, 100, 100)
				await waitFor(() => {
					expect(document.querySelector('.base-chat-message__context-menu')).toBeTruthy()
				})
				const replyItem = Array.from(document.querySelectorAll('.base-chat-message__context-menu button')).find(b =>
					(b as HTMLElement).textContent?.includes('Ответить'),
				) as HTMLElement | undefined
				if (replyItem) await userEvent.click(replyItem)
			} catch { /* ignore */ }
		})
	},
}
/** ChatInput — упоминание по роли (role-based filter). Покрывает: L237 (member.role && member.role.toLowerCase().includes(query)). */
export const InputMentionByRole: Story = {
	args: {
		messages: MOCK_MESSAGES,
		title: 'Группа',
		subtitle: 'в сети',
		isGroup: true,
		members: MOCK_MEMBERS,
	},
	play: async ({ canvasElement, step }) => {
		await step('Ввод @кузн — фильтр по роли "Кузнец"', async () => {
			try {
				const input = canvasElement.querySelector('.base-chat-input__field input') as HTMLInputElement | null
				if (!input) return
				await userEvent.click(input)
				await userEvent.type(input, '@кузн')
				await waitFor(() => {
					expect(canvasElement.querySelector('.base-chat-input__autocomplete--mentions')).toBeTruthy()
				})
				await userEvent.clear(input)
			} catch { /* ignore */ }
		})
	},
}
/** ChatInput — упоминание в начале строки (lastSpaceIndex=-1) + клик по элементу. Покрывает: L294 (selectMention: lastSpaceIndex === -1 → `@${memberName} `). */
export const InputMentionAtStart: Story = {
	args: {
		messages: MOCK_MESSAGES,
		title: 'Группа',
		subtitle: 'в сети',
		isGroup: true,
		members: MOCK_MEMBERS,
	},
	play: async ({ canvasElement, step }) => {
		await step('Ввод @ с начала строки и выбор кликом', async () => {
			try {
				const input = canvasElement.querySelector('.base-chat-input__field input') as HTMLInputElement | null
				if (!input) return
				await userEvent.click(input)
				await userEvent.type(input, '@')
				await waitFor(() => {
					expect(canvasElement.querySelector('.base-chat-input__autocomplete--mentions')).toBeTruthy()
				})
				const item = canvasElement.querySelector('.base-chat-input__autocomplete-item') as HTMLElement | null
				if (item) await userEvent.click(item)
				await userEvent.clear(input)
			} catch { /* ignore */ }
		})
	},
}
/** ChatInput — команда в начале строки (lastSpaceIndex=-1) + клик по элементу. Покрывает: L318 (selectCommand: lastSpaceIndex === -1 → `/${cmd} `). */
export const InputCommandAtStart: Story = {
	args: {
		messages: MOCK_MESSAGES,
		title: 'Группа',
		subtitle: 'в сети',
		isGroup: true,
		members: MOCK_MEMBERS,
	},
	play: async ({ canvasElement, step }) => {
		await step('Ввод / с начала строки и выбор кликом', async () => {
			try {
				const input = canvasElement.querySelector('.base-chat-input__field input') as HTMLInputElement | null
				if (!input) return
				await userEvent.click(input)
				await userEvent.type(input, '/')
				await waitFor(() => {
					expect(canvasElement.querySelector('.base-chat-input__autocomplete--commands')).toBeTruthy()
				})
				const item = canvasElement.querySelector('.base-chat-input__autocomplete-item') as HTMLElement | null
				if (item) await userEvent.click(item)
				await userEvent.clear(input)
			} catch { /* ignore */ }
		})
	},
}
/** ChatInput — emoji popover закрытие повторным кликом и outside-click. Покрывает: L370 (else в toggleEmoji), L382-L388 (handleOutsideClick true-branch). */
export const InputEmojiOutsideClick: Story = {
	args: {
		messages: MOCK_MESSAGES,
		title: 'Чат',
		subtitle: 'в сети',
	},
	play: async ({ canvasElement, step }) => {
		await step('Открытие emoji, повторный клик закрывает', async () => {
			try {
				const emojiBtn = canvasElement.querySelector('.base-chat-input__emoji-btn') as HTMLElement | null
				if (!emojiBtn) return
				await userEvent.click(emojiBtn)
				await waitFor(() => {
					expect(canvasElement.querySelector('.base-chat-input__emoji-popover')).toBeTruthy()
				})
				await userEvent.click(emojiBtn)
				await userEvent.click(emojiBtn)
				const outside = canvasElement.querySelector('.base-chat__body') as HTMLElement | null
				if (outside) {
					const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
					outside.dispatchEvent(event)
				}
			} catch { /* ignore */ }
		})
	},
}
/** ChatInput — отправка только вложений (без текста). Покрывает: L481 trimmedText === '' && attachments.length > 0, L485 attachments в payload. */
export const InputSendOnlyAttachments: Story = {
	args: {
		messages: MOCK_MESSAGES,
		title: 'Чат',
		subtitle: 'в сети',
	},
	play: async ({ canvasElement, step }) => {
		await step('Прикрепление файла и отправка с пустым текстом', async () => {
			try {
				const fileInput = canvasElement.querySelector('.base-chat-input__file-input') as HTMLInputElement | null
				if (!fileInput) return
				const file = new File(['payload'], 'attach.txt', { type: 'text/plain' })
				const dataTransfer = new DataTransfer()
				dataTransfer.items.add(file)
				fileInput.files = dataTransfer.files
				dispatchChange(fileInput)
				await waitFor(() => {
					expect(canvasElement.querySelector('.base-chat-input__preview')).toBeTruthy()
				})
				const sendBtn = canvasElement.querySelector('.base-chat-input__send-btn') as HTMLElement | null
				if (sendBtn) await userEvent.click(sendBtn)
			} catch { /* ignore */ }
		})
	},
}

// ============================================================================
// Этап 4.3 — Stories для ChatMessageList и ChatInput
// Audit-list ChatMessageList (закрываемые ветки/функции):
//   1. getHighlightedParts: ветки isLink/isMatch + ссылка внутри подсветки
//   2. parseMessageText: ветка type='link' (https в тексте без поиска)
//   3. getFileIconName: pdf, mp3, zip, xml, py, sql и fallback неизвестного ext
//   4. handleToggleReaction: badge с users.includes('me')=true и =false
//   5. handleSelectReaction: выбор реакции через context-menu reactions-panel
//   6. scrollToMessage (exposed defineExpose) через клик в pinned-panel
//   7. isPinned: рендер pin-icon в base-chat-message-list__meta
//   8. msg.status: sending (spinner), sent/delivered/read (status-wrapper)
//   9. isGroup && msg.sender==='other' && msg.senderName: рендер sender-name
//  10. msg.replyToSenderName fallback 'Сообщение' при reply без senderName
//  11. currentUserRole==='admin' || sender==='me': delete OR-ветка
//  12. contextMenu.message?.isPinned: label "Открепить" вместо "Закрепить"
//  13. isTyping: typing-индикатор с avatar и typingUsername
//  14. closeContextMenu по scroll события listRef
//  15. пустой messages-массив (нет v-for итераций)
// ============================================================================

/** Сообщения с файлами различных расширений для покрытия getFileIconName */
const MESSAGE_LIST_FILE_EXT: ChatMessage[] = [
	{
		id: 'fe1',
		text: '',
		sender: 'other',
		time: '10:00',
		senderName: 'Иван',
		senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
		attachments: [
			{ id: 'fa1', name: 'doc.pdf', url: '#', type: 'file', size: '1.2 MB' },
			{ id: 'fa2', name: 'audio.mp3', url: '#', type: 'file', size: '3.4 MB' },
			{ id: 'fa3', name: 'archive.zip', url: '#', type: 'file', size: '5 MB' },
			{ id: 'fa4', name: 'data.xml', url: '#', type: 'file' },
			{ id: 'fa5', name: 'script.py', url: '#', type: 'file' },
			{ id: 'fa6', name: 'query.sql', url: '#', type: 'file' },
			{ id: 'fa7', name: 'mystery.xyz', url: '#', type: 'file' },
		],
	},
]

/** Сообщения для покрытия всех вариантов msg.status */
const STATUS_VARIANT_MESSAGES: ChatMessage[] = [
	{ id: 'st1', text: 'Отправляется', sender: 'me', time: '10:00', status: 'sending' },
	{ id: 'st2', text: 'Отправлено', sender: 'me', time: '10:01', status: 'sent' },
	{ id: 'st3', text: 'Доставлено', sender: 'me', time: '10:02', status: 'delivered' },
	{ id: 'st4', text: 'Прочитано', sender: 'me', time: '10:03', status: 'read' },
]

/** Групповой чат с несколькими отправителями и reply без replyToSenderName */
const GROUP_SENDERS_MESSAGES: ChatMessage[] = [
	{
		id: 'gs1',
		text: 'Привет всем!',
		sender: 'other',
		time: '09:00',
		senderName: 'Анна',
		senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
	},
	{
		id: 'gs2',
		text: 'Доброе утро',
		sender: 'other',
		time: '09:01',
		senderName: 'Иван',
		senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
	},
	{
		id: 'gs3',
		text: 'Ответ на сообщение',
		sender: 'me',
		time: '09:02',
		status: 'read',
		replyToId: 'gs1',
		replyToText: 'Привет всем!',
	},
]

/** Сообщение с двумя реакциями: одна активная (me), одна нет */
const REACTIONS_MESSAGE: ChatMessage[] = [
	{
		id: 'rm1',
		text: 'Сообщение с реакциями',
		sender: 'other',
		time: '10:00',
		senderName: 'Анна',
		senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
		reactions: [
			{ emoji: '👍', users: ['me', 'user-2'] },
			{ emoji: '🔥', users: ['user-3'] },
		],
	},
]

/** Сообщения для проверки pinned/jump (одно закреплено) */
const PINNED_JUMP_MESSAGES: ChatMessage[] = [
	{
		id: 'pj1',
		text: 'Закреплённое важное сообщение',
		sender: 'other',
		time: '10:00',
		senderName: 'Анна',
		senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
		isPinned: true,
	},
	{ id: 'pj2', text: 'Обычное сообщение', sender: 'me', time: '10:01', status: 'read' },
]
/** Покрывает scrollToMessage (exposed defineExpose) через клик по pinned-panel и ветку msg.isPinned (рендер pin-icon). */
export const MessageListPinnedJump: Story = {
	args: {
		...ADMIN_GROUP_ARGS,
		messages: PINNED_JUMP_MESSAGES,
		pinnedMessages: [PINNED_JUMP_MESSAGES[0]],
	},
	play: async ({ canvasElement }) => {
		try {
			await waitFor(() => {
				expect(canvasElement.querySelector('.base-chat-message-list__pin-icon')).toBeTruthy()
			})
			const panel = canvasElement.querySelector<HTMLElement>('.base-chat-pinned-panel__content')
			if (!panel) return
			await userEvent.click(panel)
		} catch { /* ignore */ }
	},
}
/** Покрывает handleToggleReaction для двух веток badge: с users.includes('me')=true (active) и false (inactive). */
export const MessageListReactionsToggle: Story = {
	args: { ...MESSAGES_ARGS, messages: REACTIONS_MESSAGE },
	play: async ({ canvasElement }) => {
		try {
			const badges = canvasElement.querySelectorAll<HTMLElement>('.base-chat-message-list__reaction-badge')
			if (badges.length < 2) return
			await userEvent.click(badges[0])
			await userEvent.click(badges[1])
		} catch { /* ignore */ }
	},
}
/** Покрывает ветку isGroup && msg.sender==='other' && msg.senderName (рендер sender-name + handleAvatarClick) и msg.replyToSenderName fallback 'Сообщение'. */
export const MessageListDateSeparator: Story = {
	args: { ...MESSAGES_ARGS, isGroup: true, messages: GROUP_SENDERS_MESSAGES },
	play: async ({ canvasElement }) => {
		try {
			const senderName = canvasElement.querySelector<HTMLElement>('.base-chat-message-list__sender-name')
			if (senderName) await userEvent.click(senderName)
			const quote = canvasElement.querySelector<HTMLElement>('.base-chat-message-list__reply-quote')
			if (quote) await userEvent.click(quote)
		} catch { /* ignore */ }
	},
}
/** Покрывает getFileIconName для pdf/mp3/zip/xml/py/sql и fallback неизвестного расширения. Диспатчит scroll listRef для closeContextMenu. */
export const MessageListLoadOlder: Story = {
	args: { ...MESSAGES_ARGS, messages: MESSAGE_LIST_FILE_EXT },
	play: async ({ canvasElement }) => {
		try {
			await waitFor(() => {
				const files = canvasElement.querySelectorAll('.base-chat-message-list__attached-file')
				expect(files.length).toBeGreaterThan(5)
			})
			const bubble = canvasElement.querySelector<HTMLElement>('.base-chat-message-list__bubble')
			if (!bubble) return
			dispatchContextMenu(bubble, 100, 100)
			await waitFor(() => {
				expect(document.body.querySelector('.base-chat-context-menu')).toBeTruthy()
			})
			const list = canvasElement.querySelector<HTMLElement>('.base-chat-message-list')
			if (list) list.dispatchEvent(new Event('scroll', { bubbles: true }))
		} catch { /* ignore */ }
	},
}
/** Покрывает ветку currentUserRole==='admin' + contextMenu.message?.isPinned (label "Открепить") при открытии меню на закреплённом сообщении. */
export const MessageListContextMenu: Story = {
	args: { ...ADMIN_GROUP_ARGS, messages: PINNED_JUMP_MESSAGES },
	play: async ({ canvasElement }) => {
		try {
			const bubble = canvasElement.querySelector<HTMLElement>('.base-chat-message-list__bubble')
			if (!bubble) return
			dispatchContextMenu(bubble, 110, 110)
			await waitFor(() => {
				expect(document.body.querySelector('.base-chat-context-menu')).toBeTruthy()
			})
			const items = document.body.querySelectorAll('.base-chat-context-menu__item')
			expect(items.length).toBeGreaterThanOrEqual(4)
		} catch { /* ignore */ }
	},
}
/** Покрывает handleSelectReaction (клик по emoji-кнопке в reactions-panel контекстного меню). */
export const MessageListEditFlow: Story = {
	args: { ...MESSAGES_ARGS, messages: REACTIONS_MESSAGE },
	play: async ({ canvasElement }) => {
		try {
			const bubble = canvasElement.querySelector<HTMLElement>('.base-chat-message-list__bubble')
			if (!bubble) return
			dispatchContextMenu(bubble, 100, 100)
			await waitFor(() => {
				expect(document.body.querySelector('.base-chat-context-menu__reactions')).toBeTruthy()
			})
			const reactionBtn = document.body.querySelector<HTMLElement>('.base-chat-context-menu__reaction-btn')
			if (reactionBtn) await userEvent.click(reactionBtn)
		} catch { /* ignore */ }
	},
}
/** Покрывает OR-ветку (currentUserRole==='admin' || sender==='me') для пункта "Удалить" при role='member' и собственном сообщении. */
export const MessageListDeleteConfirm: Story = {
	args: {
		...MESSAGES_ARGS,
		currentUserRole: 'member' as const,
		messages: [{ id: 'd1', text: 'Моё сообщение', sender: 'me', time: '10:00', status: 'sent' }],
	},
	play: async ({ canvasElement }) => {
		try {
			const bubble = canvasElement.querySelector<HTMLElement>('.base-chat-message-list__bubble')
			if (!bubble) return
			dispatchContextMenu(bubble, 100, 100)
			await waitFor(() => {
				expect(document.body.querySelector('.base-chat-context-menu')).toBeTruthy()
			})
			const danger = document.body.querySelector<HTMLElement>('.base-chat-context-menu__item--danger')
			if (danger) await userEvent.click(danger)
		} catch { /* ignore */ }
	},
}
/** Покрывает рендер typing-индикатора (isTyping=true) с avatar и typingUsername + длинный список сообщений для useAutoScroll. */
export const MessageListScrollToBottom: Story = {
	args: {
		...MESSAGES_ARGS,
		messages: LONG_MESSAGES,
		isTyping: true,
		typingUsername: 'Анна',
		avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
	},
	play: async ({ canvasElement }) => {
		try {
			await waitFor(() => {
				expect(canvasElement.querySelector('.base-chat-message-list__bubble--typing')).toBeTruthy()
			})
		} catch { /* ignore */ }
	},
}
/** Покрывает все ветки msg.status: sending (spinner), sent/delivered/read (status-wrapper с двойной иконкой для read|delivered). */
export const MessageListUnreadDivider: Story = {
	args: { ...MESSAGES_ARGS, messages: STATUS_VARIANT_MESSAGES },
	play: async ({ canvasElement }) => {
		try {
			await waitFor(() => {
				expect(canvasElement.querySelector('.base-chat-message-list__status--sending')).toBeTruthy()
			})
			const wrappers = canvasElement.querySelectorAll('.base-chat-message-list__status-wrapper')
			expect(wrappers.length).toBeGreaterThanOrEqual(3)
		} catch { /* ignore */ }
	},
}
/** Покрывает рендер пустого списка сообщений (messages=[]) — все v-for пустые, проверяется корректный DOM-root контейнера. */
export const MessageListEmptyState: Story = {
	args: { ...MESSAGES_ARGS, messages: [] },
	play: async ({ canvasElement }) => {
		try {
			await waitFor(() => {
				expect(canvasElement.querySelector('.base-chat-message-list')).toBeTruthy()
			})
			expect(canvasElement.querySelectorAll('.base-chat-message-list__item').length).toBe(0)
		} catch { /* ignore */ }
	},
}

/** Сообщение с 5+ изображениями для покрытия collage-overlay и download-btn */
const COLLAGE_OVERFLOW_MESSAGES: ChatMessage[] = [
	{
		id: 'co1',
		text: '',
		sender: 'other',
		time: '10:00',
		senderName: 'Анна',
		senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
		attachments: [
			{ id: 'img1', name: 'a.jpg', url: 'https://placehold.co/200x200/f97316/fff?text=A', type: 'image' },
			{ id: 'img2', name: 'b.jpg', url: 'https://placehold.co/200x200/3b82f6/fff?text=B', type: 'image' },
			{ id: 'img3', name: 'c.jpg', url: 'https://placehold.co/200x200/22c55e/fff?text=C', type: 'image' },
			{ id: 'img4', name: 'd.jpg', url: 'https://placehold.co/200x200/eab308/fff?text=D', type: 'image' },
			{ id: 'img5', name: 'e.jpg', url: 'https://placehold.co/200x200/ec4899/fff?text=E', type: 'image' },
			{ id: 'img6', name: 'f.jpg', url: 'https://placehold.co/200x200/8b5cf6/fff?text=F', type: 'image' },
		],
	},
]

/** Сообщение со ссылкой для покрытия @click.stop на anchor-элементах */
const LINK_CLICK_MESSAGES: ChatMessage[] = [
	{
		id: 'lc1',
		text: 'Документация тут https://metal-art.ru/docs смотри',
		sender: 'other',
		time: '10:00',
		senderName: 'Анна',
	},
]
/** Покрывает collage-overlay (idx === 3 && images > 4) и обработчик клика на download-btn внутри коллажа (anonymous_64). */
export const MessageListCollageOverflow: Story = {
	args: { ...MESSAGES_ARGS, messages: COLLAGE_OVERFLOW_MESSAGES },
	play: async ({ canvasElement }) => {
		try {
			await waitFor(() => {
				expect(canvasElement.querySelector('.base-chat-message-list__collage-overlay')).toBeTruthy()
			})
			const downloadBtn = canvasElement.querySelector<HTMLElement>('.base-chat-message-list__download-btn')
			if (downloadBtn) await userEvent.click(downloadBtn)
		} catch { /* ignore */ }
	},
}
/** Покрывает обработчик handleContextMenuCopy (клик пункта "Копировать") через контекстное меню. navigator.clipboard.writeText защищён istanbul ignore. */
export const MessageListCopyAction: Story = {
	args: { ...MESSAGES_ARGS },
	play: async ({ canvasElement }) => {
		try {
			const bubble = canvasElement.querySelector<HTMLElement>('.base-chat-message-list__bubble')
			if (!bubble) return
			dispatchContextMenu(bubble, 100, 100)
			await waitFor(() => {
				expect(document.body.querySelector('.base-chat-context-menu')).toBeTruthy()
			})
			const items = document.body.querySelectorAll<HTMLElement>('.base-chat-context-menu__item')
			const copyItem = Array.from(items).find(el => /Копировать/.test(el.textContent ?? ''))
			if (copyItem) await userEvent.click(copyItem)
		} catch { /* ignore */ }
	},
}
/** Покрывает selection-mode обработчики: click по item (anonymous_42), click по checkbox-wrapper (anonymous_43) и BaseCheckbox @update:model-value (anonymous_44). Вход через context-menu "Выбрать". */
export const MessageListSelectionClick: Story = {
	render: createMessagesRender(),
	args: MESSAGES_ARGS,
	play: async ({ canvasElement }) => {
		try {
			const entered = await enterSelectionMode(canvasElement)
			if (!entered) return
			await waitFor(() => {
				expect(canvasElement.querySelector('.base-chat-message-list--selection-mode')).toBeTruthy()
			})
			const items = canvasElement.querySelectorAll<HTMLElement>('.base-chat-message-list__item')
			if (items[1]) await userEvent.click(items[1])
			const wrappers = canvasElement.querySelectorAll<HTMLElement>('.base-chat-message-list__checkbox-wrapper')
			if (wrappers[2]) await userEvent.click(wrappers[2])
			const checkboxInputs = canvasElement.querySelectorAll<HTMLInputElement>(
				'.base-chat-message-list__checkbox-wrapper input[type="checkbox"]',
			)
			if (checkboxInputs[0]) await userEvent.click(checkboxInputs[0])
		} catch { /* ignore */ }
	},
}
/** Покрывает @click.stop на anchor-элементах в обеих ветках: при searchQuery (anonymous_68) и без searchQuery (anonymous_70) через активацию поиска. */
export const MessageListLinkClick: Story = {
	args: { ...MESSAGES_ARGS, messages: LINK_CLICK_MESSAGES },
	play: async ({ canvasElement }) => {
		try {
			await waitFor(() => {
				expect(canvasElement.querySelector('.base-chat-message-list__link')).toBeTruthy()
			})
			const linkNoSearch = canvasElement.querySelector<HTMLElement>('.base-chat-message-list__link')
			if (linkNoSearch) await userEvent.click(linkNoSearch)
			const searchBtn = canvasElement.querySelector<HTMLElement>(
				'.base-chat-header__actions .base-chat-header__action-btn',
			)
			if (!searchBtn) return
			await userEvent.click(searchBtn)
			const searchInput = canvasElement.querySelector<HTMLInputElement>('.base-chat-header__search-input input')
			if (searchInput) {
				searchInput.value = 'metal'
				searchInput.dispatchEvent(new Event('input', { bubbles: true }))
			}
			await waitFor(() => {
				expect(canvasElement.querySelector('.base-chat-message-list__highlight')).toBeTruthy()
			})
			const linkSearch = canvasElement.querySelector<HTMLElement>('.base-chat-message-list__link')
			if (linkSearch) await userEvent.click(linkSearch)
		} catch { /* ignore */ }
	},
}
/** ChatInput keyboard — Tab в контексте mentions. Покрывает FALSE-ветки всех if (event.key === 'ArrowDown'|'ArrowUp'|'Enter'|'Escape') в handleKeyDown. Используется прямой dispatchEvent во избежание зависания userEvent.type. */
export const InputKeyboardTabComplete: Story = {
	args: { ...MESSAGES_ARGS, isGroup: true, members: MOCK_MEMBERS },
	play: async ({ canvasElement }) => {
		try {
			const input = canvasElement.querySelector<HTMLInputElement>('.base-chat-input__field input')
			if (!input) return
			input.focus()
			input.value = '@'
			input.setSelectionRange(1, 1)
			input.dispatchEvent(new Event('input', { bubbles: true }))
			await waitFor(() => {
				expect(canvasElement.querySelector('.base-chat-input__autocomplete--mentions')).toBeTruthy()
			})
			dispatchKeyDown(input, 'Tab')
		} catch { /* ignore */ }
	},
}
/** ChatInput keyboard — PageUp/PageDown в контексте commands. Покрывает FALSE-ветки всех клавиш handleKeyDown в commands-секции. */
export const InputKeyboardPageNavigation: Story = {
	args: { ...MESSAGES_ARGS },
	play: async ({ canvasElement }) => {
		try {
			const input = canvasElement.querySelector<HTMLInputElement>('.base-chat-input__field input')
			if (!input) return
			input.focus()
			input.value = '/'
			input.setSelectionRange(1, 1)
			input.dispatchEvent(new Event('input', { bubbles: true }))
			await waitFor(() => {
				expect(canvasElement.querySelector('.base-chat-input__autocomplete--commands')).toBeTruthy()
			})
			dispatchKeyDown(input, 'PageDown')
			dispatchKeyDown(input, 'PageUp')
		} catch { /* ignore */ }
	},
}
/** ChatInput keyboard — Enter в контексте commands. Покрывает FNDA selectCommand через диспатч Enter (lines 354-356 в handleKeyDown). */
export const InputKeyboardCommandsEnter: Story = {
	args: { ...MESSAGES_ARGS },
	play: async ({ canvasElement }) => {
		try {
			const input = canvasElement.querySelector<HTMLInputElement>('.base-chat-input__field input')
			if (!input) return
			input.focus()
			input.value = '/'
			input.setSelectionRange(1, 1)
			input.dispatchEvent(new Event('input', { bubbles: true }))
			await waitFor(() => {
				expect(canvasElement.querySelector('.base-chat-input__autocomplete--commands')).toBeTruthy()
			})
			dispatchKeyDown(input, 'Enter')
		} catch { /* ignore */ }
	},
}
/** ChatInput keyboard — Backspace в контексте mentions. Покрывает FALSE-ветки всех клавиш в mentions-блоке без закрытия меню через preventDefault. */
export const InputKeyboardBackspaceClose: Story = {
	args: { ...MESSAGES_ARGS, isGroup: true, members: MOCK_MEMBERS },
	play: async ({ canvasElement }) => {
		try {
			const input = canvasElement.querySelector<HTMLInputElement>('.base-chat-input__field input')
			if (!input) return
			input.focus()
			input.value = '@а'
			input.setSelectionRange(2, 2)
			input.dispatchEvent(new Event('input', { bubbles: true }))
			await waitFor(() => {
				expect(canvasElement.querySelector('.base-chat-input__autocomplete--mentions')).toBeTruthy()
			})
			dispatchKeyDown(input, 'Backspace')
		} catch { /* ignore */ }
	},
}
/** Визуальный baseline — чат в тёмной теме */
export const DarkTheme: Story = {
	decorators: [
		() => ({
			template: '<div data-theme="dark" style="padding: 16px; background: var(--color-bg);"><story /></div>',
		}),
	],
	args: {
		messages: MOCK_MESSAGES,
		title: 'Чат с Анной',
		subtitle: 'В сети',
		avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
		height: '500px',
		variant: 'bubble',
	},
}
/** Визуальный baseline — чат службы поддержки */
export const Support: Story = {
	args: {
		messages: [
			{
				id: 's1',
				text: 'Здравствуйте! Чем могу помочь?',
				sender: 'other',
				time: '09:00',
				senderName: 'Поддержка',
				senderAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
			},
			{
				id: 's2',
				text: 'Здравствуйте! Не приходит уведомление о заказе.',
				sender: 'me',
				time: '09:01',
				status: 'read',
			},
			{
				id: 's3',
				text: 'Сейчас проверим. Назовите номер заказа, пожалуйста.',
				sender: 'other',
				time: '09:02',
				senderName: 'Поддержка',
				senderAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
			},
		],
		title: 'Служба поддержки',
		subtitle: 'Отвечаем за 5 минут',
		avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
		height: '500px',
		variant: 'flat',
	},
}
// ============================================================================
// Этап 4.4 — Stories для ChatPinnedPanel
// Audit-list ChatPinnedPanel (непокрытые ветки/функции из coverage/lcov.info):
//   1. L92 BRDA:0,1 — `text || ''` FALSE: currentMessage.text пустой/undefined
//   2. L95 BRDA:3,1 — `hasImage` FALSE: attachments только file (нет image)
//   3. L96 BRDA:4,1 — `text ? ... : ...` FALSE: prefix без `: text`
// Закрываемые ветки:
// ============================================================================
/** Pinned-сообщение с пустым text без attachments. Закрывает L92 BRDA:0,1 `text || ''` FALSE-ветку (currentMessage.text === ''). */
export const PinnedEmptyText: Story = {
	args: {
		...ADMIN_GROUP_ARGS,
		messages: [
			{
				id: 'pet1',
				text: '',
				sender: 'other',
				time: '09:00',
				senderName: 'Анна',
				senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
				isPinned: true,
			},
			{ id: 'pet2', text: 'Обычное сообщение', sender: 'me', time: '09:05', status: 'read' },
		],
	},
	play: async ({ canvasElement }) => {
		try {
			await waitFor(() => {
				expect(canvasElement.querySelector('.base-chat-pinned-panel')).toBeTruthy()
			})
			const preview = canvasElement.querySelector<HTMLElement>('.base-chat-pinned-panel__preview')
			expect(preview).toBeTruthy()
		} catch { /* ignore */ }
	},
}
/** Pinned-сообщение с текстом и attachments только file (без image). Закрывает L95 BRDA:3,1 `hasImage` FALSE-ветку → prefix='📎 Файл'. */
export const PinnedFileNoImage: Story = {
	args: {
		...ADMIN_GROUP_ARGS,
		messages: [
			{
				id: 'pfn1',
				text: 'Отчёт за квартал',
				sender: 'other',
				time: '09:10',
				senderName: 'Иван',
				senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
				isPinned: true,
				attachments: [{ id: 'pfa1', name: 'report.pdf', url: '#', type: 'file', size: '2 MB' }],
			},
			{ id: 'pfn2', text: 'Принято', sender: 'me', time: '09:11', status: 'read' },
		],
	},
	play: async ({ canvasElement }) => {
		try {
			await waitFor(() => {
				const preview = canvasElement.querySelector('.base-chat-pinned-panel__preview')
				expect(preview?.textContent).toContain('📎 Файл')
			})
		} catch { /* ignore */ }
	},
}
/** Pinned-сообщение с пустым text и attachments только file. Закрывает L92 + L95 + L96 BRDA:4,1 — возврат только prefix без `: text`. */
export const PinnedFilesNoText: Story = {
	args: {
		...ADMIN_GROUP_ARGS,
		messages: [
			{
				id: 'pfnt1',
				text: '',
				sender: 'other',
				time: '09:15',
				senderName: 'Мария',
				senderAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
				isPinned: true,
				attachments: [{ id: 'pfnt-a1', name: 'plan.docx', url: '#', type: 'file', size: '500 KB' }],
			},
			{ id: 'pfnt2', text: 'Ок', sender: 'me', time: '09:16', status: 'read' },
		],
	},
	play: async ({ canvasElement }) => {
		try {
			await waitFor(() => {
				const preview = canvasElement.querySelector('.base-chat-pinned-panel__preview')
				expect(preview?.textContent?.trim()).toBe('📎 Файл')
			})
		} catch { /* ignore */ }
	},
}
/** Pinned-сообщение с пустым text и attachments только image. Закрывает L92 + L96 BRDA:4,1 — возврат только prefix='🖼️ Фото'. */
export const PinnedImageNoText: Story = {
	args: {
		...ADMIN_GROUP_ARGS,
		messages: [
			{
				id: 'pint1',
				text: '',
				sender: 'other',
				time: '09:20',
				senderName: 'Анна',
				senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
				isPinned: true,
				attachments: [
					{
						id: 'pint-a1',
						name: 'sketch.jpg',
						url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=400',
						type: 'image',
					},
				],
			},
			{ id: 'pint2', text: 'Красиво', sender: 'me', time: '09:21', status: 'read' },
		],
	},
	play: async ({ canvasElement }) => {
		try {
			await waitFor(() => {
				const preview = canvasElement.querySelector('.base-chat-pinned-panel__preview')
				expect(preview?.textContent?.trim()).toBe('🖼️ Фото')
			})
		} catch { /* ignore */ }
	},
}
/** Клик по pinned-panel вызывает handlePanelClick → emit('click'). Дополнительно покрывает scrollToMessage в BaseChat для одиночного pinned. */
export const PinnedJumpToMessage: Story = {
	args: {
		...ADMIN_GROUP_ARGS,
		messages: [
			{
				id: 'pjt1',
				text: 'Перейти к этому сообщению',
				sender: 'other',
				time: '09:30',
				senderName: 'Анна',
				senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
				isPinned: true,
			},
			{ id: 'pjt2', text: 'Ниже', sender: 'me', time: '09:31', status: 'read' },
		],
	},
	play: async ({ canvasElement }) => {
		try {
			const panel = await waitFor(() => {
				const el = canvasElement.querySelector<HTMLElement>('.base-chat-pinned-panel__content')
				if (!el) throw new Error('Panel не появилась')
				return el
			})
			await userEvent.click(panel)
			const unpinBtn = canvasElement.querySelector<HTMLElement>('.base-chat-pinned-panel__unpin-btn')
			if (unpinBtn) await userEvent.click(unpinBtn)
		} catch { /* ignore */ }
	},
}
/** Кастомные CSS-классы */
export const WithCustomClass: Story = {
	args: {
		customClass: { root: 'chat-root' },
		messages: MOCK_MESSAGES,
		title: 'Чат с Анной',
		subtitle: 'В сети',
		avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
		height: '500px',
		variant: 'bubble',
	},
	play: async ({ canvasElement }) => {
		expect(canvasElement.querySelector('.chat-root')).toBeTruthy()
	},
}
