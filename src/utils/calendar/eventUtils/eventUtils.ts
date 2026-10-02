/** Утилиты: события календаря — разбор дат, развёртка повторов в периоде, раскладка по неделям и по шкале времени */
import { expandRecurrence, parseRecurrenceRule } from '../recurrenceUtils/recurrenceUtils'
import type {
	CalendarAgendaDay,
	CalendarEvent,
	CalendarEventDate,
	CalendarRange,
	CalendarTimeSegment,
	CalendarTimeWindow,
	CalendarWeekSegment,
	NormalizedCalendarEvent,
	PlacedTimedPiece,
	TimedPiece,
} from './types/eventUtils.types'

const MS_PER_HOUR = 3_600_000
const MINUTES_PER_DAY = 1440

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/
const LOCAL_DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?$/

function startOfDay(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

/** Сдвиг на дни по календарю: переход на летнее время не сбивает полночь */
function addDays(date: Date, days: number): Date {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days, date.getHours(), date.getMinutes(), date.getSeconds())
}

/** Первый день недели, в которую входит `date`; `firstDayOfWeek` — 0 (воскресенье) … 6 */
function startOfWeek(date: Date, firstDayOfWeek: number): Date {
	return addDays(startOfDay(date), -((date.getDay() - firstDayOfWeek + 7) % 7))
}

/** Сколько полных дней от `from` до `to` по календарю (без учёта времени) */
function daysBetween(from: Date, to: Date): number {
	return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / 86_400_000)
}

