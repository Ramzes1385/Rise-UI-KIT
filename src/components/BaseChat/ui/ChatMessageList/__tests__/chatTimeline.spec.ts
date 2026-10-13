import { setLocale } from '@/locales/state'
import { UI_CHAT_TEXT } from '@/locales/messages'
import type { ChatMessage } from '../../../types/BaseChat.types'
import { buildChatTimeline } from '../model/timeline/chatTimeline'
import type { ChatTimelineItem } from '../types/timeline/ChatTimeline.types'

const TODAY = new Date(2026, 2, 10, 15, 0)

function msg(id: string, createdAt?: ChatMessage['createdAt'], sender: ChatMessage['sender'] = 'other'): ChatMessage {
	return { id, text: `Сообщение ${id}`, sender, time: '10:00', createdAt }
}

function summary(items: ChatTimelineItem[]): string[] {
	return items.map(item => (item.type === 'message' ? `m:${item.key}` : `${item.type}:${item.label}`))
}

afterEach(() => {
	setLocale('ru')
	vi.useRealTimers()
})

describe('buildChatTimeline', () => {
	it('без createdAt разделителей дат нет', () => {
		const items = buildChatTimeline({ messages: [msg('1'), msg('2')], today: TODAY })

		expect(summary(items)).toEqual(['m:1', 'm:2'])
	})

	it('разделитель дат ставится один раз на день перед первым сообщением дня', () => {
		const items = buildChatTimeline({
			messages: [msg('1', new Date(2026, 2, 10, 9)), msg('2', new Date(2026, 2, 10, 23, 59)), msg('3', new Date(2026, 2, 9, 12))],
			today: TODAY,
		})

		expect(summary(items)).toEqual([`date:${UI_CHAT_TEXT.TODAY}`, 'm:1', 'm:2', `date:${UI_CHAT_TEXT.YESTERDAY}`, 'm:3'])
	})

	it('подпись «Сегодня» и «Вчера» считается от начала дня today, а не от разницы в 24 часа', () => {
		const items = buildChatTimeline({
			messages: [msg('1', new Date(2026, 2, 9, 23, 59)), msg('2', new Date(2026, 2, 10, 0, 1))],
			today: new Date(2026, 2, 10, 0, 30),
		})

		expect(summary(items)).toEqual([`date:${UI_CHAT_TEXT.YESTERDAY}`, 'm:1', `date:${UI_CHAT_TEXT.TODAY}`, 'm:2'])
	})

	it('старая дата выводится по языку кита, а год — только если он не текущий', () => {
		const items = buildChatTimeline({
			messages: [msg('1', new Date(2025, 2, 5, 12)), msg('2', new Date(2026, 2, 5, 12))],
			today: TODAY,
		})
		const labels = items.filter(item => item.type === 'date').map(item => item.label)

		expect(labels[0]).toMatch(/5 марта 2025/)
		expect(labels[1]).toMatch(/5 марта/)
		expect(labels[1]).not.toMatch(/2026/)
	})

	it('дата и «Сегодня» на английском', () => {
		setLocale('en')
		const items = buildChatTimeline({
			messages: [msg('1', new Date(2025, 2, 5, 12)), msg('2', new Date(2026, 2, 5, 12)), msg('3', new Date(2026, 2, 10, 8))],
			today: TODAY,
		})
		const labels = items.filter(item => item.type === 'date').map(item => item.label)

		expect(labels[0]).toMatch(/March 5, 2025/)
		expect(labels[1]).toMatch(/March 5/)
		expect(labels[1]).not.toMatch(/2026/)
		expect(labels[2]).toBe('Today')
	})

	it('принимает createdAt строкой и числом', () => {
		const items = buildChatTimeline({
			messages: [msg('1', new Date(2026, 2, 9, 12).getTime()), msg('2', '2026-03-10T12:00:00')],
			today: TODAY,
		})

		expect(summary(items)).toEqual([`date:${UI_CHAT_TEXT.YESTERDAY}`, 'm:1', `date:${UI_CHAT_TEXT.TODAY}`, 'm:2'])
	})

	it('некорректная дата разделителя не даёт', () => {
		const items = buildChatTimeline({ messages: [msg('1', 'не дата')], today: TODAY })

		expect(summary(items)).toEqual(['m:1'])
	})

	it('сообщение без createdAt между днями не создаёт и не сбрасывает разделитель', () => {
		const items = buildChatTimeline({
			messages: [msg('1', new Date(2026, 2, 10, 9)), msg('2'), msg('3', new Date(2026, 2, 10, 10))],
			today: TODAY,
		})

		expect(summary(items)).toEqual([`date:${UI_CHAT_TEXT.TODAY}`, 'm:1', 'm:2', 'm:3'])
	})

	it('без today берёт текущий день', () => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date(2026, 5, 1, 12))

		const items = buildChatTimeline({ messages: [msg('1', new Date(2026, 5, 1, 8))] })

		expect(summary(items)).toEqual([`date:${UI_CHAT_TEXT.TODAY}`, 'm:1'])
	})

	describe('непрочитанные', () => {
		const read = [msg('1', undefined, 'me'), msg('2', undefined, 'other')]

		it('разделитель ставится перед первым чужим сообщением после прочитанного', () => {
			const items = buildChatTimeline({
				messages: [...read, msg('3', undefined, 'me'), msg('4'), msg('5')],
				lastReadMessageId: '2',
			})

			expect(summary(items)).toEqual(['m:1', 'm:2', 'm:3', 'unread:2 непрочитанных сообщения', 'm:4', 'm:5'])
		})

		it('подпись склоняется по числу чужих сообщений', () => {
			const one = buildChatTimeline({ messages: [...read, msg('3')], lastReadMessageId: '2' })
			const five = buildChatTimeline({
				messages: [...read, msg('3'), msg('4'), msg('5'), msg('6'), msg('7')],
				lastReadMessageId: '2',
			})

			expect(one.find(item => item.type === 'unread')?.label).toBe('1 непрочитанное сообщение')
			expect(five.find(item => item.type === 'unread')?.label).toBe('5 непрочитанных сообщений')
		})

		it('подпись на английском', () => {
			setLocale('en')
			const one = buildChatTimeline({ messages: [...read, msg('3')], lastReadMessageId: '2' })
			const two = buildChatTimeline({ messages: [...read, msg('3'), msg('4')], lastReadMessageId: '2' })

			expect(one.find(item => item.type === 'unread')?.label).toBe('1 unread message')
			expect(two.find(item => item.type === 'unread')?.label).toBe('2 unread messages')
		})

		it('не показывается, если lastReadMessageId не найден', () => {
			const items = buildChatTimeline({ messages: [...read, msg('3')], lastReadMessageId: 'нет такого' })

			expect(items.some(item => item.type === 'unread')).toBe(false)
		})

		it('не показывается без lastReadMessageId', () => {
			const items = buildChatTimeline({ messages: [...read, msg('3')] })

			expect(items.some(item => item.type === 'unread')).toBe(false)
		})

		it('не показывается, если после прочитанного нет чужих сообщений', () => {
			const items = buildChatTimeline({ messages: [...read, msg('3', undefined, 'me')], lastReadMessageId: '2' })

			expect(items.some(item => item.type === 'unread')).toBe(false)
		})

		it('не показывается, если прочитано последнее сообщение', () => {
			const items = buildChatTimeline({ messages: read, lastReadMessageId: '2' })

			expect(items.some(item => item.type === 'unread')).toBe(false)
		})

		it('стоит после разделителя дат того же сообщения', () => {
			const items = buildChatTimeline({
				messages: [msg('1', new Date(2026, 2, 9, 10)), msg('2', new Date(2026, 2, 10, 10))],
				lastReadMessageId: '1',
				today: TODAY,
			})

			expect(summary(items)).toEqual([
				`date:${UI_CHAT_TEXT.YESTERDAY}`,
				'm:1',
				`date:${UI_CHAT_TEXT.TODAY}`,
				'unread:1 непрочитанное сообщение',
				'm:2',
			])
		})
	})
})
