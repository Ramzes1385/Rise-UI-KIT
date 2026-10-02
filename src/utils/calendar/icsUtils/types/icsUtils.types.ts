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
