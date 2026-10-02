import type { CalendarEvent } from '../../eventUtils/types/eventUtils.types'

/** Настройки записи `.ics`: `name` — имя календаря (X-WR-CALNAME), `productId` — PRODID, `now` — DTSTAMP (для тестов) */
export interface IcsExportOptions {
	name?: string
	productId?: string
	now?: Date
}

/** Свойство строки `.ics`: имя, параметры (`VALUE=DATE`, `TZID=…`) и значение */
export interface IcsProperty {
	name: string
	params: Record<string, string>
	value: string
}

/** Длительность DURATION: дни (по календарю) и миллисекунды (точное время) */
export interface IcsDuration {
	days: number
	ms: number
}

/** Событие во время разбора: поля события и DURATION, пока неизвестен конец */
export interface IcsEventDraft extends Partial<CalendarEvent> {
	duration?: IcsDuration
}

/** Состояние разбора `.ics`: готовые события, открытое событие и глубина вложенных в него компонентов (VALARM) */
export interface IcsReader {
	events: CalendarEvent[]
	current: IcsEventDraft | null
	depth: number
}
