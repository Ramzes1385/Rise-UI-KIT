import { resolveDatePickerPresets } from '../../model/range/dateRangePresets'
import type { DatePickerTextOptions } from '../../types/DatePickerRange.types'
import { getDateRangeExample, parseDateRangeText } from '../../model/range/dateRangeText'
import type { BaseDatePickerCalendarConfig } from '../../types/BaseDatePickerCalendar.types'
import {
	createDateAvailability,
	findRangeIssue,
	getRangeDays,
	normalizeDayLimit,
	pendingRangeConstraints,
	resolveRangeLimits,
} from '../../model/range/dateRangeLimits'

const RU: DatePickerTextOptions = { locale: 'ru-RU', showTime: false, showSeconds: false, is24Hour: true }
const RU_TIME: DatePickerTextOptions = { ...RU, showTime: true }
const EN_TIME: DatePickerTextOptions = { locale: 'en-US', showTime: true, showSeconds: false, is24Hour: false }

const CONFIG: BaseDatePickerCalendarConfig = {
	minDate: null,
	maxDate: null,
	disabledDates: [],
	disabledWeekdays: [],
	disableFrom: null,
	disableTo: null,
	highlights: [],
	weekends: null,
	firstDayOfWeek: 1,
	locale: 'ru-RU',
	showTime: false,
	showSeconds: false,
	is24Hour: true,
	showWeekNumber: false,
}

describe('parseDateRangeText', () => {
	it.each([
		['01.10.2026 — 05.10.2026', new Date(2026, 9, 1), new Date(2026, 9, 5)],
		['01.10.2026 - 05.10.2026', new Date(2026, 9, 1), new Date(2026, 9, 5)],
		['01.10.2026–05.10.2026', new Date(2026, 9, 1), new Date(2026, 9, 5)],
		['1.10.2026 — 5.10.2026', new Date(2026, 9, 1), new Date(2026, 9, 5)],
		['01/10/2026 — 05-10-2026', new Date(2026, 9, 1), new Date(2026, 9, 5)],
		['05.10.2026 — 01.10.2026', new Date(2026, 9, 1), new Date(2026, 9, 5)],
		['  01.10.2026   —   05.10.2026.  ', new Date(2026, 9, 1), new Date(2026, 9, 5)],
	])('читает «%s»', (text, start, end) => {
		expect(parseDateRangeText(text, RU)).toEqual({ start, end })
	})

	it('одна дата и «дата — ...» дают только начало', () => {
		expect(parseDateRangeText('01.10.2026', RU)).toEqual({ start: new Date(2026, 9, 1), end: null })
		expect(parseDateRangeText('01.10.2026 — ...', RU)).toEqual({ start: new Date(2026, 9, 1), end: null })
		expect(parseDateRangeText('01.10.2026 — …', RU)).toEqual({ start: new Date(2026, 9, 1), end: null })
	})

	it('пустая строка — пустой результат', () => {
		expect(parseDateRangeText('   ', RU)).toEqual({ start: null, end: null })
	})

	it.each([
		'abc',
		'01.10.26 — 05.10.26',
		'32.10.2026',
		'31.02.2026',
		'01.13.2026',
		'01.10.2026 05.10.2026',
		'01.10.2026.05.10.2026',
		'01.10.2026 — 02.10.2026 — 03.10.2026',
		'01.10.2026 — 31.02.2026',
		'01.10.2026 до 05.10.2026',
		'01.10.2026, 10:00',
	])('«%s» не принимает', text => {
		expect(parseDateRangeText(text, RU)).toBeNull()
	})

	it('со showTime читает время, секунды и 12-часовой формат', () => {
		expect(parseDateRangeText('01.10.2026, 09:30 — 02.10.2026 18:45:10', RU_TIME)).toEqual({
			start: new Date(2026, 9, 1, 9, 30),
			end: new Date(2026, 9, 2, 18, 45, 10),
		})
		expect(parseDateRangeText('01.10.2026', RU_TIME)).toEqual({ start: new Date(2026, 9, 1), end: null })
		expect(parseDateRangeText('10/01/2026, 09:30 AM - 10/02/2026, 12:15 pm', EN_TIME)).toEqual({
			start: new Date(2026, 9, 1, 9, 30),
			end: new Date(2026, 9, 2, 12, 15),
		})
		expect(parseDateRangeText('10/02/2026, 12:00 AM', EN_TIME)).toEqual({ start: new Date(2026, 9, 2, 0, 0), end: null })
		expect(parseDateRangeText('10/02/2026, 11:00 P.M.', EN_TIME)).toEqual({ start: new Date(2026, 9, 2, 23, 0), end: null })
	})

	it.each(['01.10.2026, 24:00', '01.10.2026, 10:60', '01.10.2026, 10:30:60'])('время в «%s» отклоняет', text => {
		expect(parseDateRangeText(text, RU_TIME)).toBeNull()
	})

	it.each(['10/01/2026, 13:00 PM', '10/01/2026, 00:30 AM'])('12-часовое время в «%s» отклоняет', text => {
		expect(parseDateRangeText(text, EN_TIME)).toBeNull()
	})

	it('порядок дня, месяца и года берёт из языка поля', () => {
		expect(parseDateRangeText('10/01/2026 - 10/05/2026', { ...RU, locale: 'en-US' })).toEqual({
			start: new Date(2026, 9, 1),
			end: new Date(2026, 9, 5),
		})
		expect(parseDateRangeText('2026-10-01 - 2026-10-05', { ...RU, locale: 'sv-SE' })).toEqual({
			start: new Date(2026, 9, 1),
			end: new Date(2026, 9, 5),
		})
	})
})

