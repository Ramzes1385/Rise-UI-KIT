import { kk } from '@/locales/kk'
import { uz } from '@/locales/uz'
import { defineLocale, registerLocale, setLocale } from '@/locales/state'
import {
	clearIntlDataCache,
	createDateFormat,
	formatDateText,
	formatRelativeUnit,
	getMonthNames,
	getNumericDateOrder,
	getWeekdayNames,
	hasIntlData,
} from '../index'

const RealDateTimeFormat = Intl.DateTimeFormat
const WEDNESDAY = new Date(2025, 4, 7, 9, 5)

const OPTION_SETS: Intl.DateTimeFormatOptions[] = [
	{ day: 'numeric', month: 'long', year: 'numeric' },
	{ day: 'numeric', month: 'long' },
	{ month: 'long', year: 'numeric' },
	{ month: 'long' },
	{ month: 'short' },
	{ day: 'numeric', month: 'short', year: 'numeric' },
	{ weekday: 'long' },
	{ weekday: 'short' },
	{ weekday: 'short', day: 'numeric', month: 'short' },
	{ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
	{ day: '2-digit', month: '2-digit', year: 'numeric' },
	{ hour: '2-digit', minute: '2-digit' },
	{ dateStyle: 'full' },
	{ dateStyle: 'long' },
	{ dateStyle: 'short' },
	{ day: 'numeric' },
	{ year: 'numeric' },
]

/** Браузер с урезанным ICU: казахского нет совсем (формат уходит в en-US), у узбекского только корневые данные («M05») */
function stubTruncatedBrowser(): void {
	class TruncatedDateTimeFormat extends RealDateTimeFormat {
		private readonly isRoot: boolean
		private readonly hasMonthName: boolean

		constructor(tag?: string | string[], options?: Intl.DateTimeFormatOptions) {
			const first = Array.isArray(tag) ? tag[0] : tag
			super(first?.startsWith('kk') ? 'en-US' : tag, options)
			this.isRoot = Boolean(first?.startsWith('uz'))
			this.hasMonthName = options?.month === 'long'
		}

		static supportedLocalesOf(tags: string | string[]): string[] {
			return RealDateTimeFormat.supportedLocalesOf(tags).filter(tag => !tag.startsWith('kk'))
		}

		resolvedOptions(): Intl.ResolvedDateTimeFormatOptions {
			return this.isRoot ? { ...super.resolvedOptions(), locale: 'uz' } : super.resolvedOptions()
		}

		format = (date?: Date | number): string => {
			if (this.isRoot && this.hasMonthName) return `M${String(new Date(date ?? 0).getMonth() + 1).padStart(2, '0')}`
			const real = Object.getOwnPropertyDescriptor(RealDateTimeFormat.prototype, 'format')?.get?.call(this) as (
				value?: Date | number,
			) => string
			return real(date)
		}
	}
	vi.stubGlobal('Intl', Object.assign(Object.create(Intl), { DateTimeFormat: TruncatedDateTimeFormat }))
	clearIntlDataCache()
}

function realText(tag: string, options: Intl.DateTimeFormatOptions): string {
	return new RealDateTimeFormat(tag, options).format(WEDNESDAY)
}

afterEach(() => {
	vi.unstubAllGlobals()
	clearIntlDataCache()
	setLocale('ru')
})

describe('hasIntlData', () => {
	it('браузер знает язык — true, у ru, en, ja, zh в Node данные полные', () => {
		for (const tag of ['ru-RU', 'en-US', 'ja-JP', 'zh-CN', 'kk-KZ', 'uz-Latn-UZ']) expect(hasIntlData(tag)).toBe(true)
	})

	it('урезанный браузер: kk нет совсем, у uz корневые данные', () => {
		stubTruncatedBrowser()
		expect(hasIntlData('kk-KZ')).toBe(false)
		expect(hasIntlData('uz-Latn-UZ')).toBe(false)
		expect(hasIntlData('ru-RU')).toBe(true)
		expect(hasIntlData('ja-JP')).toBe(true)
	})

	it('язык заявлен, но форматтер подставляет другой (en-US) — false', () => {
		class SubstitutingDateTimeFormat extends RealDateTimeFormat {
			static supportedLocalesOf(tags: string | string[]): string[] {
				return Array.isArray(tags) ? tags : [tags]
			}

			resolvedOptions(): Intl.ResolvedDateTimeFormatOptions {
				return { ...super.resolvedOptions(), locale: 'en-US' }
			}
		}
		vi.stubGlobal('Intl', Object.assign(Object.create(Intl), { DateTimeFormat: SubstitutingDateTimeFormat }))
		clearIntlDataCache()
		expect(hasIntlData('kk-KZ')).toBe(false)
	})

	it('неверный языковой тег — false, без исключения', () => {
		expect(hasIntlData('not a tag')).toBe(false)
	})

	it('результат запоминается: повторный вызов не пересчитывает', () => {
		const spy = vi.spyOn(Intl.DateTimeFormat, 'supportedLocalesOf')
		hasIntlData('de-DE')
		hasIntlData('de-DE')
		expect(spy).toHaveBeenCalledTimes(1)
		spy.mockRestore()
	})
})

describe.each([
	['kk', 'kk-KZ', kk],
	['uz', 'uz-Latn-UZ', uz],
])('запасные названия %s в браузере без данных языка', (code, tag, locale) => {
	beforeEach(() => {
		registerLocale(locale)
	})

	it.each(OPTION_SETS.map(options => [JSON.stringify(options), options] as const))(
		'формат %s совпадает с данными ICU Node (CLDR)',
		(_name, options) => {
			const expected = realText(tag, options)
			stubTruncatedBrowser()
			expect(createDateFormat(tag, options).format(WEDNESDAY)).toBe(expected)
		},
	)

	it('месяцы и дни недели с воскресенья совпадают с данными ICU Node', () => {
		const expected = {
			months: getMonthNames(tag),
			monthsShort: getMonthNames(tag, 'short'),
			weekdays: getWeekdayNames(tag, 'long'),
			weekdaysShort: getWeekdayNames(tag),
		}
		stubTruncatedBrowser()
		expect({
			months: getMonthNames(tag),
			monthsShort: getMonthNames(tag, 'short'),
			weekdays: getWeekdayNames(tag, 'long'),
			weekdaysShort: getWeekdayNames(tag),
		}).toEqual(expected)
		expect(locale.code).toBe(code)
	})

	it('порядок числовой даты совпадает с данными ICU Node', () => {
		const expected = getNumericDateOrder(tag)
		stubTruncatedBrowser()
		expect(getNumericDateOrder(tag)).toEqual(expected)
		expect(expected).toEqual(['day', 'month', 'year'])
	})

	it('относительное время совпадает с данными ICU Node', () => {
		const cases: [number, Intl.RelativeTimeFormatUnit][] = [
			[0, 'second'],
			[-5, 'minute'],
			[5, 'minute'],
			[-3, 'hour'],
			[3, 'hour'],
			[-1, 'day'],
			[1, 'day'],
			[-3, 'day'],
			[3, 'day'],
		]
		const expected = cases.map(([value, unit]) => formatRelativeUnit(value, unit, tag))
		stubTruncatedBrowser()
		expect(cases.map(([value, unit]) => formatRelativeUnit(value, unit, tag))).toEqual(expected)
	})
})

describe('запасной формат: детали', () => {
	beforeEach(() => {
		registerLocale(kk)
		registerLocale(uz)
		stubTruncatedBrowser()
	})

	it('в отличие от браузера без данных показывает название месяца по-казахски, а не по-английски', () => {
		expect(formatDateText(WEDNESDAY, { day: 'numeric', month: 'long' }, 'kk-KZ')).toBe('7 мамыр')
		expect(new Intl.DateTimeFormat('kk-KZ', { month: 'long' }).format(WEDNESDAY)).toBe('May')
		expect(formatDateText(WEDNESDAY, { day: 'numeric', month: 'long' }, 'uz-Latn-UZ')).toBe('7-may')
	})

	it('заголовок месяца с заглавной, внутри даты — со строчной', () => {
		expect(formatDateText(WEDNESDAY, { month: 'long' }, 'kk')).toBe('Мамыр')
		expect(formatDateText(WEDNESDAY, { month: 'long', year: 'numeric' }, 'kk')).toBe('2025 ж. мамыр')
		expect(formatDateText(WEDNESDAY, { month: 'long' }, 'uz')).toBe('May')
		expect(formatDateText(WEDNESDAY, { month: 'long', year: 'numeric' }, 'uz')).toBe('may, 2025')
	})

	it('тег без региона и с другим регионом находит словарь того же языка', () => {
		expect(formatDateText(WEDNESDAY, { weekday: 'long' }, 'kk')).toBe('сәрсенбі')
		expect(formatDateText(WEDNESDAY, { weekday: 'long' }, 'uz')).toBe('chorshanba')
		expect(formatDateText(WEDNESDAY, { weekday: 'long' }, 'uz-Cyrl-UZ')).toBe('chorshanba')
	})

	it('язык по умолчанию — язык кита', () => {
		setLocale('kk')
		expect(formatDateText(WEDNESDAY, { day: 'numeric', month: 'short' })).toBe('7 мам.')
	})

	it('часовой пояс: UTC и IANA', () => {
		const late = new Date(Date.UTC(2025, 4, 7, 23, 30))
		expect(createDateFormat('kk', { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(late)).toBe('7 мамыр')
		expect(createDateFormat('kk', { day: 'numeric', month: 'long', timeZone: 'Asia/Almaty' }).format(late)).toBe('8 мамыр')
		expect(createDateFormat('kk', { weekday: 'long', timeZone: 'Asia/Almaty' }).format(late)).toBe('бейсенбі')
	})

	it('время: 24 часа, 12 часов по hour12, с секундами', () => {
		const evening = new Date(2025, 4, 7, 21, 5, 9)
		expect(createDateFormat('kk', { hour: '2-digit', minute: '2-digit' }).format(evening)).toBe('21:05')
		expect(createDateFormat('kk', { hour: 'numeric', minute: '2-digit', hour12: true }).format(evening)).toBe('9:05 pm')
		expect(createDateFormat('kk', { timeStyle: 'medium' }).format(evening)).toBe('21:05:09')
		expect(createDateFormat('uz', { dateStyle: 'medium', timeStyle: 'short' }).format(evening)).toBe('7-may, 2025, 21:05')
	})

	it('числа и по умолчанию: без параметров — числовая дата; узкий месяц — первая буква', () => {
		expect(createDateFormat('kk').format(WEDNESDAY)).toBe('7.5.2025')
		expect(createDateFormat('uz', { month: 'narrow' }).format(WEDNESDAY)).toBe('M')
		expect(createDateFormat('kk', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(WEDNESDAY)).toBe('07.05.25')
	})

	it('formatRange соединяет две даты, одинаковые — одной', () => {
		const format = createDateFormat('kk', { day: 'numeric', month: 'short' })
		expect(format.formatRange(WEDNESDAY, new Date(2025, 4, 13))).toBe('7 мам. – 13 мам.')
		expect(format.formatRange(WEDNESDAY, WEDNESDAY)).toBe('7 мам.')
		expect(format.format()).toMatch(/\d/)
	})

	it('отсутствие даты в параметрах не ломает формат: только время и только день недели', () => {
		expect(createDateFormat('kk', { weekday: 'short', hour: '2-digit', minute: '2-digit' }).format(WEDNESDAY)).toBe('ср, 09:05')
	})

	it('относительное время: только известные единицы, прочие — как в Intl', () => {
		expect(formatRelativeUnit(-2, 'days', 'kk')).toBe('2 күн бұрын')
		expect(formatRelativeUnit(0, 'second', 'uz')).toBe('hozir')
		expect(formatRelativeUnit(-1, 'week', 'kk')).toBe(new Intl.RelativeTimeFormat('kk', { numeric: 'auto' }).format(-1, 'week'))
	})

	it('числовой шаблон словаря без запрошенной части — она всё равно показывается', () => {
		registerLocale(defineLocale(kk, { calendarNames: { patterns: { ...kk.calendarNames!.patterns, numeric: '{day}.{month}' } } }))
		expect(createDateFormat('kk', { year: 'numeric' }).format(WEDNESDAY)).toBe('2025')
	})

	it('словарь приложения: defineLocale(kk, { calendarNames }) главнее встроенного', () => {
		registerLocale(defineLocale(kk, { calendarNames: { months: Array.from({ length: 12 }, (_, index) => `М${index + 1}`) } }))
		expect(formatDateText(WEDNESDAY, { month: 'long' }, 'kk-KZ')).toBe('М5')
		expect(formatDateText(WEDNESDAY, { weekday: 'long' }, 'kk-KZ')).toBe('сәрсенбі')
	})
})

describe('без запасных названий или при полных данных — обычный Intl', () => {
	it('язык без словаря (ru, en, ja) — данные браузера, даже когда урезан', () => {
		stubTruncatedBrowser()
		expect(formatDateText(WEDNESDAY, { day: 'numeric', month: 'long' }, 'ru-RU')).toBe('7 мая')
		expect(formatDateText(WEDNESDAY, { month: 'long' }, 'ja-JP')).toBe('5月')
		expect(createDateFormat('en-US', { weekday: 'short' }).format(WEDNESDAY)).toBe('Wed')
	})

	it('есть словарь, но браузер знает язык (Node с полным ICU) — формат ICU', () => {
		registerLocale(kk)
		expect(createDateFormat('kk-KZ', { weekday: 'long' })).toBeInstanceOf(RealDateTimeFormat)
		expect(getMonthNames('kk-KZ')[4]).toBe('Мамыр')
	})

	it('тег не задан — язык браузера', () => {
		expect(createDateFormat(undefined, { year: 'numeric' }).format(WEDNESDAY)).toBe('2025')
	})

	it('относительное время без словаря — Intl', () => {
		expect(formatRelativeUnit(-1, 'day', 'ru-RU')).toBe('вчера')
		expect(formatRelativeUnit(3, 'hour', 'en-US')).toBe('in 3 hours')
	})
})
