import { en } from '../en'
import { ja } from '../ja'
import { kk } from '../kk'
import { ru } from '../ru'
import { uz } from '../uz'
import { zh } from '../zh'
import { localized } from '../localized'
import { defineLocale, formatMessage, setLocale } from '../state'

afterEach(() => {
	setLocale('ru')
})

describe('составные подписи — целые шаблоны', () => {
	it('русский: порядок слов и значения', () => {
		const rating = localized('rating')
		expect(formatMessage(rating.VALUE_LABEL, { value: '4,5', max: 5 })).toBe('Оценка 4,5 из 5')
		expect(formatMessage(rating.VALUE_OF_MAX, { value: '4,5', max: 5 })).toBe('4,5 из 5')
		expect(formatMessage(rating.RANGE_LABEL, { max: 5 })).toBe('Оценка от 0 до 5')
		expect(formatMessage(localized('chat').TYPING, { name: 'Анна' })).toBe('Анна печатает')
		expect(formatMessage(localized('chat').PINNED_POSITION, { index: 1, total: 3 })).toBe('1 из 3')
		expect(formatMessage(localized('text').DELETE_ITEM, { name: 'отчёт.pdf' })).toBe('Удалить отчёт.pdf')
		expect(formatMessage(localized('text').FILE_MAX_SIZE, { size: 5 })).toBe('до 5 МБ')
	})

	it('казахский, узбекский, японский — своя грамматика, а не склейка кусков в русском порядке', () => {
		setLocale(kk)
		expect(formatMessage(localized('rating').VALUE_OF_MAX, { value: '4,5', max: 5 })).toBe('5 ішінен 4,5')
		expect(formatMessage(localized('chat').PINNED_POSITION, { index: 1, total: 3 })).toBe('3 ішінен 1')
		expect(formatMessage(localized('text').DELETE_ITEM, { name: 'Айдос' })).toBe('Айдос жою')
		setLocale(uz)
		expect(formatMessage(localized('rating').VALUE_OF_MAX, { value: '4,5', max: 5 })).toBe('5 dan 4,5')
		expect(formatMessage(localized('chat').TYPING, { name: 'Aziz' })).toBe('Aziz yozmoqda')
		setLocale(ja)
		expect(formatMessage(localized('rating').VALUE_OF_MAX, { value: '4.5', max: 5 })).toBe('5 点中 4.5 点')
		expect(formatMessage(localized('chat').DOWNLOAD_FILE_NAMED, { name: 'a.pdf' })).toBe('ファイル a.pdf をダウンロード')
		expect(formatMessage(localized('text').DELETE_ITEM, { name: 'メモ' })).toBe('メモ を削除')
	})

	it.each([ru, en, kk, uz, zh, ja])('словарь $code: прежних ключей-кусков нет, новые шаблоны с местами для значений', locale => {
		const rating = locale.rating as Record<string, string | undefined>
		const chat = locale.chat as Record<string, string | undefined>
		expect(rating.OF).toBeUndefined()
		expect(rating.ARIA_PREFIX).toBeUndefined()
		expect(chat.TYPING_SUFFIX).toBeUndefined()
		expect(chat.PINNED_COUNTER).toBeUndefined()
		expect(locale.rating.VALUE_LABEL).toContain('{value}')
		expect(locale.rating.VALUE_LABEL).toContain('{max}')
		expect(locale.chat.TYPING).toContain('{name}')
		expect(locale.text.DELETE_ITEM).toContain('{name}')
	})
})