describe('getDateRangeExample', () => {
	it('показывает пример в формате языка', () => {
		expect(getDateRangeExample(RU)).toBe('25.11.2000 — 03.12.2000')
		expect(getDateRangeExample({ ...RU, locale: 'en-US' })).toBe('11/25/2000 — 12/03/2000')
	})
})

describe('dateRangeLimits', () => {
	it('normalizeDayLimit: целое от 1, остальное — без предела', () => {
		expect(normalizeDayLimit(3)).toBe(3)
		expect(normalizeDayLimit(2.9)).toBe(2)
		expect(normalizeDayLimit(0)).toBeNull()
		expect(normalizeDayLimit(-4)).toBeNull()
		expect(normalizeDayLimit(Number.NaN)).toBeNull()
		expect(normalizeDayLimit(Number.POSITIVE_INFINITY)).toBeNull()
		expect(normalizeDayLimit(null)).toBeNull()
		expect(normalizeDayLimit(undefined)).toBeNull()
	})

	it('resolveRangeLimits: максимум не меньше минимума', () => {
		expect(resolveRangeLimits(3, 5)).toEqual({ minDays: 3, maxDays: 5 })
		expect(resolveRangeLimits(3, 1)).toEqual({ minDays: 3, maxDays: 3 })
		expect(resolveRangeLimits(undefined, 4)).toEqual({ minDays: null, maxDays: 4 })
		expect(resolveRangeLimits(2, undefined)).toEqual({ minDays: 2, maxDays: null })
	})

	it('getRangeDays считает оба конца и переход на летнее время', () => {
		expect(getRangeDays({ start: new Date(2026, 9, 1), end: new Date(2026, 9, 1, 23, 59) })).toBe(1)
		expect(getRangeDays({ start: new Date(2026, 9, 1), end: new Date(2026, 9, 7) })).toBe(7)
		expect(getRangeDays({ start: new Date(2026, 2, 28), end: new Date(2026, 3, 2) })).toBe(6)
	})

	it('createDateAvailability учитывает границы, список дат и дни недели', () => {
		const isAvailable = createDateAvailability({
			...CONFIG,
			minDate: new Date(2026, 9, 2),
			maxDate: new Date(2026, 9, 20),
			disabledDates: [new Date(2026, 9, 10)],
			disabledWeekdays: [0],
			disableFrom: new Date(2026, 9, 18),
		})
		expect(isAvailable(new Date(2026, 9, 1))).toBe(false)
		expect(isAvailable(new Date(2026, 9, 2, 15))).toBe(true)
		expect(isAvailable(new Date(2026, 9, 10))).toBe(false)
		expect(isAvailable(new Date(2026, 9, 11))).toBe(false)
		expect(isAvailable(new Date(2026, 9, 12))).toBe(true)
		expect(isAvailable(new Date(2026, 9, 19))).toBe(false)
	})

	it('findRangeIssue: сначала недоступные даты, потом длина', () => {
		const isAvailable = createDateAvailability({ ...CONFIG, disabledDates: [new Date(2026, 9, 5)] })
		const limits = { minDays: 2, maxDays: 4 }
		const range = (start: number, end: number) => ({ start: new Date(2026, 9, start), end: new Date(2026, 9, end) })
		expect(findRangeIssue(range(5, 7), isAvailable, limits)).toBe('unavailable')
		expect(findRangeIssue(range(3, 6), isAvailable, limits)).toBeNull()
		expect(findRangeIssue(range(6, 6), isAvailable, limits)).toBe('min-days')
		expect(findRangeIssue(range(6, 12), isAvailable, limits)).toBe('max-days')
		expect(findRangeIssue(range(6, 12), isAvailable, { minDays: null, maxDays: null })).toBeNull()
	})

	it('pendingRangeConstraints: близкие дни в disabledDates, дальние — границами', () => {
		const start = new Date(2026, 9, 13, 10)
		const result = pendingRangeConstraints(start, { disabledDates: [new Date(2026, 9, 1)] }, { minDays: 4, maxDays: 6 })
		expect(result.disabledDates).toEqual([new Date(2026, 9, 1), ...[11, 12, 13, 14, 15].map(dayNumber => new Date(2026, 9, dayNumber))])
		expect(result.minDate).toEqual(new Date(2026, 9, 8))
		expect(result.maxDate).toEqual(new Date(2026, 9, 18))
	})

	it('pendingRangeConstraints: уже заданные границы уточняются, а не расширяются', () => {
		const start = new Date(2026, 9, 13)
		const tight = pendingRangeConstraints(
			start,
			{ minDate: new Date(2026, 9, 11), maxDate: new Date(2026, 9, 15) },
			{ minDays: null, maxDays: 10 },
		)
		expect(tight.minDate).toEqual(new Date(2026, 9, 11))
		expect(tight.maxDate).toEqual(new Date(2026, 9, 15))
		const wide = pendingRangeConstraints(
			start,
			{ minDate: new Date(2026, 8, 1), maxDate: new Date(2026, 10, 1) },
			{ minDays: null, maxDays: 3 },
		)
		expect(wide.minDate).toEqual(new Date(2026, 9, 11))
		expect(wide.maxDate).toEqual(new Date(2026, 9, 15))
	})

	it('pendingRangeConstraints: только minDays оставляет границы как есть, minDays 1 ничего не отключает', () => {
		const start = new Date(2026, 9, 13)
		const only = pendingRangeConstraints(start, { maxDate: new Date(2026, 9, 30) }, { minDays: 2, maxDays: null })
		expect(only.disabledDates).toEqual([new Date(2026, 9, 13)])
		expect(only.minDate).toBeUndefined()
		expect(only.maxDate).toEqual(new Date(2026, 9, 30))
		expect(pendingRangeConstraints(start, {}, { minDays: 1, maxDays: null }).disabledDates).toEqual([])
	})
})

