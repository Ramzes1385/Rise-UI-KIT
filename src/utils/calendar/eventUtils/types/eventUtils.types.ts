import type { RecurrenceRule } from '../../recurrenceUtils/types/recurrenceUtils.types'

/** Дата события: `Date`, `ГГГГ-ММ-ДД` (день без времени), `ГГГГ-ММ-ДДTЧЧ:ММ` (местное время) или ISO-строка с поясом */
export type CalendarEventDate = Date | string

/**
 * Событие календаря. `end` не входит в событие: событие на весь день 2–3 октября — `start: '2026-10-02'`,
 * `end: '2026-10-04'`, как в iCalendar (DTEND) и FullCalendar. Без `end` событие на весь день длится один день,
 * событие со временем — час. `rrule` — повтор (подмножество RRULE: `FREQ=WEEKLY;BYDAY=MO,WE;COUNT=10`), `exdates` —
 * пропущенные повторы: начала повторов, которых не будет
 */
export interface CalendarEvent {
	/** Уникальный id события */
	id: string | number
	/** Название — видимый текст и начало доступного имени */
	title: string
	/** Начало */
	start: CalendarEventDate
	/** Конец (не входит в событие); по умолчанию — день для события на весь день, час для события со временем */
	end?: CalendarEventDate
	/** Событие на весь день; без флага — если `start` задан днём без времени (`ГГГГ-ММ-ДД`) */
	allDay?: boolean
	/** Цвет события — любой цвет CSS или токен (`var(--rise-success)`); по умолчанию — основной цвет кита */
	color?: string
	/** Категория — для слота `category-<категория>` и фильтров приложения */
	category?: string
	/** Ресурс (комната, человек) */
	resourceId?: string | number
	/** Описание */
	description?: string
	/** Повтор: строка RRULE или разобранное правило */
	rrule?: string | RecurrenceRule
	/** Пропущенные повторы: их начала */
	exdates?: CalendarEventDate[]
}

/** Событие с разобранными датами: `end` не входит в событие; у повтора `occurrenceStart` — начало этого повтора */
export interface NormalizedCalendarEvent {
	/** Исходное событие из `events` */
	event: CalendarEvent
	/** Ключ показа: id события, у повтора — id и начало повтора */
	key: string
	start: Date
	end: Date
	allDay: boolean
}

/** Отрезок события в строке недели: `column` — первый день (0–6), `span` — сколько дней, `lane` — ряд */
export interface CalendarWeekSegment {
	item: NormalizedCalendarEvent
	column: number
	span: number
	lane: number
	/** Событие начинается в этой неделе (иначе продолжается с прошлой) */
	isStart: boolean
	/** Событие кончается в этой неделе (иначе продолжается в следующей) */
	isEnd: boolean
}

/**
 * Событие в колонке дня: `top` и `height` — доли суток видимой шкалы (0–1), `column` и `columns` — место среди
 * пересекающихся событий
 */
export interface CalendarTimeSegment {
	item: NormalizedCalendarEvent
	top: number
	height: number
	column: number
	columns: number
	/** Событие началось раньше этого дня */
	isContinued: boolean
	/** Событие продолжается после этого дня */
	isContinuing: boolean
}

/** Диапазон дат: `end` не входит */
export interface CalendarRange {
	start: Date
	end: Date
}

/** События одного дня для вида «Список» */
export interface CalendarAgendaDay {
	date: Date
	items: NormalizedCalendarEvent[]
}

/** Видимая шкала дня в минутах суток: по умолчанию 0–1440 */
export interface CalendarTimeWindow {
	startMinute?: number
	endMinute?: number
}

/** Кусок события в дне: минуты суток начала и конца */
export interface TimedPiece {
	item: NormalizedCalendarEvent
	from: number
	to: number
}

/** Кусок с местом среди пересекающихся: колонка и число колонок группы */
export interface PlacedTimedPiece {
	piece: TimedPiece
	column: number
	columns: number
}
