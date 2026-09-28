/**
 * BaseChat — stories.
 *
 * Разделы: Default (песочница: чат ведёт себя как в приложении — отправленное сообщение, реакция, удаление и закреп
 * сразу видны в ленте) → внешний вид (варианты, размеры, цвет) → состояния (пусто, ожидание, длинный контент) →
 * сценарии (группа, ответ, удаление, вложения, реакции, закрепы, поиск, выделение, панель «Информация»,
 * упоминания и команды) → клавиатура.
 */

import { expect, fn, screen, waitFor, within } from 'storybook/test'
import { ref, watch } from 'vue'
import {
	ARG_GROUP,
	baseArgTypes,
	propGroup,
	SIZE_PRESETS,
	sizeLabel,
	STORY_IMAGES,
	STORY_TODAY,
	STORY_USERS,
	storyDate,
	tabTo,
	useArgsWithoutSlots,
} from '@/stories/helpers'
import { CHAT_VARIANTS } from '../model/BaseChat.types'
import BaseChat from '../ui/BaseChat.vue'
import type { ChatCommand, ChatMember, ChatMessage, ChatMessageAttachment, ChatMessageReaction } from '../model/BaseChat.types'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

// ─── Данные ────────────────────────────────────────────────────────────────────
// Даты — от STORY_TODAY (15 мая 2025), люди — STORY_USERS, картинки — STORY_IMAGES: скриншоты не зависят от дня и сети.

const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']

