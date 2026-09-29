import type { DATE_FORMATS } from '../dateUtils'

/** День недели: 0 = воскресенье, 1 = понедельник, ..., 6 = суббота */
type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

interface BuildDateOptions {
	/** Исходная дата */
	date: Date
	/** Часы */
	hours: number
	/** Минуты */
	minutes: number
	/** Секунды */
	seconds: number
}

export type { BuildDateOptions, Weekday }

export type DateFormat = (typeof DATE_FORMATS)[number]

export interface FormatDateOptions {
	date: Date
	dateFormat: DateFormat
	showTime: boolean
	showSeconds: boolean
	is24Hour: boolean
	locale: string
}

export interface FormatRangeOptions {
	start: Date | null
	end: Date | null
	dateFormat: DateFormat
	showTime: boolean
	showSeconds: boolean
	is24Hour: boolean
	locale: string
}

export interface FormatMultipleOptions {
	dates: Date[]
	dateFormat: DateFormat
	showTime: boolean
	showSeconds: boolean
	is24Hour: boolean
	locale: string
}

export type DatePickerSelectionMode = 'single' | 'range' | 'multiple'

export interface FormatDatePickerValueOptions {
	selectionMode: DatePickerSelectionMode
	date: Date | null
	endDate: Date | null
	dates: Date[]
	dateFormat: DateFormat
	showTime: boolean
	showSeconds: boolean
	is24Hour: boolean
	locale: string
}

export interface FormatPopoverDateOptions {
	date: Date
	locale: string
}
