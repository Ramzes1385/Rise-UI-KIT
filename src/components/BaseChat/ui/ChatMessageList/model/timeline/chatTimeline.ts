import { UI_CHAT_TEXT } from '@/locales/messages'
import { getLocale, pluralize } from '@/locales/state'
import { formatDateText } from '@utils/data/dateFormatUtils'
import type { ChatMessage } from '../../../../types/BaseChat.types'
import type { ChatTimelineItem, ChatTimelineOptions } from '../../types/timeline/ChatTimeline.types'

const DAY_MS = 86_400_000

function startOfDay(value: string | number | Date | undefined): number | null {
	if (value === undefined) return null
	const date = new Date(value)
	return Number.isNaN(date.getTime()) ? null : new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

function dayLabel(day: number, todayStart: number): string {
	const diff = Math.round((todayStart - day) / DAY_MS)
	if (diff === 0) return UI_CHAT_TEXT.TODAY
	if (diff === 1) return UI_CHAT_TEXT.YESTERDAY
	const isSameYear = new Date(day).getFullYear() === new Date(todayStart).getFullYear()
	const format: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: isSameYear ? undefined : 'numeric' }
	return formatDateText(day, format)
}

function findUnread(messages: readonly ChatMessage[], lastReadId: string | undefined): { id: string; count: number } | null {
	if (!lastReadId) return null
	const index = messages.findIndex(message => message.id === lastReadId)
	const unread = index === -1 ? [] : messages.slice(index + 1).filter(message => message.sender === 'other')
	return unread.length > 0 ? { id: unread[0].id, count: unread.length } : null
}

function buildChatTimeline(options: ChatTimelineOptions): ChatTimelineItem[] {
	const { messages, lastReadMessageId, today } = options
	const todayStart = startOfDay(today ?? new Date()) ?? 0
	const unread = findUnread(messages, lastReadMessageId)
	const items: ChatTimelineItem[] = []
	let previousDay: number | null = null
	for (const message of messages) {
		const day = startOfDay(message.createdAt)
		if (day !== null && day !== previousDay) items.push({ type: 'date', key: `date-${day}`, label: dayLabel(day, todayStart) })
		if (day !== null) previousDay = day
		if (unread?.id === message.id) {
			items.push({ type: 'unread', key: 'unread', label: pluralize(getLocale().plural.CHAT_UNREAD, unread.count) })
		}
		items.push({ type: 'message', key: message.id, message })
	}
	return items
}

export { buildChatTimeline }