/** «09:41» */
function timeOf(date: Date): string {
	return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

/** Время и дата сообщения: сегодня (days = 0) или days дней назад */
function sentAt(hours: number, minutes: number, days = 0): Pick<ChatMessage, 'time' | 'date'> {
	const date = storyDate(days, hours, minutes)
	return { time: timeOf(date), date: `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}` }
}

/** Файл-вложение: data URI, чтобы «Скачать» работало без сети */
function storyFile(id: string, name: string, size: string): ChatMessageAttachment {
	return { id, name, size, type: 'file', url: `data:text/plain;charset=utf-8,${encodeURIComponent(`Файл ${name} из примера BaseChat`)}` }
}

function storyImage(id: string, index: number, name: string): ChatMessageAttachment {
	return { id, name, type: 'image', url: STORY_IMAGES[index].src }
}

const [ANNA, IVAN, MARIA, OLEG] = STORY_USERS

/** Личный чат с дизайнером: фото, файл, ссылка, ответ с цитатой, реакция и все статусы доставки */
const PRIVATE_MESSAGES: ChatMessage[] = [
	{
		id: 'p1',
		sender: 'other',
		senderId: 'u1',
		senderName: ANNA.name,
		senderAvatar: ANNA.avatar,
		text: 'Привет! Посмотрела новые макеты главной — выглядит отлично 👍',
		...sentAt(9, 12),
	},
	{ id: 'p2', sender: 'me', text: 'Спасибо! Что стоит поправить до релиза?', status: 'read', ...sentAt(9, 14) },
	{
		id: 'p3',
		sender: 'other',
		senderId: 'u1',
		senderName: ANNA.name,
		senderAvatar: ANNA.avatar,
		text: 'Две вещи: кнопки в карточках мелковаты, а отступы в шапке разные. Скриншоты ниже.',
		attachments: [storyImage('p3-1', 0, 'main-light.png'), storyImage('p3-2', 1, 'main-dark.png')],
		...sentAt(9, 16),
	},
	{
		id: 'p4',
		sender: 'me',
		text: 'Поправлю сегодня и заодно обновлю токены отступов.',
		status: 'read',
		replyToId: 'p3',
		replyToSenderName: ANNA.name,
		replyToText: 'Две вещи: кнопки в карточках мелковаты, а отступы в шапке разные. Скриншоты ниже.',
		reactions: [{ emoji: '🔥', users: [ANNA.name] }],
		...sentAt(9, 20),
	},
	{
		id: 'p5',
		sender: 'other',
		senderId: 'u1',
		senderName: ANNA.name,
		senderAvatar: ANNA.avatar,
		text: 'Отлично. Гайдлайн по иконкам — во вложении и на сайте: https://rise-ui.dev/icons',
		attachments: [storyFile('p5-1', 'icons-guide.pdf', '2,4 МБ')],
		...sentAt(9, 24),
	},
	{ id: 'p6', sender: 'me', text: 'Принято, посмотрю после обеда.', status: 'delivered', ...sentAt(9, 25) },
]

/** Участники группы. Текущий пользователь — отправитель 'me', в списке участников его нет */
const MEMBERS: ChatMember[] = [
	{ id: 'u1', name: ANNA.name, avatar: ANNA.avatar, role: 'admin', status: 'online' },
	{ id: 'u2', name: IVAN.name, avatar: IVAN.avatar, role: 'member', status: 'online', warningsCount: 0 },
	{ id: 'u3', name: MARIA.name, avatar: MARIA.avatar, role: 'member', status: 'offline', warningsCount: 1 },
	{ id: 'u4', name: OLEG.name, avatar: OLEG.avatar, role: 'member', status: 'offline' },
]

/** Групповой чат: имена отправителей, @упоминание, /команда, файл, закреп, ответ */
const GROUP_MESSAGES: ChatMessage[] = [
	{
		id: 'g1',
		sender: 'other',
		senderId: 'u1',
		senderName: ANNA.name,
		senderAvatar: ANNA.avatar,
		text: 'Коллеги, релиз 1.4 — в пятницу 🎉 Проверьте свои компоненты в тёмной теме.',
		isPinned: true,
		reactions: [
			{ emoji: '👍', users: [IVAN.name, 'me'] },
			{ emoji: '🎉', users: [MARIA.name] },
		],
		...sentAt(10, 2),
	},
	{
		id: 'g2',
		sender: 'other',
		senderId: 'u2',
		senderName: IVAN.name,
		senderAvatar: IVAN.avatar,
		text: '@Мария посмотри, пожалуйста, таблицу: в шапке съехал отступ.',
		...sentAt(10, 5),
	},
	{
		id: 'g3',
		sender: 'other',
		senderId: 'u3',
		senderName: MARIA.name,
		senderAvatar: MARIA.avatar,
		text: 'Смотрю. Список задач релиза — по команде /tasks',
		...sentAt(10, 7),
	},
	{ id: 'g4', sender: 'me', text: 'Кнопки и поля готовы, осталась тёмная тема графиков.', status: 'read', ...sentAt(10, 9) },
	{
		id: 'g5',
		sender: 'other',
		senderId: 'u4',
		senderName: OLEG.name,
		senderAvatar: OLEG.avatar,
		text: 'Отчёт по метрикам за май — во вложении.',
		attachments: [storyFile('g5-1', 'metrics-may.xlsx', '820 КБ')],
		...sentAt(10, 12),
	},
	{
		id: 'g6',
		sender: 'other',
		senderId: 'u1',
		senderName: ANNA.name,
		senderAvatar: ANNA.avatar,
		text: 'Отлично! Графики возьму на себя.',
		replyToId: 'g4',
		replyToSenderName: 'Вы',
		replyToText: 'Кнопки и поля готовы, осталась тёмная тема графиков.',
		...sentAt(10, 14),
	},
]

const COMMANDS: ChatCommand[] = [
	{ name: 'tasks', description: 'Список задач релиза' },
	{ name: 'status', description: 'Статус сборки' },
	{ name: 'mute', description: 'Выключить уведомления' },
]

const QUICK_REPLIES = ['Спасибо!', 'Посмотрю сегодня', 'Созвонимся?']

const PRIVATE_CHAT = {
	title: ANNA.name,
	subtitle: 'в сети',
	avatar: ANNA.avatar,
	description: 'Дизайнер интерфейсов: отвечает за дизайн-систему и макеты продукта.',
}

const GROUP_CHAT = {
	title: 'Команда дизайн-системы',
	subtitle: '4 участника',
	avatar: undefined,
	description: 'Рабочий чат команды: релизы, ревью компонентов и задачи на неделю.',
	isGroup: true,
	members: MEMBERS,
}

/** Короткий диалог для витрин (варианты, размеры): чужое сообщение, ответ с цитатой и реакцией, статус */
const SHOWCASE_MESSAGES: ChatMessage[] = [
	PRIVATE_MESSAGES[0],
	PRIVATE_MESSAGES[1],
	{ ...PRIVATE_MESSAGES[3], replyToId: 'p1', replyToText: PRIVATE_MESSAGES[0].text, id: 's3' },
]

// ─── «Приложение» вокруг чата ─────────────────────────────────────────────────
// BaseChat не хранит историю: отправка, реакции, удаление и закрепы приходят событиями, а список сообщений обновляет
// приложение. В примерах это делает useStoryMessages: копия messages из args в ref и обработчики событий.
// Копия, а не запись в args: обновление args перезапускает story и сбрасывает счётчики вызовов fn() в play.

type SendPayload = { text: string; attachments?: ChatMessageAttachment[]; replyToId?: string }

function toggleOwnReaction(reactions: ChatMessageReaction[], emoji: string): ChatMessageReaction[] {
	const current = reactions.find(reaction => reaction.emoji === emoji)
	if (!current) return [...reactions, { emoji, users: ['me'] }]
	const users = current.users.includes('me') ? current.users.filter(user => user !== 'me') : [...current.users, 'me']
	if (users.length === 0) return reactions.filter(reaction => reaction.emoji !== emoji)
	return reactions.map(reaction => (reaction.emoji === emoji ? { ...reaction, users } : reaction))
}

function createChatHandlers(getMessages: () => ChatMessage[], setMessages: (messages: ChatMessage[]) => void) {
	const update = (id: string, patch: (message: ChatMessage) => Partial<ChatMessage>) =>
		setMessages(getMessages().map(message => (message.id === id ? { ...message, ...patch(message) } : message)))

	return {
		send(payload: SendPayload): void {
			const messages = getMessages()
			const quoted = messages.find(message => message.id === payload.replyToId)
			setMessages([
				...messages,
				{
					id: `new-${messages.length + 1}`,
					sender: 'me',
					text: payload.text,
					attachments: payload.attachments,
					status: 'sent',
					time: timeOf(STORY_TODAY),
					replyToId: quoted?.id,
					replyToText: quoted?.text,
					replyToSenderName: quoted ? (quoted.senderName ?? 'Вы') : undefined,
				},
			])
		},
		react({ messageId, emoji }: { messageId: string; emoji: string }): void {
			update(messageId, message => ({ reactions: toggleOwnReaction(message.reactions ?? [], emoji) }))
		},
		remove(ids: string[]): void {
			setMessages(getMessages().filter(message => !ids.includes(message.id)))
		},
		pin(id: string): void {
			update(id, message => ({ isPinned: !message.isPinned }))
		},
		unpin(id: string): void {
			update(id, () => ({ isPinned: false }))
		},
	}
}

/** Сообщения примера: начальные — из args (меняются в Controls), дальше их обновляют события чата */
function useStoryMessages(args: { messages: ChatMessage[] }) {
	const messages = ref<ChatMessage[]>([...args.messages])
	watch(
		() => args.messages,
		value => {
			messages.value = [...value]
		},
	)
	const chat = createChatHandlers(
		() => messages.value,
		value => {
			messages.value = value
		},
	)
	// Для v-on="listeners": ключи совпадают с ключами spy в args ('onDelete-messages'…), Vue вызывает оба обработчика
	const listeners = {
		send: chat.send,
		'message-reaction': chat.react,
		'delete-messages': chat.remove,
		'pin-message': chat.pin,
		'unpin-message': chat.unpin,
	}
	return { messages, listeners }
}

/** Цвет CSS-значения в формате getComputedStyle — для сравнения с токеном */
function resolveColor(value: string): string {
	const probe = document.createElement('span')
	probe.style.color = value
	document.body.append(probe)
	const resolved = getComputedStyle(probe).color
	probe.remove()
	return resolved
}

/** Элемент сообщения в ленте (у контейнера сообщения нет роли — ищем по id) */
function getMessage(canvasElement: HTMLElement, id: string): HTMLElement {
	return canvasElement.querySelector<HTMLElement>(`#message-${id}`) as HTMLElement
}

// ─── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Chat/BaseChat',
	component: BaseChat,
	parameters: {
		docs: {
			description: {
				component: [
					'Окно чата: шапка с поиском и панелью «Информация», закреплённые сообщения, лента с ответами, вложениями и реакциями, поле ввода с @упоминаниями, /командами и эмодзи.',
					'',
					'- Сообщения — массив `messages` (`sender: "me" | "other"`). Историю хранит приложение: отправка, реакции, удаление и закрепы приходят событиями (`send`, `message-reaction`, `delete-messages`, `pin-message`…), приложение обновляет `messages`.',
					'- Варианты: `bubble` — мягкие пузыри (свои справа, чужие слева с аватаром и именем), `flat` — без пузырей, с разделителями, `modern` — карточки с рамкой.',
					'- Доступность: лента — `role="log"`; действия с сообщением — кнопки, видимые при наведении и при фокусе; меню «Другие действия» управляется стрелками, Escape закрывает его и возвращает фокус. Enter отправляет, Shift+Enter — новая строка.',
					'- Закреплённые берутся из `messages[].isPinned` (проп `pinnedMessages` не используется). Панель «Информация» — `BaseSlideover` внутри окна, удаление подтверждает `BaseModal`.',
					'',
					'Проп `color` красит фон окна и заголовок; кнопки, поля и аватары внутри остаются в цветах темы.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: CHAT_VARIANTS }),
		messages: { control: 'object', table: propGroup(ARG_GROUP.content) },
		title: { control: 'text', table: propGroup(ARG_GROUP.content) },
		subtitle: { control: 'text', table: propGroup(ARG_GROUP.content) },
		avatar: { control: 'text', table: propGroup(ARG_GROUP.content) },
		description: { control: 'text', table: propGroup(ARG_GROUP.content) },
		members: { control: 'object', table: propGroup(ARG_GROUP.content) },
		quickReplies: { control: 'object', table: propGroup(ARG_GROUP.content) },
		commands: { control: 'object', table: propGroup(ARG_GROUP.content) },
		pinnedMessages: { control: false, table: propGroup(ARG_GROUP.content) },
		height: { control: 'text', table: propGroup(ARG_GROUP.appearance) },
		isTyping: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		typingUsername: { control: 'text', table: propGroup(ARG_GROUP.state) },
		isGroup: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		currentUserRole: { control: 'inline-radio', options: ['member', 'admin'], table: propGroup(ARG_GROUP.behavior) },
	},
	args: {
		...PRIVATE_CHAT,
		messages: PRIVATE_MESSAGES,
		quickReplies: QUICK_REPLIES,
		variant: 'bubble',
		sizeScale: 100,
		height: '560px',
		isTyping: false,
		typingUsername: '',
		isGroup: false,
		currentUserRole: 'member',
		onSend: fn(),
		onAttach: fn(),
		'onAvatar-click': fn(),
		'onMessage-select': fn(),
		'onInfo-click': fn(),
		'onMessage-reaction': fn(),
		'onQuick-reply': fn(),
		'onDownload-file': fn(),
		'onDelete-messages': fn(),
		'onForward-messages': fn(),
		'onPin-message': fn(),
		'onUnpin-message': fn(),
		'onKick-member': fn(),
		'onBan-member': fn(),
		'onUpdate-member-role': fn(),
		'onMention-click': fn(),
		'onCommand-click': fn(),
		onError: fn(),
	},
	// Песочница-«приложение»: события чата обновляют список сообщений (см. useStoryMessages).
	render: args => ({
		components: { BaseChat },
		setup: () => ({ props: useArgsWithoutSlots(args, ['messages']), ...useStoryMessages(args) }),
		template: `
			<div class="story-medium">
				<BaseChat v-bind="props" :messages="messages" v-on="listeners" />
			</div>
		`,
	}),
} satisfies Meta<typeof BaseChat>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/**
 * Песочница: напишите сообщение и нажмите Enter — оно появится в ленте. Реакции, удаление и закреп тоже работают:
 * пример обновляет список сообщений по событиям, как это делает приложение.
 */
export const Default: Story = {
	play: async ({ canvas, userEvent, args }) => {
		const field = canvas.getByRole('textbox', { name: 'Сообщение' })
		await userEvent.type(field, 'Макеты обновил, посмотри{Enter}')
		await expect(args.onSend).toHaveBeenCalledWith(expect.objectContaining({ text: 'Макеты обновил, посмотри' }))
		await expect(field).toHaveValue('')
		const log = canvas.getByRole('log', { name: 'Сообщения' })
		await waitFor(() => expect(within(log).getByText('Макеты обновил, посмотри')).toBeInTheDocument())
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/**
 * Три варианта оформления сообщений. `bubble` — мягкие пузыри: свои справа (primary-soft), чужие слева (bg-elevated);
 * `flat` — без пузырей, сообщения разделены линией; `modern` — карточки с рамкой.
 */
export const Variants: Story = {
	parameters: {
		controls: { include: ['sizeScale'] },
		docs: {
			source: {
				code: CHAT_VARIANTS.map(variant => `<BaseChat :messages="messages" title="Анна Смирнова" variant="${variant}" />`).join(
					'\n',
				),
			},
		},
	},
	render: args => ({
		components: { BaseChat },
		setup: () => ({ sizeScale: args.sizeScale, variants: CHAT_VARIANTS, messages: SHOWCASE_MESSAGES, chat: PRIVATE_CHAT }),
		template: `
			<div class="story-grid" style="--story-grid-min: 320px;">
				<BaseChat
					v-for="variant in variants"
					:key="variant"
					v-bind="chat"
					:messages="messages"
					:variant="variant"
					:subtitle="variant"
					:size-scale="sizeScale"
					height="420px" />
			</div>
		`,
	}),
}

/** Размеры через `sizeScale`: высота кнопок и поля ввода — 28, 32 и 36px, кегль и отступы — пропорционально. */
export const Sizes: Story = {
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			source: {
				code: SIZE_PRESETS.slice(1, 4)
					.map(p => `<BaseChat :messages="messages" title="Анна Смирнова" :size-scale="${p.sizeScale}" />`)
					.join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseChat },
		setup: () => ({
			variant: args.variant,
			presets: SIZE_PRESETS.slice(1, 4),
			sizeLabel,
			messages: SHOWCASE_MESSAGES.slice(0, 2),
			chat: PRIVATE_CHAT,
		}),
		template: `
			<div class="story-grid" style="--story-grid-min: 320px;">
				<BaseChat
					v-for="preset in presets"
					:key="preset.name"
					v-bind="chat"
					:messages="messages"
					:variant="variant"
					:subtitle="sizeLabel(preset)"
					:size-scale="preset.sizeScale"
					height="360px" />
			</div>
		`,
	}),
}

/**
 * Проп `color` красит фон окна и заголовок, например под бренд. Кнопки, поле ввода и аватары внутри не перекрашиваются:
 * «Отправить» остаётся цвета `--rise-primary`. Для тёмной темы пример подставляет тёмный брендовый фон.
 */
export const CustomColor: Story = {
	render: (args, { globals }) => ({
		components: { BaseChat },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['messages', 'color']),
			color:
				globals.theme === 'dark'
					? { bg: { base: '#0c1a2b' }, text: { base: '#e0f2fe' } }
					: { bg: { base: '#f0f9ff' }, text: { base: '#0c4a6e' } },
			...useStoryMessages(args),
		}),
		template: '<div class="story-medium"><BaseChat v-bind="props" :messages="messages" :color="color" v-on="listeners" /></div>',
	}),
	parameters: { controls: { exclude: ['color'] } },
	play: async ({ canvas, canvasElement, globals }) => {
		const root = canvasElement.querySelector('.base-chat') as HTMLElement
		const brand = globals.theme === 'dark' ? '#0c1a2b' : '#f0f9ff'
		await expect(getComputedStyle(root).backgroundColor).toBe(resolveColor(brand))
		// Вложенная кнопка не унаследовала цвет чата
		await expect(getComputedStyle(canvas.getByRole('button', { name: 'Отправить сообщение' })).backgroundColor).toBe(
			resolveColor('var(--rise-primary)'),
		)
	},
}

