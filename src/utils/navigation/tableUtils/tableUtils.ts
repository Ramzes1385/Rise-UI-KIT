/** Утилиты: нумерация строк, стилизация колонок и сортировка значений таблицы */

import { getLocale } from '@/locales/state'
import type { SortDirection, SortType } from '@components/BaseTable/types/BaseTable.types'
import type { ColumnStyleOptions, RowNumberOptions, TableServiceColumns, TableSortKey } from './types/tableUtils.types'

/** Сравнение строк по правилам языка кита; numeric: «Item 2» < «Item 10», числа в строковой колонке — как числа */
const collators = new Map<string, Intl.Collator>()

function sortCollator(locale?: string): Intl.Collator {
	const intl = locale ?? getLocale().intl
	const cached = collators.get(intl)
	if (cached) return cached
	const collator = new Intl.Collator(intl, { numeric: true })
	collators.set(intl, collator)
	return collator
}

/**
 * ISO 8601 (дата или дата-время с необязательной зоной) — единственный строковый формат,
 * который разбирается однозначно. `new Date('01.02.2024')` в V8 даёт 2 января, а для «ДД.ММ.ГГГГ» —
 * 1 февраля, поэтому остальные строки не угадываем и считаем нераспознанными датами.
 */
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|[+-]\d{2}:?\d{2})?)?$/

const MS_IN_MINUTE = 60_000

/** Ключ пустого значения: всегда после остальных при любом направлении */
const EMPTY_SORT_KEY: TableSortKey = { rank: 2, value: '' }

/** Рассчитать номер строки с учётом пагинации */
function calcRowNumber(options: RowNumberOptions): number {
	if (options.loadMode === 'pagination' && options.pageSize) {
		return (options.currentPage - 1) * options.pageSize + options.index + 1
	}
	return options.index + 1
}

/** Получить CSS-стиль колонки (min/max width) */
function getColumnStyle(options: ColumnStyleOptions): Record<string, string> {
	const styles: Record<string, string> = {}
	if (options.minWidth) styles.minWidth = options.minWidth
	if (options.maxWidth) styles.maxWidth = options.maxWidth
	return styles
}

/** Число колонок таблицы: видимые колонки и служебные (выбор, номер строки, раскрытие) */
function calcTotalColumns(visibleCount: number, service: TableServiceColumns): number {
	return visibleCount + [service.isSelectable, service.hasRowNumber, service.hasExpandableRows].filter(Boolean).length
}

/** Рассчитать ширины колонок для colgroup с учётом flex */
function calcColumnWidths(columns: Array<{ width?: string; flex?: number }>): string[] {
	const flexCols = columns.filter(c => c.flex)
	/* istanbul ignore next — defensive `|| 0`: filter уже гарантирует truthy c.flex, но TS видит number|undefined */
	const totalFlex = flexCols.reduce((sum, c) => sum + (c.flex || 0), 0)

	return columns.map(col => {
		if (col.width) return col.width
		if (col.flex && totalFlex > 0) {
			return `${(col.flex / totalFlex) * 100}%`
		}
		return 'auto'
	})
}

/** Смещение зоны ISO-строки в минутах: Z → 0, +03:00 → 180 */
function parseZoneOffset(zone: string | undefined): number {
	if (!zone || zone === 'Z') return 0
	const digits = zone.slice(1).replace(':', '')
	const minutes = Number(digits.slice(0, 2)) * 60 + Number(digits.slice(2))
	return zone.startsWith('-') ? -minutes : minutes
}

/** Совпадают ли части даты в UTC [месяц, день, часы, минуты, секунды] — иначе дата была перенесена */
function hasUtcParts(date: Date, parts: readonly number[]): boolean {
	const [month, day, hours, minutes, seconds] = parts
	return (
		date.getUTCMonth() === month &&
		date.getUTCDate() === day &&
		date.getUTCHours() === hours &&
		date.getUTCMinutes() === minutes &&
		date.getUTCSeconds() === seconds
	)
}

