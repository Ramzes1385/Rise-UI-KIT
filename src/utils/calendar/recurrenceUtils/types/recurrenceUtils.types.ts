/** Частота повтора RRULE: каждый день, неделю, месяц, год */
export const RECURRENCE_FREQUENCIES = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'] as const

export type RecurrenceFrequency = (typeof RECURRENCE_FREQUENCIES)[number]

/** Дни недели RRULE в порядке `Date.getDay()`: SU — 0, MO — 1 … SA — 6 */
export const RECURRENCE_WEEKDAYS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'] as const

export type RecurrenceWeekdayCode = (typeof RECURRENCE_WEEKDAYS)[number]

/** День недели правила: `weekday` — 0 (воскресенье) … 6; `nth` — номер в месяце (`2MO` — 2, `-1FR` — −1), только для MONTHLY */
export interface RecurrenceWeekday {
	weekday: number
	nth?: number
}

/**
 * Правило повтора — подмножество RRULE (RFC 5545): `FREQ`, `INTERVAL`, `BYDAY`, `COUNT` или `UNTIL`, `WKST`.
 * `BYDAY` у DAILY и WEEKLY — дни недели, у MONTHLY — дни недели месяца с номером или без; у YEARLY не поддерживается
 */
export interface RecurrenceRule {
	freq: RecurrenceFrequency
	/** Шаг: 2 у WEEKLY — каждые две недели; по умолчанию 1 */
	interval?: number
	byDay?: RecurrenceWeekday[]
	/** Сколько повторов всего, считая первый */
	count?: number
	/** Последний возможный повтор (включительно) */
	until?: Date
	/** Первый день недели для WEEKLY с шагом больше 1: 0 — воскресенье, 1 — понедельник (по умолчанию, как в RFC 5545) */
	weekStart?: number
}

/** Что развернуть: начало и конец первого повтора, правило, пропуски и видимый период (`rangeEnd` не входит) */
export interface RecurrenceExpandOptions {
	start: Date
	end: Date
	rule: RecurrenceRule
	rangeStart: Date
	rangeEnd: Date
	exdates?: Date[]
	/** Сравнивать пропуски по дню, а не по точному времени — у событий на весь день */
	isAllDay?: boolean
}

/** Повтор: начало и конец (не входит) */
export interface RecurrenceOccurrence {
	start: Date
	end: Date
}