// ─── Состояния ─────────────────────────────────────────────────────────────────

/** Пустая лента: подсказка по центру, поле ввода готово к первому сообщению. */
export const Empty: Story = {
	args: { messages: [], quickReplies: [] },
	play: async ({ canvas }) => {
		const log = canvas.getByRole('log', { name: 'Сообщения' })
		await expect(within(log).getByText('Сообщений пока нет')).toBeInTheDocument()
		await expect(canvas.getByRole('button', { name: 'Отправить сообщение' })).toBeDisabled()
	},
}

/**
 * Ожидание. У BaseChat нет состояния загрузки истории: ожидание показывают статус `sending` у своего сообщения
 * (спиннер) и `isTyping` — «печатает» в шапке и точки в ленте. Оба индикатора — `role="status"` с доступным именем.
 */
export const Loading: Story = {
	args: {
		messages: [
			...PRIVATE_MESSAGES.slice(0, 2),
			{ id: 'sending', sender: 'me', text: 'Отправляю обновлённые макеты…', status: 'sending', time: timeOf(STORY_TODAY) },
		],
		isTyping: true,
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('status', { name: 'Отправляется' })).toBeInTheDocument()
		await expect(canvas.getByRole('status', { name: 'Печатает' })).toBeInTheDocument()
		await expect(canvas.getByRole('img', { name: 'Прочитано' })).toBeInTheDocument()
	},
}

