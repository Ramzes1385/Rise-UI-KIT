import { ref, watch } from 'vue'
import type { VoiceRecording } from '@components/BaseVoiceRecorder'
import { storyDate, STORY_IMAGES, STORY_USERS, STORY_TODAY } from '@/stories/helpers'
import type { ChatBadge, ChatMessage, ChatMessageAttachment, ChatMember, ChatCommand } from '../types/BaseChat.types'

const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']

export function timeOf(date: Date): string {
	return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export function sentAt(hours: number, minutes: number, days = 0): Pick<ChatMessage, 'time' | 'date'> {
	const date = storyDate(days, hours, minutes)
	return { time: timeOf(date), date: `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}` }
}

export function storyFile(id: string, name: string, size: string): ChatMessageAttachment {
	return { id, name, size, type: 'file', url: `data:text/plain;charset=utf-8,${encodeURIComponent(`Файл ${name} из примера BaseChat`)}` }
}

export function storyImage(id: string, index: number, name: string): ChatMessageAttachment {
	return { id, name, type: 'image', url: STORY_IMAGES[index].src }
}

const [ANNA, IVAN, MARIA, OLEG] = STORY_USERS

export { ANNA, IVAN, MARIA }

export const PRIVATE_MESSAGES: ChatMessage[] = [
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

const VERIFIED: ChatBadge = { id: 'verified', label: 'Подтверждённый аккаунт', icon: 'check-circle', color: 'var(--rise-info)' }

export const MEMBER_BADGES: Record<string, ChatBadge[]> = {
	u1: [
		VERIFIED,
		{ id: 'design-system', label: 'Автор дизайн-системы', emoji: '🎨' },
		{ id: 'reviewer', label: 'Лучший ревьюер месяца', emoji: '🏆' },
		{ id: 'streak', label: '100 дней подряд в чате', emoji: '🔥' },
		{ id: 'releases', label: 'Выпустила 10 релизов', emoji: '🚀' },
	],
	u2: [VERIFIED, { id: 'bug-hunter', label: 'Нашёл 50 багов', emoji: '🐞' }],
	u3: [{ id: 'mentor', label: 'Наставник новичков', icon: 'star-filled', color: 'var(--rise-warning)' }],
}

const MEMBERS: ChatMember[] = [
	{ id: 'u1', name: ANNA.name, avatar: ANNA.avatar, role: 'admin', status: 'online', badges: MEMBER_BADGES.u1 },
	{ id: 'u2', name: IVAN.name, avatar: IVAN.avatar, role: 'member', status: 'online', warningsCount: 0, badges: MEMBER_BADGES.u2 },
	{ id: 'u3', name: MARIA.name, avatar: MARIA.avatar, role: 'member', status: 'offline', warningsCount: 1, badges: MEMBER_BADGES.u3 },
	{ id: 'u4', name: OLEG.name, avatar: OLEG.avatar, role: 'member', status: 'offline' },
]

export const GROUP_MESSAGES: ChatMessage[] = [
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

export const COMMANDS: ChatCommand[] = [
	{ name: 'tasks', description: 'Список задач релиза' },
	{ name: 'status', description: 'Статус сборки' },
	{ name: 'mute', description: 'Выключить уведомления' },
]

export const PRIVATE_CHAT = {
	title: ANNA.name,
	subtitle: 'в сети',
	avatar: ANNA.avatar,
	description: 'Дизайнер интерфейсов: отвечает за дизайн-систему и макеты продукта.',
}

export const GROUP_CHAT = {
	title: 'Команда дизайн-системы',
	subtitle: '4 участника',
	avatar: undefined,
	description: 'Рабочий чат команды: релизы, ревью компонентов и задачи на неделю.',
	isGroup: true,
	members: MEMBERS,
}

export const SHOWCASE_MESSAGES: ChatMessage[] = [
	PRIVATE_MESSAGES[0],
	PRIVATE_MESSAGES[1],
	{ ...PRIVATE_MESSAGES[3], replyToId: 'p1', replyToText: PRIVATE_MESSAGES[0].text, id: 's3' },
]

const NOW = timeOf(STORY_TODAY)

type SendPayload = { text: string; attachments?: ChatMessageAttachment[]; replyToId?: string }

export const CHAT_SCRIPT = `
type SendPayload = { text: string; attachments?: ChatMessage['attachments']; replyToId?: string }

function update(id: string, patch: (message: ChatMessage) => Partial<ChatMessage>): void {
	messages.value = messages.value.map(message => (message.id === id ? { ...message, ...patch(message) } : message))
}

function send({ text, attachments, replyToId }: SendPayload): void {
	const quoted = messages.value.find(message => message.id === replyToId)
	messages.value = [
		...messages.value,
		{
			id: \`new-\${messages.value.length + 1}\`,
			sender: 'me',
			text,
			attachments,
			status: 'sent',
			time: '${NOW}',
			replyToId: quoted?.id,
			replyToText: quoted?.text,
			replyToSenderName: quoted ? (quoted.senderName ?? 'Вы') : undefined,
		},
	]
}

function sendVoice({ recording, replyToId }: { recording: VoiceRecording; replyToId?: string }): void {
	send({
		text: '',
		replyToId,
		attachments: [
			{
				id: \`voice-\${messages.value.length + 1}\`,
				name: 'voice.webm',
				type: 'audio',
				url: URL.createObjectURL(recording.blob),
				duration: recording.duration,
				peaks: recording.peaks,
			},
		],
	})
}

function react({ messageId, emoji }: { messageId: string; emoji: string }): void {
	update(messageId, message => {
		const reactions = message.reactions ?? []
		const current = reactions.find(reaction => reaction.emoji === emoji)
		if (!current) return { reactions: [...reactions, { emoji, users: ['me'] }] }
		const users = current.users.includes('me') ? current.users.filter(user => user !== 'me') : [...current.users, 'me']
		if (users.length === 0) return { reactions: reactions.filter(reaction => reaction.emoji !== emoji) }
		return { reactions: reactions.map(reaction => (reaction.emoji === emoji ? { ...reaction, users } : reaction)) }
	})
}

function remove(ids: string[]): void {
	messages.value = messages.value.filter(message => !ids.includes(message.id))
}

function pin(id: string): void {
	update(id, message => ({ isPinned: !message.isPinned }))
}

function unpin(id: string): void {
	update(id, () => ({ isPinned: false }))
}
`

export function useStoryMessages(args: { messages: ChatMessage[] }) {
	const messages = ref<ChatMessage[]>([...args.messages])
	watch(
		() => args.messages,
		value => {
			messages.value = [...value]
		},
	)

	function update(id: string, patch: (message: ChatMessage) => Partial<ChatMessage>): void {
		messages.value = messages.value.map(message => (message.id === id ? { ...message, ...patch(message) } : message))
	}

	function send({ text, attachments, replyToId }: SendPayload): void {
		const quoted = messages.value.find(message => message.id === replyToId)
		messages.value = [
			...messages.value,
			{
				id: `new-${messages.value.length + 1}`,
				sender: 'me',
				text,
				attachments,
				status: 'sent',
				time: NOW,
				replyToId: quoted?.id,
				replyToText: quoted?.text,
				replyToSenderName: quoted ? (quoted.senderName ?? 'Вы') : undefined,
			},
		]
	}

	function sendVoice({ recording, replyToId }: { recording: VoiceRecording; replyToId?: string }): void {
		send({
			text: '',
			replyToId,
			attachments: [
				{
					id: `voice-${messages.value.length + 1}`,
					name: 'voice.webm',
					type: 'audio',
					url: URL.createObjectURL(recording.blob),
					duration: recording.duration,
					peaks: recording.peaks,
				},
			],
		})
	}

	function react({ messageId, emoji }: { messageId: string; emoji: string }): void {
		update(messageId, message => {
			const reactions = message.reactions ?? []
			const current = reactions.find(reaction => reaction.emoji === emoji)
			if (!current) return { reactions: [...reactions, { emoji, users: ['me'] }] }
			const users = current.users.includes('me') ? current.users.filter(user => user !== 'me') : [...current.users, 'me']
			if (users.length === 0) return { reactions: reactions.filter(reaction => reaction.emoji !== emoji) }
			return { reactions: reactions.map(reaction => (reaction.emoji === emoji ? { ...reaction, users } : reaction)) }
		})
	}

	function remove(ids: string[]): void {
		messages.value = messages.value.filter(message => !ids.includes(message.id))
	}

	function pin(id: string): void {
		update(id, message => ({ isPinned: !message.isPinned }))
	}

	function unpin(id: string): void {
		update(id, () => ({ isPinned: false }))
	}

	return { messages, send, sendVoice, react, remove, pin, unpin }
}

export function getMessage(canvasElement: HTMLElement, id: string): HTMLElement {
	return canvasElement.querySelector<HTMLElement>(`#message-${id}`) as HTMLElement
}