describe('прежние ключи-куски, заданные приложением', () => {
	it('rating.OF и ARIA_PREFIX собирают подпись по-старому', () => {
		setLocale(defineLocale(en, { rating: { OF: 'out of', LABEL: 'Score', ARIA_PREFIX: 'Score up to' } }))
		const rating = localized('rating')
		expect(formatMessage(rating.VALUE_LABEL, { value: 4, max: 5 })).toBe('Score 4 out of 5')
		expect(formatMessage(rating.VALUE_OF_MAX, { value: 4, max: 5 })).toBe('4 out of 5')
		expect(formatMessage(rating.RANGE_LABEL, { max: 5 })).toBe('Score up to 5')
	})

	it('чат: «печатает», счётчик закрепа, «Выбрано», профиль, скачивание, действия, быстрый ответ, вложение, реакция', () => {
		setLocale(
			defineLocale(ru, {
				chat: {
					TYPING_SUFFIX: 'набирает',
					PINNED_COUNTER: '/',
					SELECTED_PREFIX: 'Отмечено:',
					PROFILE_ARIA: 'Карточка',
					ADD_REACTION: 'Реакция',
					DOWNLOAD_IMAGE: 'Загрузить картинку',
					DOWNLOAD_FILE: 'Загрузить файл',
					MEMBER_ACTIONS: 'Меню',
					QUICK_REPLY: 'Ответ',
					REMOVE_ATTACHMENT: 'Убрать',
				},
			}),
		)
		const chat = localized('chat')
		expect(formatMessage(chat.TYPING, { name: 'Анна' })).toBe('Анна набирает')
		expect(formatMessage(chat.PINNED_POSITION, { index: 2, total: 5 })).toBe('2 / 5')
		expect(formatMessage(chat.SELECTED_COUNT, { count: 3 })).toBe('Отмечено: 3')
		expect(formatMessage(chat.PROFILE_OF, { name: 'Анна' })).toBe('Карточка Анна')
		expect(formatMessage(chat.ADD_REACTION_EMOJI, { emoji: '👍' })).toBe('Реакция 👍')
		expect(formatMessage(chat.DOWNLOAD_IMAGE_NAMED, { name: 'a.png' })).toBe('Загрузить картинку a.png')
		expect(formatMessage(chat.DOWNLOAD_FILE_NAMED, { name: 'a.pdf' })).toBe('Загрузить файл a.pdf')
		expect(formatMessage(chat.MEMBER_ACTIONS_NAMED, { name: 'Анна' })).toBe('Меню Анна')
		expect(formatMessage(chat.QUICK_REPLY_NAMED, { reply: 'Да' })).toBe('Ответ Да')
		expect(formatMessage(chat.REMOVE_ATTACHMENT_NAMED, { name: 'a.pdf' })).toBe('Убрать a.pdf')
	})

	it('размер файла собирается из двух прежних ключей, одного недостаточно', () => {
		setLocale(defineLocale(ru, { text: { FILE_MAX_SIZE_PREFIX: 'максимум', FILE_MAX_SIZE_SUFFIX: 'мегабайт' } }))
		expect(formatMessage(localized('text').FILE_MAX_SIZE, { size: 5 })).toBe('максимум 5 мегабайт')
		setLocale(defineLocale(ru, { text: { FILE_MAX_SIZE_PREFIX: 'максимум' } }))
		expect(formatMessage(localized('text').FILE_MAX_SIZE, { size: 5 })).toBe('до 5 МБ')
	})

	it('прежний ключ виден через перечисление и getOwnPropertyDescriptor раздела', () => {
		setLocale(defineLocale(ru, { rating: { OF: 'из' } }))
		const rating = localized('rating')
		expect(Object.getOwnPropertyDescriptor(rating, 'VALUE_OF_MAX')?.value).toBe('{value} из {max}')
		expect(Object.getOwnPropertyDescriptor(rating, 'LABEL')?.value).toBe('Оценка')
		expect(Object.keys(rating)).toContain('OF')
	})

	it('служебные имена (constructor, toString) не принимаются за ключи', () => {
		const chat = localized('chat') as unknown as Record<string, unknown>
		expect(chat.constructor).toBe(Object)
		expect(typeof chat.toString).toBe('function')
		expect(chat.NO_SUCH_KEY).toBeUndefined()
	})
})