/**
 * Длинное содержимое: название обрезается многоточием, переносы строк в тексте сохраняются, длинные ссылки и слова
 * переносятся и не растягивают ленту, лента прокручивается к последнему сообщению.
 */
export const LongContent: Story = {
	args: {
		title: 'Отдел проектирования интерфейсов и развития дизайн-системы компании',
		subtitle: 'Анна Смирнова, Иван Петров, Мария Кузнецова, Олег Соколов и ещё 12 участников',
		messages: [
			...PRIVATE_MESSAGES,
			{
				id: 'long-1',
				sender: 'other',
				senderName: ANNA.name,
				senderAvatar: ANNA.avatar,
				text: 'План на неделю:\n1. Проверить все компоненты в тёмной теме.\n2. Обновить скриншоты.\n3. Подготовить заметки к релизу.',
				...sentAt(9, 40),
			},
			{
				id: 'long-2',
				sender: 'me',
				text: 'Ссылка на сборку: https://rise-ui.dev/builds/2025-05-15/release-candidate-1.4.0-rc.3/storybook/index.html?path=/docs/chat-basechat--docs',
				status: 'sent',
				...sentAt(9, 42),
			},
		],
	},
	play: async ({ canvas }) => {
		const title = canvas.getByText('Отдел проектирования интерфейсов и развития дизайн-системы компании')
		await expect(title.scrollWidth).toBeGreaterThan(title.clientWidth)
		const log = canvas.getByRole('log', { name: 'Сообщения' })
		await expect(log.scrollHeight).toBeGreaterThan(log.clientHeight)
		await expect(log.scrollWidth).toBeLessThanOrEqual(log.clientWidth)
		const plan = within(log).getByText(/План на неделю/)
		await expect(getComputedStyle(plan).whiteSpace).toBe('pre-wrap')
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/**
 * Групповой чат (`isGroup`): у чужих сообщений — аватар и имя. Имя и аватар открывают профиль отправителя в панели
 * «Информация» и эмитят `avatar-click` с `senderId`. @упоминания и /команды в тексте — кнопки.
 */
export const Group: Story = {
	args: { ...GROUP_CHAT, messages: GROUP_MESSAGES, commands: COMMANDS },
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: IVAN.name }))
		await expect(args['onAvatar-click']).toHaveBeenCalledWith('u2')
		const profile = await canvas.findByRole('dialog', { name: 'Профиль' })
		await expect(within(profile).getByText(IVAN.name)).toBeInTheDocument()
	},
}

