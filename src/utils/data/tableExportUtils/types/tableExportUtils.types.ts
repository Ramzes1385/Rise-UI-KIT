export const TABLE_EXPORT_FORMATS = ['csv', 'xlsx'] as const

/** Формат выгрузки таблицы: `csv` — текст с разделителями, `xlsx` — книга Excel (Office Open XML) */
export type TableExportFormat = (typeof TABLE_EXPORT_FORMATS)[number]

/** Колонка выгрузки: `key` — ключ значения в строке, `label` — заголовок */
export interface TableExportColumn {
	key: string
	label: string
}

/**
 * Строка выгрузки: значения по ключам колонок. Число, `Date` и логическое значение в XLSX сохраняют тип, `null`,
 * `undefined` и пустая строка дают пустую ячейку, остальное пишется текстом
 */
export type TableExportRow = Readonly<Record<string, unknown>>

/** Данные выгрузки: строки и колонки по порядку */
export interface TableExportData {
	rows: readonly TableExportRow[]
	columns: readonly TableExportColumn[]
}

/**
 * Настройки CSV. `delimiter` — разделитель (по умолчанию `;` для языков с десятичной запятой, иначе `,`), `locale` — язык
 * BCP 47 для разделителя и десятичного знака (по умолчанию язык кита), `hasBom` — метка UTF-8 в начале (по умолчанию `true`:
 * без неё Excel читает кириллицу как ANSI), `isFormulaSafe` — текст, начинающийся с `=`, `+`, `-`, `@`, табуляции или
 * возврата каретки, получает апостроф впереди (по умолчанию `true`: защита от CSV-инъекции формул)
 */
export interface TableCsvOptions {
	delimiter?: string
	locale?: string
	hasBom?: boolean
	isFormulaSafe?: boolean
}

/** Настройки XLSX: `sheetName` — имя листа (до 31 знака, без `[]:*?/\`; по умолчанию `Sheet1`) */
export interface TableXlsxOptions {
	sheetName?: string
}

/** Настройки выгрузки: CSV и XLSX вместе и `fileName` — имя файла без расширения (по умолчанию `table`) */
export interface TableExportOptions extends TableCsvOptions, TableXlsxOptions {
	fileName?: string
}

/** Файл архива ZIP: путь внутри архива и содержимое */
export interface ZipEntry {
	path: string
	data: Uint8Array
}

/** Файл архива перед записью: имя в UTF-8, содержимое, CRC-32 и смещение локального заголовка */
export interface PreparedZipEntry {
	name: Uint8Array
	data: Uint8Array
	crc: number
	offset: number
}

/** Настройки записи поля CSV: разделитель, десятичный знак и защита от формул */
export interface CsvContext {
	delimiter: string
	decimal: string
	isFormulaSafe: boolean
}