/** Ключ дня `ГГГГ-ММ-ДД` по местному времени — для слотов `day-<ключ>` */
function toDayKey(date: Date): string {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/** Разбор даты события: `ГГГГ-ММ-ДД` — полночь по местному времени (`isDateOnly`), `ГГГГ-ММ-ДДTЧЧ:ММ` — местное время */
function parseEventDate(value: CalendarEventDate): { date: Date; isDateOnly: boolean } | null {
	if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : { date: new Date(value), isDateOnly: false }
	const day = DATE_ONLY.exec(value)
	if (day) return { date: new Date(Number(day[1]), Number(day[2]) - 1, Number(day[3])), isDateOnly: true }
	const local = LOCAL_DATE_TIME.exec(value)
	const date = local
		? new Date(Number(local[1]), Number(local[2]) - 1, Number(local[3]), Number(local[4]), Number(local[5]), Number(local[6] ?? 0))
		: new Date(value)
	return Number.isNaN(date.getTime()) ? null : { date, isDateOnly: false }
}

function defaultEnd(start: Date, allDay: boolean): Date {
	return allDay ? addDays(startOfDay(start), 1) : new Date(start.getTime() + MS_PER_HOUR)
}

/** Событие с разобранными датами; неверная дата начала — null. Конец раньше начала заменяется концом по умолчанию */
function normalizeEvent(event: CalendarEvent): NormalizedCalendarEvent | null {
	const start = parseEventDate(event.start)
	if (!start) return null
	const allDay = event.allDay ?? start.isDateOnly
	const startDate = allDay ? startOfDay(start.date) : start.date
	const parsedEnd = event.end === undefined ? null : parseEventDate(event.end)
	const end = parsedEnd && parsedEnd.date > startDate ? parsedEnd.date : defaultEnd(startDate, allDay)
	return { event, key: String(event.id), start: startDate, end: allDay ? ceilDay(end) : end, allDay }
}

/** Конец события на весь день — полночь: время внутри дня округляется до следующей полуночи */
function ceilDay(date: Date): Date {
	const day = startOfDay(date)
	return day.getTime() === date.getTime() ? day : addDays(day, 1)
}

function overlaps(item: { start: Date; end: Date }, range: CalendarRange): boolean {
	return item.end > range.start && item.start < range.end
}

function expandItem(item: NormalizedCalendarEvent, range: CalendarRange): NormalizedCalendarEvent[] {
	const { rrule, exdates } = item.event
	const rule = typeof rrule === 'string' ? parseRecurrenceRule(rrule) : rrule
	if (!rule) return overlaps(item, range) ? [item] : []
	const occurrences = expandRecurrence({
		start: item.start,
		end: item.end,
		rule,
		rangeStart: range.start,
		rangeEnd: range.end,
		exdates: (exdates ?? []).flatMap(value => parseEventDate(value)?.date ?? []),
		isAllDay: item.allDay,
	})
	return occurrences.map(occurrence => ({ ...item, ...occurrence, key: `${item.key}@${occurrence.start.getTime()}` }))
}

/** Порядок показа: раньше начало — выше; при равном начале длинное событие выше короткого */
function compareItems(a: NormalizedCalendarEvent, b: NormalizedCalendarEvent): number {
	return a.start.getTime() - b.start.getTime() || b.end.getTime() - a.end.getTime() || Number(b.allDay) - Number(a.allDay)
}

/** События, видимые в периоде: разобранные, с повторами только внутри периода, по порядку показа */
function getEventsInRange(events: readonly CalendarEvent[], range: CalendarRange): NormalizedCalendarEvent[] {
	return events
		.flatMap(event => normalizeEvent(event) ?? [])
		.flatMap(item => expandItem(item, range))
		.sort(compareItems)
}

/** Последний день события (включительно): конец не входит в событие */
function lastDay(item: NormalizedCalendarEvent): Date {
	return startOfDay(new Date(item.end.getTime() - 1))
}

function placeInLane(lanes: boolean[][], column: number, span: number): number {
	let lane = lanes.findIndex(row => row.slice(column, column + span).every(busy => !busy))
	if (lane === -1) lane = lanes.push([]) - 1
	for (let index = column; index < column + span; index++) lanes[lane][index] = true
	return lane
}

/**
 * Отрезки событий в строке из `days` дней от `start` (неделя месяца — 7, строка «Весь день» дня — 1): каждое
 * событие занимает свой ряд (`lane`) на все свои дни; ряды заполняются сверху, как у FullCalendar
 */
function layoutWeek(items: readonly NormalizedCalendarEvent[], start: Date, days = 7): CalendarWeekSegment[] {
	const range = { start, end: addDays(start, days) }
	const lanes: boolean[][] = []
	return items
		.filter(item => overlaps(item, range))
		.map(item => {
			const column = Math.max(0, daysBetween(start, item.start))
			const last = Math.min(days - 1, daysBetween(start, lastDay(item)))
			const span = last - column + 1
			const isStart = item.start >= start
			const isEnd = item.end <= range.end
			return { item, column, span, lane: placeInLane(lanes, column, span), isStart, isEnd }
		})
}

function minutesOf(date: Date, day: Date): number {
	return (date.getTime() - day.getTime()) / 60_000
}

/** Группы пересекающихся событий: цепочка, где каждое следующее начинается раньше конца группы */
function splitGroups(pieces: TimedPiece[]): TimedPiece[][] {
	const groups: TimedPiece[][] = []
	let groupEnd = -Infinity
	for (const piece of pieces) {
		if (piece.from >= groupEnd) groups.push([])
		groups[groups.length - 1].push(piece)
		groupEnd = Math.max(piece.from >= groupEnd ? piece.to : groupEnd, piece.to)
	}
	return groups
}

function placeGroup(group: TimedPiece[]): PlacedTimedPiece[] {
	const columnEnds: number[] = []
	const placed = group.map(piece => {
		let column = columnEnds.findIndex(end => end <= piece.from)
		if (column === -1) column = columnEnds.push(0) - 1
		columnEnds[column] = piece.to
		return { piece, column, columns: 0 }
	})
	return placed.map(entry => ({ ...entry, columns: columnEnds.length }))
}

/** Колонки пересекающихся событий: в группе — по первой свободной колонке, ширина — доля группы */
function assignColumns(pieces: TimedPiece[]): PlacedTimedPiece[] {
	return splitGroups(pieces).flatMap(placeGroup)
}

/**
 * Раскладка событий со временем в колонке дня `day`: видимая шкала `window` — от `startMinute` до `endMinute` минут суток.
 * Событие через полночь режется по дню (`isContinued`, `isContinuing`); короче 1 минуты не бывает
 */
function layoutDay(items: readonly NormalizedCalendarEvent[], day: Date, window: CalendarTimeWindow = {}): CalendarTimeSegment[] {
	const { startMinute = 0, endMinute = MINUTES_PER_DAY } = window
	const dayStart = startOfDay(day)
	const span = endMinute - startMinute
	const pieces = items
		.filter(item => !item.allDay && overlaps(item, { start: dayStart, end: addDays(dayStart, 1) }))
		.map(item => ({
			item,
			from: Math.max(startMinute, minutesOf(item.start, dayStart)),
			to: Math.min(endMinute, Math.max(minutesOf(item.end, dayStart), minutesOf(item.start, dayStart) + 1)),
		}))
		.filter(piece => piece.to > piece.from)
		.sort((a, b) => a.from - b.from || b.to - a.to)
	return assignColumns(pieces).map(({ piece, column, columns }) => ({
		item: piece.item,
		top: (piece.from - startMinute) / span,
		height: (piece.to - piece.from) / span,
		column,
		columns,
		isContinued: piece.item.start < dayStart,
		isContinuing: piece.item.end > addDays(dayStart, 1),
	}))
}

/** Дни периода с событиями — для вида «Список»: многодневное событие есть в каждом своём дне, пустых дней нет */
function groupByDay(items: readonly NormalizedCalendarEvent[], range: CalendarRange): CalendarAgendaDay[] {
	const days: CalendarAgendaDay[] = []
	for (let date = startOfDay(range.start); date < range.end; date = addDays(date, 1)) {
		const dayRange = { start: date, end: addDays(date, 1) }
		const dayItems = items.filter(item => overlaps(item, dayRange))
		if (dayItems.length) days.push({ date, items: dayItems })
	}
	return days
}

export {
	addDays,
	daysBetween,
	getEventsInRange,
	groupByDay,
	layoutDay,
	layoutWeek,
	normalizeEvent,
	parseEventDate,
	startOfDay,
	startOfWeek,
	toDayKey,
}