/**
 * Ответ: «Ответить» у сообщения показывает панель ответа над полем, `send` приходит с `replyToId`. Цитата в ответе —
 * кнопка: клик прокручивает ленту к оригиналу и подсвечивает его.
 */
export const Reply: Story = {
	play: async ({ canvas, canvasElement, userEvent, args }) => {
		const original = getMessage(canvasElement, 'p3')
		await userEvent.click(within(original).getByRole('button', { name: 'Ответить на сообщение' }))
		await expect(canvas.getByRole('button', { name: 'Отменить ответ на сообщение' })).toBeInTheDocument()

		await userEvent.type(canvas.getByRole('textbox', { name: 'Сообщение' }), 'Кнопки уже поправил{Enter}')
		await expect(args.onSend).toHaveBeenCalledWith(expect.objectContaining({ text: 'Кнопки уже поправил', replyToId: 'p3' }))
		await waitFor(() => expect(canvas.queryByRole('button', { name: 'Отменить ответ на сообщение' })).not.toBeInTheDocument())

		// Цитата в сообщении p4 ведёт к оригиналу
		await userEvent.click(within(getMessage(canvasElement, 'p4')).getByRole('button', { name: /Две вещи/ }))
		await expect(original).toHaveClass('base-chat-message-list__item--highlighted')
	},
}

