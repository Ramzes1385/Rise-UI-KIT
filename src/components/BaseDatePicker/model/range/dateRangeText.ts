import { formatDatePickerValue } from '@utils/data/dateUtils'
import { getNumericDateOrder } from '@utils/data/dateFormatUtils'
import type {
	DatePickerDatePart,
	DatePickerParsedText,
	DatePickerTextOptions,
	DatePickerTimeParts,
} from '../../types/DatePickerRange.types'

const SAMPLE_DATE = new Date(2000, 10, 25)
const EXAMPLE_END = new Date(2000, 11, 3)
const GROUPS: Record<DatePickerDatePart, string> = { day: /(\d{1,2})/.source, month: /(\d{1,2})/.source, year: /(\d{4})/.source }
const DATE_SEPARATOR = /\s*[./年月-]\s*/.source
const TIME_PATTERN = /(?:[,\s]+(?:(上午|午前|下午|午後)\s*)?(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*([ap])\.?m\.?)?)?/.source
const TRAILING_DOT = /[.日]?/.source
const SEPARATORS_ONLY = /^(?:[\s,.…—–~〜至-]|から)*$/
const HAS_SEPARATOR = /[^\s,]/
const FIRST_TIME_GROUP = 4
const CJK_AFTERNOON = new Set(['下午', '午後'])

function buildTokenPattern(order: DatePickerDatePart[]): RegExp {
	return new RegExp(order.map(part => GROUPS[part]).join(DATE_SEPARATOR) + TRAILING_DOT + TIME_PATTERN, 'gi')
}

function toHours(time: DatePickerTimeParts): number | null {
	if (!time.meridiem) return time.hours < 24 ? time.hours : null
	if (time.hours < 1 || time.hours > 12) return null
	return (time.hours % 12) + (time.meridiem.toLowerCase() === 'p' ? 12 : 0)
}

function readTime(match: RegExpMatchArray): DatePickerTimeParts | null {
	const [cjkMeridiem, hours, minutes, seconds, latinMeridiem] = match.slice(FIRST_TIME_GROUP, FIRST_TIME_GROUP + 5)
	if (hours === undefined) return null
	const meridiem = latinMeridiem ?? (cjkMeridiem && (CJK_AFTERNOON.has(cjkMeridiem) ? 'p' : 'a'))
	return { hours: Number(hours), minutes: Number(minutes), seconds: Number(seconds ?? 0), meridiem }
}

function toRealDate(values: Record<DatePickerDatePart, number>, clock: number[]): Date | null {
	const date = new Date(values.year, values.month - 1, values.day, ...clock)
	const isReal = date.getFullYear() === values.year && date.getMonth() === values.month - 1 && date.getDate() === values.day
	return isReal ? date : null
}

function buildDate(values: Record<DatePickerDatePart, number>, time: DatePickerTimeParts | null, showTime: boolean): Date | null {
	if (!time) return toRealDate(values, [0, 0, 0])
	const hours = toHours(time)
	if (!showTime || hours === null || time.minutes > 59 || time.seconds > 59) return null
	return toRealDate(values, [hours, time.minutes, time.seconds])
}

function matchToDate(match: RegExpMatchArray, order: DatePickerDatePart[], showTime: boolean): Date | null {
	const values = { day: 0, month: 0, year: 0 }
	order.forEach((part, index) => {
		values[part] = Number(match[index + 1])
	})
	return buildDate(values, readTime(match), showTime)
}

function findDateMatches(text: string, order: DatePickerDatePart[]): RegExpMatchArray[] | null {
	const found = [...text.matchAll(buildTokenPattern(order))]
	if (found.length < 1 || found.length > 2) return null
	const rest = found.reduce((remaining, match) => remaining.replace(match[0], ' '), text)
	if (!SEPARATORS_ONLY.test(rest)) return null
	if (found.length === 2 && !HAS_SEPARATOR.test(rest)) return null
	return found
}

export function getDateRangeExample(options: DatePickerTextOptions): string {
	return formatDatePickerValue({
		selectionMode: 'range',
		date: SAMPLE_DATE,
		endDate: EXAMPLE_END,
		dates: [],
		dateFormat: 'dd.MM.yyyy',
		...options,
	})
}

export function parseDateRangeText(text: string, options: DatePickerTextOptions): DatePickerParsedText | null {
	const trimmed = text.normalize('NFKC').trim()
	if (!trimmed) return { start: null, end: null }

	const order = getNumericDateOrder(options.locale)
	const matches = findDateMatches(trimmed, order)
	if (!matches) return null

	const dates = matches.map(match => matchToDate(match, order, options.showTime))
	if (dates.some(date => date === null)) return null
	const [first, second = null] = dates as Date[]

	if (second && second.getTime() < first.getTime()) return { start: second, end: first }
	return { start: first, end: second }
}
