import { ja } from '../ja'
import { zh } from '../zh'
import { UI_TEXT } from '../messages'
import { foldSearchText } from '@utils/data/textUtils'
import { formatMessage, formatNumber, getLocale, pluralize, registerLocale, setLocale } from '../state'
import { formatDate, formatMultiple, formatPopoverDate, formatRange, formatRelativeTime } from '@utils/data/dateUtils'

describe('китайский и японский языки', () => {
	beforeAll(() => {
		registerLocale(zh)
		registerLocale(ja)
	})

	afterEach(() => {
		setLocale('ru')
	})

	it.each([
		{ code: 'zh', locale: zh, cancel: '取消', empty: '暂无数据' },
		{ code: 'ja', locale: ja, cancel: 'キャンセル', empty: 'データがありません' },
	] as const)('setLocale($code) переключает словарь, UI_TEXT следует за языком', ({ code, locale, cancel, empty }) => {
		setLocale(code)

		expect(getLocale()).toBe(locale)
		expect(locale.code).toBe(code)
		expect(UI_TEXT.CANCEL).toBe(cancel)
		expect(UI_TEXT.EMPTY).toBe(empty)
	})

	it.each([
		{ code: 'zh', locale: zh, range: '第 1–10 条，共 250 条', tooLarge: '文件“a.png”超过 5 MB' },
		{ code: 'ja', locale: ja, range: '1–10 件 / 全 250 件', tooLarge: 'ファイル「a.png」が 5 MB を超えています' },
	] as const)('$code: подстановки {name} работают, без пробелов вокруг кавычек', ({ locale, range, tooLarge }) => {
		expect(formatMessage(locale.text.PAGE_RANGE, { from: 1, to: 10, total: 250 })).toBe(range)
		expect(formatMessage(locale.text.FILE_TOO_LARGE, { name: 'a.png', size: 5 })).toBe(tooLarge)
	})

	it.each([
		['zh', zh],
		['ja', ja],
	] as const)('%s: по CLDR только форма other, для любых чисел', (_code, locale) => {
		const rules = new Intl.PluralRules(locale.intl)
		expect([0, 1, 2, 5, 21, 1.5].map(count => rules.select(count))).toEqual(Array(6).fill('other'))
		expect(rules.resolvedOptions().pluralCategories).toEqual(['other'])
		for (const forms of Object.values(locale.plural)) expect(Object.keys(forms)).toEqual(['other'])
	})

	it.each([
		[zh, 1, '1 位成员'],
		[zh, 3, '3 位成员'],
		[zh, 1234, '1,234 位成员'],
		[ja, 1, '1 人のメンバー'],
		[ja, 3, '3 人のメンバー'],
		[ja, 1234, '1,234 人のメンバー'],
	] as const)('pluralize: %#', (locale, count, expected) => {
		expect(pluralize(locale.plural.PARTICIPANTS, count, locale)).toBe(expected)
	})

	it('число в формате языка', () => {
		expect(formatNumber(1234567.5, undefined, zh)).toBe('1,234,567.5')
		expect(formatNumber(1234567.5, undefined, ja)).toBe('1,234,567.5')
		expect(formatNumber(0.25, { style: 'percent' }, ja)).toBe('25%')
		expect(formatNumber(1234.5, { style: 'currency', currency: 'CNY' }, zh)).toBe('¥1,234.50')
		expect(formatNumber(1234.5, { style: 'currency', currency: 'JPY' }, ja)).toMatch(/^[¥￥]1,235$/)
	})

	it('дата: порядок «год-месяц-день» и названия месяцев, дней недели — на языке', () => {
		const date = new Date(2026, 9, 16)
		const long = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' } as const

		expect(new Intl.DateTimeFormat(zh.intl, long).format(date)).toBe('2026年10月16日星期五')
		expect(new Intl.DateTimeFormat(ja.intl, long).format(date)).toBe('2026年10月16日金曜日')
	})

	it('утилиты дат: числовой формат, диапазон, всплывающая дата и относительное время — на языке', () => {
		const start = new Date(2026, 9, 1)
		const end = new Date(2026, 9, 16)
		const options = { dateFormat: 'dd.MM.yyyy' as const, showTime: false, showSeconds: false, is24Hour: true }

		expect(formatDate({ ...options, date: end, locale: 'zh-CN' })).toBe('2026/10/16')
		expect(formatRange({ ...options, start, end, locale: 'ja-JP' })).toBe('2026/10/01 — 2026/10/16')
		expect(formatPopoverDate({ date: end, locale: 'zh-CN' })).toBe('2026年10月16日星期五')
		expect(formatPopoverDate({ date: end, locale: 'ja-JP' })).toBe('2026年10月16日金曜日')
		expect(formatRelativeTime(new Date(2026, 9, 15), { now: end, locale: 'zh-CN' })).toBe('昨天')
		expect(formatRelativeTime(new Date(2026, 9, 15), { now: end, locale: 'ja-JP' })).toBe('昨日')
	})

	it('выбор нескольких дат: больше трёх — счётная строка языка', () => {
		const dates = [1, 2, 3, 4].map(day => new Date(2026, 9, day))
		const options = { dateFormat: 'dd.MM.yyyy' as const, showTime: false, showSeconds: false, is24Hour: true, locale: 'zh-CN' }

		setLocale('zh')
		expect(formatMultiple({ ...options, dates })).toBe('已选 4 个日期')
		setLocale('ja')
		expect(formatMultiple({ ...options, dates })).toBe('4 件の日付を選択中')
	})

	it('поиск без различия регистра работает на иероглифах и кане', () => {
		expect(foldSearchText('日本語テキスト')).toBe('日本語テキスト')
		expect(foldSearchText('你好，World')).toBe('你好，world')
		expect(foldSearchText('ひらがな カタカナ').includes(foldSearchText('カタカナ'))).toBe(true)
		expect(foldSearchText('中文搜索').includes(foldSearchText('文搜'))).toBe(true)
	})
})