/**
 * Удаление: «Другие действия» → «Удалить» открывает подтверждение (`BaseModal` внутри окна); `delete-messages`
 * приходит только после подтверждения. Удалить можно своё сообщение, администратор — любое. Редактирования нет.
 */
export const Delete: Story = {
	play: async ({ canvas, canvasElement, userEvent, args }) => {
		await userEvent.click(within(getMessage(canvasElement, 'p6')).getByRole('button', { name: 'Другие действия с сообщением' }))
		const menu = await screen.findByRole('menu', { name: 'Действия с сообщением' })
		await userEvent.click(within(menu).getByRole('menuitem', { name: 'Удалить' }))

		const dialog = await canvas.findByRole('dialog', { name: 'Удалить сообщения?' })
		await expect(args['onDelete-messages']).not.toHaveBeenCalled()
		await userEvent.click(within(dialog).getByRole('button', { name: 'Удалить' }))
		await expect(args['onDelete-messages']).toHaveBeenCalledWith(['p6'])
		await waitFor(() => expect(canvas.queryByText('Принято, посмотрю после обеда.')).not.toBeInTheDocument())
	},
}

/**
 * Вложения: изображения — коллаж до четырёх превью с «+N», открываются просмотрщиком; файлы — карточки с именем,
 * размером и кнопкой «Скачать». Скрепка добавляет файлы: превью над полем, отправка — вместе с текстом или без него.
 */
export const Attachments: Story = {
	args: {
		messages: [
			PRIVATE_MESSAGES[2],
			{
				id: 'a2',
				sender: 'me',
				text: 'Все варианты обложек:',
				attachments: STORY_IMAGES.map((image, index) => storyImage(`a2-${index}`, index, `cover-${index + 1}.png`)),
				status: 'read',
				...sentAt(9, 30),
			},
			{
				id: 'a3',
				sender: 'other',
				senderName: ANNA.name,
				senderAvatar: ANNA.avatar,
				text: '',
				attachments: [storyFile('a3-1', 'brand-guide.pdf', '4,1 МБ'), storyFile('a3-2', 'tokens.json', '12 КБ')],
				...sentAt(9, 32),
			},
		],
		quickReplies: [],
	},
	play: async ({ canvas, canvasElement, userEvent, args }) => {
		// Шесть изображений: в коллаже четыре превью, на последнем — «+3»
		await expect(within(getMessage(canvasElement, 'a2')).getByText('+3')).toBeInTheDocument()

		const fileInput = canvasElement.querySelector('input[type="file"]') as HTMLInputElement
		await userEvent.upload(fileInput, new File(['План релиза 1.4'], 'release-plan.txt', { type: 'text/plain' }))
		await expect(args.onAttach).toHaveBeenCalled()
		await expect(canvas.getByRole('button', { name: 'Удалить вложение release-plan.txt' })).toBeInTheDocument()

		await userEvent.click(canvas.getByRole('button', { name: 'Отправить сообщение' }))
		await expect(args.onSend).toHaveBeenCalledWith(
			expect.objectContaining({ text: '', attachments: [expect.objectContaining({ name: 'release-plan.txt', type: 'file' })] }),
		)
		await waitFor(() => expect(canvas.getByRole('button', { name: 'Скачать файл release-plan.txt' })).toBeInTheDocument())
	},
}

/**
 * Реакции — пилюли под сообщением; своя реакция — кнопка в нажатом состоянии (`aria-pressed`). Нажатие эмитит
 * `message-reaction`, новую реакцию ставят из меню «Другие действия».
 */
