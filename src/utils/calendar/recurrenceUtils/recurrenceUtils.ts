/** Утилиты: повторы событий — разбор и запись подмножества RRULE (RFC 5545), развёртка только в видимом периоде */
import { RECURRENCE_FREQUENCIES, RECURRENCE_WEEKDAYS } from './types/recurrenceUtils.types'
import type {
	RecurrenceExpandOptions,
	RecurrenceFrequency,
	RecurrenceOccurrence,
	RecurrenceRule,
	RecurrenceWeekday,
	RecurrenceWeekdayCode,
} from './types/recurrenceUtils.types'

const MS_PER_DAY = 86_400_000

/** Предел шагов развёртки: защита от зацикливания на правиле без повторов в периоде */
const MAX_STEPS = 50_000

const ICS_DATE = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/

const pad = (value: number, length = 2): string => String(value).padStart(length, '0')

/** Дата RFC 5545: `20261002` — день, `20261002T100000` — местное время, `20261002T070000Z` — UTC; иначе null */
function parseIcsDate(value: string): Date | null {
	const match = ICS_DATE.exec(value.trim())
	if (!match) return null
	const [, year, month, day, hours = '0', minutes = '0', seconds = '0', utc] = match
	const parts = [Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes), Number(seconds)] as const
	return utc ? new Date(Date.UTC(...parts)) : new Date(...parts)
}

/** Запись даты RFC 5545: день (`isDateOnly`) — `20261002`, время — в UTC `20261002T070000Z` */
function formatIcsDate(date: Date, isDateOnly = false): string {
	if (isDateOnly) return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`
	const day = `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}`
	return `${day}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
}

function parseWeekday(token: string): RecurrenceWeekday | null {
	const match = /^([+-]?\d{1,2})?(SU|MO|TU|WE|TH|FR|SA)$/.exec(token.trim().toUpperCase())
	if (!match) return null
	const weekday = RECURRENCE_WEEKDAYS.indexOf(match[2] as RecurrenceWeekdayCode)
	return match[1] ? { weekday, nth: Number(match[1]) } : { weekday }
}

function applyRulePart(rule: Partial<RecurrenceRule>, key: string, value: string): void {
	const parsers: Record<string, () => void> = {
		FREQ: () => {
			if ((RECURRENCE_FREQUENCIES as readonly string[]).includes(value)) rule.freq = value as RecurrenceFrequency
		},
		INTERVAL: () => {
			rule.interval = Math.max(1, Number.parseInt(value, 10) || 1)
		},
		COUNT: () => {
			rule.count = Math.max(0, Number.parseInt(value, 10) || 0)
		},
		UNTIL: () => {
			rule.until = parseIcsDate(value) ?? undefined
		},
		BYDAY: () => {
			rule.byDay = value.split(',').flatMap(token => parseWeekday(token) ?? [])
		},
		WKST: () => {
			rule.weekStart = parseWeekday(value)?.weekday
		},
	}
	if (Object.hasOwn(parsers, key)) parsers[key]()
}

/** Разбор строки RRULE (`FREQ=WEEKLY;BYDAY=MO,WE;COUNT=10`, можно с префиксом `RRULE:`); без верного FREQ — null */
function parseRecurrenceRule(value: string): RecurrenceRule | null {
	const rule: Partial<RecurrenceRule> = {}
	const body = value.trim().replace(/^RRULE:/i, '')
	for (const part of body.split(';')) {
		const [key, raw = ''] = part.split('=')
		applyRulePart(rule, key.trim().toUpperCase(), raw.trim().toUpperCase())
	}
	return rule.freq ? (rule as RecurrenceRule) : null
}

function formatWeekday(day: RecurrenceWeekday): string {
	return `${day.nth ?? ''}${RECURRENCE_WEEKDAYS[day.weekday]}`
}

/** Запись правила строкой RRULE без префикса; `isDateOnly` — UNTIL днём, для событий на весь день */
function formatRecurrenceRule(rule: RecurrenceRule, isDateOnly = false): string {
	const parts = [`FREQ=${rule.freq}`]
	if (rule.interval && rule.interval > 1) parts.push(`INTERVAL=${rule.interval}`)
	if (rule.byDay?.length) parts.push(`BYDAY=${rule.byDay.map(formatWeekday).join(',')}`)
	if (rule.count) parts.push(`COUNT=${rule.count}`)
	if (rule.until) parts.push(`UNTIL=${formatIcsDate(rule.until, isDateOnly)}`)
	if (rule.weekStart !== undefined) parts.push(`WKST=${RECURRENCE_WEEKDAYS[rule.weekStart]}`)
	return parts.join(';')
}

/** Дата с днём из `day` и временем суток из `time` */
function withTime(day: Date, time: Date): Date {
	return new Date(day.getFullYear(), day.getMonth(), day.getDate(), time.getHours(), time.getMinutes(), time.getSeconds())
}

