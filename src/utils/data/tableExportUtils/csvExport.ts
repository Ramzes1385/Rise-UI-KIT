/** Утилиты: таблица в CSV (RFC 4180) — метка UTF-8 для Excel, разделитель и десятичный знак по языку, защита от формул */
import { getLocale } from '@/locales/state'
import type { CsvContext, TableCsvOptions, TableExportData } from './types/tableExportUtils.types'

const BOM = '\uFEFF'
const LINE_END = '\r\n'
const FORMULA_START = /^[=+\-@\t\r]/
const pad = (value: number): string => String(value).padStart(2, '0')

/** Десятичный знак языка: `,` для `ru`, `.` для `en` */
function decimalSeparator(locale: string): string {
	return new Intl.NumberFormat(locale).formatToParts(1.5).find(part => part.type === 'decimal')?.value ?? '.'
}

/** Дата для CSV: `ГГГГ-ММ-ДД`, со временем — `ГГГГ-ММ-ДД ЧЧ:ММ:СС` по местному времени (Excel распознаёт оба) */
function formatCsvDate(date: Date): string {
	if (Number.isNaN(date.getTime())) return ''
	const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
	const hasTime = date.getHours() + date.getMinutes() + date.getSeconds() > 0
	return hasTime ? `${day} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}` : day
}

function toCsvText(value: unknown, context: CsvContext): string {
	if (value === null || value === undefined) return ''
	if (value instanceof Date) return formatCsvDate(value)
	if (typeof value === 'number') return Number.isFinite(value) ? String(value).replace('.', context.decimal) : ''
	const text = String(value)
	return context.isFormulaSafe && FORMULA_START.test(text) ? `'${text}` : text
}

/** Поле CSV: в кавычках, если есть разделитель, кавычка, перевод строки или пробел по краям; кавычки удваиваются */
function escapeCsvField(text: string, delimiter: string): string {
	const needsQuotes = text.includes(delimiter) || /["\r\n]/.test(text) || text !== text.trim()
	return needsQuotes ? `"${text.replace(/"/g, '""')}"` : text
}

function createContext(options: TableCsvOptions): CsvContext {
	const decimal = decimalSeparator(options.locale ?? getLocale().intl)
	const delimiter = options.delimiter ?? (decimal === ',' ? ';' : ',')
	return { delimiter, decimal: decimal === delimiter ? '.' : decimal, isFormulaSafe: options.isFormulaSafe ?? true }
}

/** Таблица в текст CSV: первая строка — заголовки колонок, строки через CRLF */
function toCsv({ rows, columns }: TableExportData, options: TableCsvOptions = {}): string {
	const context = createContext(options)
	const line = (values: unknown[]): string =>
		values.map(value => escapeCsvField(toCsvText(value, context), context.delimiter)).join(context.delimiter)
	const lines = [line(columns.map(column => column.label)), ...rows.map(row => line(columns.map(column => row[column.key])))]
	return `${(options.hasBom ?? true) ? BOM : ''}${lines.join(LINE_END)}${LINE_END}`
}

export { toCsv }
