/**
 * Unit-тесты для composable useMessageParser.
 * Проверяют разбор текста сообщения и подсветку поисковых совпадений.
 */

import { describe, expect, it } from 'vitest'
import { useMessageParser } from './useMessageParser'

describe('useMessageParser', () => {
	describe('parseMessageText', () => {
		it('должен возвращать пустой массив для пустой строки', () => {
			const { parseMessageText } = useMessageParser()
			expect(parseMessageText('')).toEqual([])
		})

		it('должен распознавать обычный текст как один токен', () => {
			const { parseMessageText } = useMessageParser()
			expect(parseMessageText('Привет мир')).toEqual([
				{ type: 'text', value: 'Привет мир' },
			])
		})

		it('должен распознавать ссылку', () => {
			const { parseMessageText } = useMessageParser()
			expect(parseMessageText('Смотри https://example.com')).toEqual([
				{ type: 'text', value: 'Смотри ' },
				{ type: 'link', value: 'https://example.com' },
			])
		})

		it('должен распознавать @упоминание', () => {
			const { parseMessageText } = useMessageParser()
			expect(parseMessageText('Привет @user_123')).toEqual([
				{ type: 'text', value: 'Привет ' },
				{ type: 'mention', value: '@user_123' },
			])
		})

		it('должен распознавать /команду в начале слова', () => {
			const { parseMessageText } = useMessageParser()
			expect(parseMessageText('Используй /help')).toEqual([
				{ type: 'text', value: 'Используй' },
				{ type: 'text', value: ' ' },
				{ type: 'command', value: '/help' },
			])
		})

		it('не должен распознавать слеш в середине слова как команду', () => {
			const { parseMessageText } = useMessageParser()
			expect(parseMessageText('путь/к/файлу')).toEqual([
				{ type: 'text', value: 'путь/к/файлу' },
			])
		})

		it('должен обрабатывать смесь токенов', () => {
			const { parseMessageText } = useMessageParser()
			const result = parseMessageText('@admin смотри https://example.com и выполни /start')
			expect(result).toEqual([
				{ type: 'mention', value: '@admin' },
				{ type: 'text', value: ' смотри ' },
				{ type: 'link', value: 'https://example.com' },
				{ type: 'text', value: ' и выполни' },
				{ type: 'text', value: ' ' },
				{ type: 'command', value: '/start' },
			])
		})
	})

	describe('getHighlightedParts', () => {
		it('должен возвращать текст как единую часть без поискового запроса', () => {
			const { getHighlightedParts } = useMessageParser()
			expect(getHighlightedParts('Привет мир')).toEqual([
				{ text: 'Привет мир', isMatch: false },
			])
		})

		it('должен подсвечивать совпадения', () => {
			const { getHighlightedParts } = useMessageParser({ searchQuery: 'мир' })
			expect(getHighlightedParts('Привет мир')).toEqual([
				{ text: 'Привет ', isMatch: false },
				{ text: 'мир', isMatch: true },
			])
		})

		it('должен быть регистронезависимым', () => {
			const { getHighlightedParts } = useMessageParser({ searchQuery: 'МИР' })
			expect(getHighlightedParts('Привет мир')).toEqual([
				{ text: 'Привет ', isMatch: false },
				{ text: 'мир', isMatch: true },
			])
		})

		it('должен поддерживать getter-функцию для поискового запроса', () => {
			const { getHighlightedParts } = useMessageParser({ searchQuery: () => 'мир' })
			expect(getHighlightedParts('Привет мир')).toEqual([
				{ text: 'Привет ', isMatch: false },
				{ text: 'мир', isMatch: true },
			])
		})
	})
})