export const Reactions: Story = {
	args: { ...GROUP_CHAT, messages: GROUP_MESSAGES.slice(0, 4) },
	play: async ({ canvasElement, userEvent, args }) => {
		const message = getMessage(canvasElement, 'g1')
		const party = within(message).getByRole('button', { name: 'Реакция 🎉: 1' })
		await expect(party).toHaveAttribute('aria-pressed', 'false')
		await userEvent.click(party)
		await expect(args['onMessage-reaction']).toHaveBeenCalledWith({ messageId: 'g1', emoji: '🎉' })
		await waitFor(() => expect(within(message).getByRole('button', { name: 'Реакция 🎉: 2' })).toHaveAttribute('aria-pressed', 'true'))

		await userEvent.click(within(message).getByRole('button', { name: 'Другие действия с сообщением' }))
		const menu = await screen.findByRole('menu', { name: 'Действия с сообщением' })
		await userEvent.click(within(menu).getByRole('menuitem', { name: 'Поставить реакцию ❤️' }))
		await waitFor(() => expect(within(message).getByRole('button', { name: 'Реакция ❤️: 1' })).toHaveAttribute('aria-pressed', 'true'))
	},
}

/**
 * Закреплённые сообщения (`messages[].isPinned`) — панель под шапкой: стрелки листают закрепы, клик по панели
 * прокручивает ленту к сообщению. Администратор (`currentUserRole: 'admin'`) закрепляет из меню и открепляет крестиком.
 */
export const Pinned: Story = {
	args: {
		...GROUP_CHAT,
		currentUserRole: 'admin',
		messages: GROUP_MESSAGES.map(message => (message.id === 'g3' || message.id === 'g5' ? { ...message, isPinned: true } : message)),
	},
	play: async ({ canvas, canvasElement, userEvent, args }) => {
		await expect(canvas.getByRole('button', { name: /Закреплённое сообщение \(1 из 3\)/ })).toBeInTheDocument()
		await userEvent.click(canvas.getByRole('button', { name: 'Следующее закреплённое сообщение' }))
		const panel = canvas.getByRole('button', { name: /Закреплённое сообщение \(2 из 3\)/ })

		await userEvent.click(panel)
		await expect(getMessage(canvasElement, 'g3')).toHaveClass('base-chat-message-list__item--highlighted')

		await userEvent.click(canvas.getByRole('button', { name: 'Открепить сообщение' }))
		await expect(args['onUnpin-message']).toHaveBeenCalledWith('g3')
		await waitFor(() => expect(canvas.getByRole('button', { name: /Закреплённое сообщение \(2 из 2\)/ })).toBeInTheDocument())
	},
}

/**
 * Поиск: кнопка с лупой открывает поле (фокус сразу в нём), лента фильтруется, совпадения подсвечены. Escape закрывает
 * поиск: запрос сбрасывается, лента снова полная, фокус возвращается на кнопку поиска.
 */
export const Search: Story = {
	play: async ({ canvas, userEvent }) => {
		const log = canvas.getByRole('log', { name: 'Сообщения' })
		const total = log.querySelectorAll('.base-chat-message-list__item').length

		await userEvent.click(canvas.getByRole('button', { name: 'Поиск по сообщениям' }))
		const search = canvas.getByRole('searchbox', { name: 'Поиск по сообщениям' })
		await waitFor(() => expect(search).toHaveFocus())
		await userEvent.keyboard('отступ')
		await waitFor(() => expect(log.querySelectorAll('.base-chat-message-list__item')).toHaveLength(2))
		await expect(log.querySelectorAll('mark')).toHaveLength(2)

		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(canvas.getByRole('button', { name: 'Поиск по сообщениям' })).toHaveFocus())
		await expect(log.querySelectorAll('.base-chat-message-list__item')).toHaveLength(total)
	},
}

/**
 * Выделение: «Выбрать» у сообщения включает режим выделения — у сообщений появляются чекбоксы, поле ввода сменяет
 * тулбар «Переслать / Удалить / Отмена». Черновик в поле ввода при этом сохраняется.
 */
export const Selection: Story = {
	play: async ({ canvas, canvasElement, userEvent, args }) => {
		const field = canvas.getByRole('textbox', { name: 'Сообщение' })
		await userEvent.type(field, 'Черновик ответа')

		await userEvent.click(within(getMessage(canvasElement, 'p2')).getByRole('button', { name: 'Выбрать сообщение' }))
		const toolbar = canvas.getByRole('group', { name: 'Действия с выбранными сообщениями' })
		await expect(within(toolbar).getByText('Выбрано: 1')).toBeInTheDocument()

		await userEvent.click(within(getMessage(canvasElement, 'p4')).getByRole('checkbox', { name: 'Выбрать сообщение' }))
		await expect(within(toolbar).getByText('Выбрано: 2')).toBeInTheDocument()

		await userEvent.click(within(toolbar).getByRole('button', { name: 'Переслать' }))
		await expect(args['onForward-messages']).toHaveBeenCalledWith(['p2', 'p4'])
		await expect(canvas.getByRole('textbox', { name: 'Сообщение' })).toHaveValue('Черновик ответа')
	},
}