function shiftDays(date: Date, days: number): Date {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

/** Дни недели `weekday` в месяце; `nth` — только n-й (с конца — отрицательный) */
function monthWeekdays(year: number, month: number, day: RecurrenceWeekday): Date[] {
	const first = new Date(year, month, 1)
	const offset = (day.weekday - first.getDay() + 7) % 7
	const days: Date[] = []
	for (let date = 1 + offset; date <= new Date(year, month + 1, 0).getDate(); date += 7) days.push(new Date(year, month, date))
	if (day.nth === undefined) return days
	const picked = day.nth > 0 ? days[day.nth - 1] : days[days.length + day.nth]
	return picked ? [picked] : []
}

/** Повторы в одном периоде правила (день, неделя, месяц, год с номером `step`) — по возрастанию */
function periodCandidates(start: Date, rule: RecurrenceRule, step: number): Date[] {
	const interval = (rule.interval ?? 1) * step
	const byDay = rule.byDay ?? []
	if (rule.freq === 'DAILY') {
		const day = shiftDays(start, interval)
		return byDay.length && !byDay.some(item => item.weekday === day.getDay()) ? [] : [day]
	}
	if (rule.freq === 'WEEKLY') return weeklyCandidates(start, rule, interval)
	if (rule.freq === 'MONTHLY') return monthlyCandidates(start, byDay, interval)
	const year = new Date(start.getFullYear() + interval, start.getMonth(), start.getDate())
	return year.getMonth() === start.getMonth() ? [year] : []
}

function weeklyCandidates(start: Date, rule: RecurrenceRule, interval: number): Date[] {
	const weekStart = rule.weekStart ?? 1
	const first = shiftDays(start, -((start.getDay() - weekStart + 7) % 7) + interval * 7)
	const weekdays = rule.byDay?.length ? rule.byDay.map(item => item.weekday) : [start.getDay()]
	return weekdays.map(weekday => shiftDays(first, (weekday - weekStart + 7) % 7)).sort((a, b) => a.getTime() - b.getTime())
}

function monthlyCandidates(start: Date, byDay: RecurrenceWeekday[], interval: number): Date[] {
	const month = new Date(start.getFullYear(), start.getMonth() + interval, 1)
	if (!byDay.length) {
		const day = new Date(month.getFullYear(), month.getMonth(), start.getDate())
		return day.getMonth() === month.getMonth() ? [day] : []
	}
	return byDay.flatMap(item => monthWeekdays(month.getFullYear(), month.getMonth(), item)).sort((a, b) => a.getTime() - b.getTime())
}

/** Сколько периодов можно пропустить до видимого периода без счёта повторов (только без COUNT, DAILY и WEEKLY) */
function skippableSteps(options: RecurrenceExpandOptions): number {
	const { rule, start, rangeStart } = options
	if (rule.count || (rule.freq !== 'DAILY' && rule.freq !== 'WEEKLY')) return 0
	const periodDays = (rule.interval ?? 1) * (rule.freq === 'WEEKLY' ? 7 : 1)
	const lag = Math.floor((rangeStart.getTime() - (options.end.getTime() - start.getTime()) - start.getTime()) / MS_PER_DAY)
	return Math.max(0, Math.floor(lag / periodDays) - 1)
}

function isExcluded(date: Date, options: RecurrenceExpandOptions): boolean {
	const time = date.getTime()
	return (options.exdates ?? []).some(item =>
		options.isAllDay
			? item.getFullYear() === date.getFullYear() && item.getMonth() === date.getMonth() && item.getDate() === date.getDate()
			: item.getTime() === time,
	)
}

/** Повтор вышел за конец правила или за видимый период — дальше не идём */
function isPastEnd(date: Date, emitted: number, options: RecurrenceExpandOptions): boolean {
	const { rule, rangeEnd } = options
	return (rule.count !== undefined && emitted >= rule.count) || (!!rule.until && date > rule.until) || date >= rangeEnd
}

/**
 * Повторы события в видимом периоде [`rangeStart`, `rangeEnd`): COUNT считается с первого повтора, пропуски
 * (`exdates`) в COUNT входят, как в RFC 5545. Первый повтор — само событие (`start`), даже если не совпадает с BYDAY
 */
function expandRecurrence(options: RecurrenceExpandOptions): RecurrenceOccurrence[] {
	const { start, end, rangeStart } = options
	const duration = end.getTime() - start.getTime()
	const occurrences: RecurrenceOccurrence[] = []
	let emitted = 0
	for (let step = skippableSteps(options); step < MAX_STEPS; step++) {
		const later = periodCandidates(start, options.rule, step)
			.map(day => withTime(day, start))
			.filter(item => item > start)
		for (const date of step === 0 ? [start, ...later] : later) {
			if (isPastEnd(date, emitted, options)) return occurrences
			emitted++
			if (date.getTime() + duration > rangeStart.getTime() && !isExcluded(date, options))
				occurrences.push({ start: date, end: new Date(date.getTime() + duration) })
		}
	}
	return occurrences
}

export { expandRecurrence, formatIcsDate, formatRecurrenceRule, parseIcsDate, parseRecurrenceRule }
