import { describe, expect, it } from 'vitest'
import { useMessageParser } from '../useMessageParser'

describe('useMessageParser', () => {
	describe('parseMessageText', () => {
		it('должен возвращать пустой массив для пустой строки', () => {
			const { parseMessageText } = useMessageParser()
			expect(parseMessageText('')).toEqual([])
		})

		it('должен распознавать обычный текст как один токен', () => {
			const { parseMessageText } = useMessageParser()
			expect(parseMessageText('Привет мир')).toEqual([{ type: 'text', value: 'Привет мир' }])
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
			expect(parseMessageText('путь/к/файлу')).toEqual([{ type: 'text', value: 'путь/к/файлу' }])
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

	describe('parseMessageText: Unicode и границы', () => {
		const { parseMessageText } = useMessageParser()

		it('email не считается упоминанием', () => {
			expect(parseMessageText('пиши на user@example.com')).toEqual([{ type: 'text', value: 'пиши на user@example.com' }])
		})

		it('упоминание после email-подобного слова в той же строке остаётся упоминанием', () => {
			expect(parseMessageText('user@example.com и @anna')).toEqual([
				{ type: 'text', value: 'user@example.com и ' },
				{ type: 'mention', value: '@anna' },
			])
		})

		it.each(['@Іванка', '@Їжак', '@Євген', '@Анна', '@müller'])('распознаёт упоминание %s', mention => {
			expect(parseMessageText(`Привіт ${mention}`)).toEqual([
				{ type: 'text', value: 'Привіт ' },
				{ type: 'mention', value: mention },
			])
		})

		it.each(['/допомога', '/їсти', '/єдиний', '/café'])('распознаёт команду %s', command => {
			expect(parseMessageText(`Тут ${command}`)).toEqual([
				{ type: 'text', value: 'Тут' },
				{ type: 'text', value: ' ' },
				{ type: 'command', value: command },
			])
		})

		it.each(['.', ',', ';', ':', '!', '?', ')', '»', '”', '"', "'", '?!'])('хвостовая пунктуация %s не входит в ссылку', tail => {
			expect(parseMessageText(`Смотри https://example.com/a${tail} Дальше`)).toEqual([
				{ type: 'text', value: 'Смотри ' },
				{ type: 'link', value: 'https://example.com/a' },
				{ type: 'text', value: `${tail} Дальше` },
			])
		})

		it('пунктуация внутри ссылки сохраняется', () => {
			expect(parseMessageText('https://example.com/a.b?x=1,2')).toEqual([{ type: 'link', value: 'https://example.com/a.b?x=1,2' }])
		})

		it('ссылка в конце строки с точкой', () => {
			expect(parseMessageText('Сайт https://example.com.')).toEqual([
				{ type: 'text', value: 'Сайт ' },
				{ type: 'link', value: 'https://example.com' },
				{ type: 'text', value: '.' },
			])
		})

		it.each(['Https://example.com', 'HTTPS://EXAMPLE.COM', 'hTTp://example.com'])('схема в любом регистре: %s — ссылка', url => {
			expect(parseMessageText(`Открой ${url}, пожалуйста`)).toEqual([
				{ type: 'text', value: 'Открой ' },
				{ type: 'link', value: url },
				{ type: 'text', value: ', пожалуйста' },
			])
		})

		it.each(['\n', '\t'])('команда после %j отдаёт пробельный символ отдельным текстом, а command — без него', whitespace => {
			expect(parseMessageText(`Строка${whitespace}/start`)).toEqual([
				{ type: 'text', value: 'Строка' },
				{ type: 'text', value: whitespace },
				{ type: 'command', value: '/start' },
			])
		})

		it('команда в самом начале текста', () => {
			expect(parseMessageText('/start now')).toEqual([
				{ type: 'command', value: '/start' },
				{ type: 'text', value: ' now' },
			])
		})
	})

	describe('parseMessageText: скобки и длинные строки', () => {
		const { parseMessageText } = useMessageParser()

		it('парная скобка в конце адреса остаётся в ссылке (GFM)', () => {
			expect(parseMessageText('см. https://ru.wikipedia.org/wiki/Foo_(bar) там')).toEqual([
				{ type: 'text', value: 'см. ' },
				{ type: 'link', value: 'https://ru.wikipedia.org/wiki/Foo_(bar)' },
				{ type: 'text', value: ' там' },
			])
		})

		it('точка после парной скобки отрезается, скобка остаётся', () => {
			expect(parseMessageText('https://ru.wikipedia.org/wiki/Foo_(bar).')).toEqual([
				{ type: 'link', value: 'https://ru.wikipedia.org/wiki/Foo_(bar)' },
				{ type: 'text', value: '.' },
			])
		})

		it('ссылка в скобках предложения теряет только внешнюю скобку', () => {
			expect(parseMessageText('(смотри https://example.com/a)')).toEqual([
				{ type: 'text', value: '(смотри ' },
				{ type: 'link', value: 'https://example.com/a' },
				{ type: 'text', value: ')' },
			])
		})

		it('схема без адреса и адрес из одних знаков препинания — не ссылки', () => {
			expect(parseMessageText('https:// и https://.')).toEqual([{ type: 'text', value: 'https:// и https://.' }])
		})

		it('упоминание после буквы суррогатной пары не считается упоминанием', () => {
			expect(parseMessageText('\u{1D4D0}@anna')).toEqual([{ type: 'text', value: '\u{1D4D0}@anna' }])
		})

		it('строка в 50 000 символов разбирается без зависания', () => {
			const text = `${'a'.repeat(50_000)} https://example.com/${'b'.repeat(50_000)}`
			const tokens = parseMessageText(text)
			expect(tokens).toHaveLength(2)
			expect(tokens[1]).toEqual({ type: 'link', value: `https://example.com/${'b'.repeat(50_000)}` })
		})

		it('ссылка из 50 000 знаков «хвоста» и длинный ряд «@» разбираются без зависания', () => {
			const text = `https://example.com/${'.)'.repeat(25_000)} @anna ${'@'.repeat(10_000)}`
			expect(parseMessageText(text)[0]).toEqual({ type: 'link', value: 'https://example.com/' })
		})
	})

	describe('getHighlightedParts', () => {
		it('должен возвращать текст как единую часть без поискового запроса', () => {
			const { getHighlightedParts } = useMessageParser()
			expect(getHighlightedParts('Привет мир')).toEqual([{ text: 'Привет мир', isMatch: false }])
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