/** Разобрать ISO 8601 в timestamp; несуществующие даты (2024-02-30) не переносим на следующий месяц, а отклоняем */
function parseIsoDate(value: string): number | null {
	const match = ISO_DATE_PATTERN.exec(value)
	if (!match) return null

	const [, year, month, day, hours = '0', minutes = '0', seconds = '0', fraction = '0', zone] = match
	const date = new Date(0)
	// setUTCFullYear, а не Date.UTC: Date.UTC превращает годы 0–99 в 1900–1999
	date.setUTCFullYear(Number(year), Number(month) - 1, Number(day))
	date.setUTCHours(Number(hours), Number(minutes), Number(seconds), Number(fraction.padEnd(3, '0')))

	if (!hasUtcParts(date, [Number(month) - 1, Number(day), Number(hours), Number(minutes), Number(seconds)])) return null

	// Строка без зоны трактуется как UTC: результат не зависит от часового пояса окружения
	return date.getTime() - parseZoneOffset(zone) * MS_IN_MINUTE
}

function toSortNumber(value: unknown): number | null {
	if (typeof value === 'number') return Number.isFinite(value) ? value : null
	if (typeof value === 'bigint') return Number(value)
	if (typeof value === 'string') {
		const parsed = Number(value)
		return Number.isFinite(parsed) ? parsed : null
	}
	if (value instanceof Date) {
		const time = value.getTime()
		return Number.isNaN(time) ? null : time
	}
	return null
}

/** Timestamp для колонки дат: Date, число (timestamp) или ISO-строка */
function toSortTimestamp(value: unknown): number | null {
	if (value instanceof Date) {
		const time = value.getTime()
		return Number.isNaN(time) ? null : time
	}
	if (typeof value === 'number') return Number.isFinite(value) ? value : null
	if (typeof value === 'string') return parseIsoDate(value.trim())
	return null
}

/**
 * Преобразовать значение ячейки в ключ сортировки.
 * Пустые значения (null, undefined, строка из пробелов) получают ранг 2, значения,
 * которые нельзя сравнить как число/дату, — ранг 1: так NaN не попадает в компаратор
 * и не делает его нетранзитивным.
 */
function toSortKey(value: unknown, sortType: SortType = 'string'): TableSortKey {
	if (value === null || value === undefined) return EMPTY_SORT_KEY
	if (typeof value === 'string' && value.trim() === '') return EMPTY_SORT_KEY

	if (sortType === 'number' || sortType === 'date') {
		const parsed = sortType === 'number' ? toSortNumber(value) : toSortTimestamp(value)
		return parsed === null ? { rank: 1, value: String(value) } : { rank: 0, value: parsed }
	}

	return { rank: 0, value: String(value) }
}

/**
 * Сравнение ключей сортировки для языка `locale` (BCP 47, например `'de'`); без него — язык кита. Ранг сравнивается без учёта
 * направления: распознанные значения, затем нераспознанные, пустые — всегда в конце. Направление влияет только на порядок
 * внутри ранга.
 */
function createSortComparator(locale?: string): (a: TableSortKey, b: TableSortKey, direction: SortDirection) => number {
	return (a, b, direction) => {
		if (a.rank !== b.rank) return a.rank - b.rank
		if (a.rank === 2) return 0

		const sign = direction === 'desc' ? -1 : 1
		if (typeof a.value === 'number' && typeof b.value === 'number') {
			return (a.value - b.value) * sign
		}
		return sortCollator(locale).compare(String(a.value), String(b.value)) * sign
	}
}

/** Сравнить ключи сортировки по языку кита; см. `createSortComparator` */
function compareSortKeys(a: TableSortKey, b: TableSortKey, direction: SortDirection): number {
	return createSortComparator()(a, b, direction)
}

export { calcColumnWidths, calcRowNumber, calcTotalColumns, compareSortKeys, createSortComparator, getColumnStyle, toSortKey }