describe('resolveDatePickerPresets', () => {
	const today = new Date(2026, 9, 13)

	it('false и пустой список дают пустой результат', () => {
		expect(resolveDatePickerPresets({ presets: false, today })).toEqual([])
		expect(resolveDatePickerPresets({ presets: [], today })).toEqual([])
	})

	it('true даёт шесть встроенных периодов с подписями текущего языка', () => {
		const result = resolveDatePickerPresets({ presets: true, today })
		expect(result.map(item => item.id)).toEqual(['today', 'yesterday', 'last7days', 'last30days', 'thisMonth', 'lastMonth'])
		expect(result.map(item => item.label)).toEqual(['Сегодня', 'Вчера', '7 дней', '30 дней', 'Этот месяц', 'Прошлый месяц'])
		expect(result[2].range).toEqual({ start: new Date(2026, 9, 7), end: today })
		expect(result[4].range).toEqual({ start: new Date(2026, 9, 1), end: new Date(2026, 9, 31) })
		expect(result[5].range).toEqual({ start: new Date(2026, 8, 1), end: new Date(2026, 8, 30) })
	})

	it('границы месяцев на стыке года и в феврале високосного года', () => {
		const january = resolveDatePickerPresets({ presets: ['lastMonth'], today: new Date(2026, 0, 5) })
		expect(january[0].range).toEqual({ start: new Date(2025, 11, 1), end: new Date(2025, 11, 31) })
		const march = resolveDatePickerPresets({ presets: ['lastMonth'], today: new Date(2028, 2, 5) })
		expect(march[0].range.end).toEqual(new Date(2028, 1, 29))
		const week = resolveDatePickerPresets({ presets: ['last7days'], today: new Date(2026, 0, 3) })
		expect(week[0].range.start).toEqual(new Date(2025, 11, 28))
	})

	it('свои периоды: range, getRange с приоритетом и порядок списка', () => {
		const range = { start: new Date(2026, 9, 1), end: new Date(2026, 9, 2) }
		const getRange = vi.fn(() => ({ start: today, end: today }))
		const result = resolveDatePickerPresets({
			presets: [{ id: 'a', label: 'A', range }, 'yesterday', { id: 'b', label: 'B', range, getRange }],
			today,
		})
		expect(result.map(item => item.id)).toEqual(['a', 'yesterday', 'b'])
		expect(result[0].range).toBe(range)
		expect(result[2].range).toEqual({ start: today, end: today })
		expect(getRange).toHaveBeenCalledWith(today)
	})

	it('пропускает неверные периоды и сообщает о каждом в onInvalid', () => {
		const onInvalid = vi.fn()
		const result = resolveDatePickerPresets({
			presets: [
				'today',
				'today',
				{ id: 'x', label: 'X' },
				{ id: '', label: 'Пусто', range: { start: today, end: today } },
				{ id: 'y', label: '', range: { start: today, end: today } },
				'nope' as 'today',
			],
			today,
			onInvalid,
		})
		expect(result.map(item => item.id)).toEqual(['today'])
		expect(onInvalid.mock.calls.map(([id]) => id)).toEqual(['today', 'x', '', 'y', 'nope'])
	})
})