/**
 * Панель «Информация» — `BaseSlideover` внутри окна: сводка чата с описанием (`description`), вкладки (стрелки
 * переключают), участники. Администратор меняет роль, исключает и банит участника из меню. Escape закрывает панель
 * и возвращает фокус на кнопку «Информация о чате».
 */
export const InfoPanel: Story = {
	args: { ...GROUP_CHAT, messages: GROUP_MESSAGES, currentUserRole: 'admin' },
	play: async ({ canvas, userEvent, args }) => {
		const infoButton = canvas.getByRole('button', { name: 'Информация о чате' })
		await userEvent.click(infoButton)
		const panel = await canvas.findByRole('dialog', { name: 'Информация' })
		await expect(within(panel).getByText(GROUP_CHAT.description)).toBeInTheDocument()
		const membersTab = within(panel).getByRole('tab', { name: 'Участники' })
		await waitFor(() => expect(membersTab).toHaveFocus())

		await userEvent.keyboard('{ArrowRight}')
		await waitFor(() => expect(within(panel).getByRole('tab', { name: 'Медиа' })).toHaveAttribute('aria-selected', 'true'))
		await userEvent.keyboard('{ArrowLeft}')

		await userEvent.click(within(panel).getByRole('button', { name: `Действия с участником ${IVAN.name}` }))
		await userEvent.click(within(panel).getByRole('menuitem', { name: 'Сделать админом' }))
		await expect(args['onUpdate-member-role']).toHaveBeenCalledWith({ memberId: 'u2', role: 'admin' })

		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(canvas.queryByRole('dialog', { name: 'Информация' })).not.toBeInTheDocument())
		await expect(infoButton).toHaveFocus()

		// Панель открывается и с клавиатуры — пример остаётся с открытой панелью
		await userEvent.keyboard('{Enter}')
		await expect(await canvas.findByRole('dialog', { name: 'Информация' })).toBeInTheDocument()
	},
}

/**
 * Подсказки: «@» открывает список участников, «/» — список команд (или кнопка «</>» слева). Список связан с полем
 * (`aria-activedescendant`), стрелки выбирают пункт, Escape закрывает. Enter подставляет выбранное и сразу отправляет.
 */
export const MentionsAndCommands: Story = {
	args: { ...GROUP_CHAT, messages: GROUP_MESSAGES.slice(0, 3), commands: COMMANDS, quickReplies: [] },
	play: async ({ canvas, userEvent, args }) => {
		const field = canvas.getByRole('textbox', { name: 'Сообщение' })
		await userEvent.type(field, '@Ма')
		const mentions = await canvas.findByRole('listbox', { name: 'Участники для упоминания' })
		const maria = within(mentions).getByRole('option', { name: new RegExp(MARIA.name) })
		await expect(field).toHaveAttribute('aria-activedescendant', maria.id)
		await userEvent.keyboard('{Escape}')
		await expect(canvas.queryByRole('listbox')).not.toBeInTheDocument()

		await userEvent.clear(field)
		await userEvent.type(field, '/')
		const commands = await canvas.findByRole('listbox', { name: 'Команды чата' })
		await userEvent.keyboard('{ArrowDown}')
		await expect(within(commands).getByRole('option', { name: /\/status/ })).toHaveAttribute('aria-selected', 'true')
		await userEvent.keyboard('{Enter}')
		await expect(args.onSend).toHaveBeenCalledWith(expect.objectContaining({ text: '/status' }))
	},
}

// ─── Доступность ───────────────────────────────────────────────────────────────

/**
 * Клавиатура: действия сообщения доступны по Tab (панель действий появляется при фокусе), «Другие действия» открывает
 * меню — фокус на первом пункте, стрелки и Home/End перемещают, Escape закрывает и возвращает фокус на кнопку.
 * В поле ввода Enter отправляет сообщение.
 */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	args: { messages: PRIVATE_MESSAGES.slice(0, 2), quickReplies: [] },
	play: async ({ canvas, canvasElement, userEvent, args }) => {
		const more = within(getMessage(canvasElement, 'p2')).getByRole('button', { name: 'Другие действия с сообщением' })
		await tabTo(more, userEvent, 30)
		await userEvent.keyboard('{Enter}')
		const menu = await screen.findByRole('menu', { name: 'Действия с сообщением' })
		const items = within(menu).getAllByRole('menuitem')
		await waitFor(() => expect(items[0]).toHaveFocus())
		await userEvent.keyboard('{End}')
		await expect(within(menu).getByRole('menuitem', { name: 'Удалить' })).toHaveFocus()
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
		await expect(more).toHaveFocus()

		const field = canvas.getByRole('textbox', { name: 'Сообщение' })
		await tabTo(field, userEvent)
		await userEvent.keyboard('Созвонимся в 15:00?{Enter}')
		await expect(args.onSend).toHaveBeenCalledWith(expect.objectContaining({ text: 'Созвонимся в 15:00?' }))
	},
}
