/**
 * Утилиты: таблица в книгу XLSX (ECMA-376, SpreadsheetML) — один лист, строки как inline strings, числа, даты и логические
 * значения своими типами, жирная закреплённая строка заголовков; архив ZIP без сжатия
 */
import { createZip } from './zipStore'
import type { TableExportColumn, TableExportData, TableExportRow, TableXlsxOptions } from './types/tableExportUtils.types'

const XML_HEAD = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
const NS_MAIN = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
const NS_REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
const NS_PKG_REL = 'http://schemas.openxmlformats.org/package/2006/relationships'
const NS_TYPES = 'http://schemas.openxmlformats.org/package/2006/content-types'
const MIME_PREFIX = 'application/vnd.openxmlformats-officedocument.spreadsheetml'
const DEFAULT_SHEET_NAME = 'Sheet1'
const SHEET_NAME_MAX = 31
const CELL_TEXT_MAX = 32767
const MS_PER_DAY = 86_400_000
const EXCEL_EPOCH = Date.UTC(1899, 11, 30)
const WIDTH_MIN = 8
const WIDTH_MAX = 60
const INVALID_XML_CHARS = /[^\t\n\r\u0020-\uFFFD\u{10000}-\u{10FFFF}]/gu

/** Номера стилей ячеек из `styles.xml`: заголовок — жирный, дата — формат 14, дата и время — формат 22 */
const STYLE = { header: 1, date: 2, dateTime: 3 } as const

const XML_ENTITIES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }

function escapeXml(text: string): string {
	return text.replace(INVALID_XML_CHARS, '').replace(/[&<>"]/g, char => XML_ENTITIES[char])
}

/** Имя колонки Excel по номеру с нуля: 0 → `A`, 25 → `Z`, 26 → `AA` */
function columnName(index: number): string {
	const letter = String.fromCharCode(65 + (index % 26))
	return index < 26 ? letter : `${columnName(Math.floor(index / 26) - 1)}${letter}`
}

/** Имя листа по правилам Excel: до 31 знака, без `[]:*?/\` и апострофа по краям */
function sanitizeSheetName(name: string | undefined): string {
	const clean = (name ?? '')
		.replace(/[[\]:*?/\\]/g, ' ')
		.replace(/^'+|'+$/g, '')
		.trim()
		.slice(0, SHEET_NAME_MAX)
		.trim()
	return clean || DEFAULT_SHEET_NAME
}

/** Порядковый номер даты Excel (система 1900) по местному времени: 1 января 2026 → 46023 */
function toExcelSerial(date: Date): number {
	const local = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds())
	return (local - EXCEL_EPOCH) / MS_PER_DAY
}

function textCell(ref: string, text: string, style = ''): string {
	return `<c r="${ref}"${style} t="inlineStr"><is><t xml:space="preserve">${escapeXml(text.slice(0, CELL_TEXT_MAX))}</t></is></c>`
}

function dateCell(ref: string, date: Date): string {
	if (Number.isNaN(date.getTime())) return ''
	const serial = toExcelSerial(date)
	return `<c r="${ref}" s="${Number.isInteger(serial) ? STYLE.date : STYLE.dateTime}"><v>${serial}</v></c>`
}

function valueCell(ref: string, value: unknown): string {
	if (value === null || value === undefined || value === '') return ''
	if (value instanceof Date) return dateCell(ref, value)
	if (typeof value === 'number') return Number.isFinite(value) ? `<c r="${ref}"><v>${value}</v></c>` : ''
	if (typeof value === 'boolean') return `<c r="${ref}" t="b"><v>${value ? 1 : 0}</v></c>`
	return textCell(ref, String(value))
}

function headerRow(columns: readonly TableExportColumn[]): string {
	const cells = columns.map((column, index) => textCell(`${columnName(index)}1`, column.label, ` s="${STYLE.header}"`))
	return `<row r="1">${cells.join('')}</row>`
}

function dataRow(row: TableExportRow, columns: readonly TableExportColumn[], number: number): string {
	const cells = columns.map((column, index) => valueCell(`${columnName(index)}${number}`, row[column.key]))
	return `<row r="${number}">${cells.join('')}</row>`
}

function cellWidth(value: unknown): number {
	if (value instanceof Date) return 18
	return value === null || value === undefined ? 0 : String(value).length
}

/** Ширина колонок по самому длинному значению: от 8 до 60 знаков */
function columnWidths(rows: readonly TableExportRow[], columns: readonly TableExportColumn[]): string {
	const cols = columns.map((column, index) => {
		const longest = rows.reduce((max, row) => Math.max(max, cellWidth(row[column.key])), column.label.length)
		const width = Math.min(Math.max(longest + 2, WIDTH_MIN), WIDTH_MAX)
		return `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`
	})
	return cols.length ? `<cols>${cols.join('')}</cols>` : ''
}

function sheetXml({ rows, columns }: TableExportData): string {
	const pane = '<pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>'
	const views = `<sheetViews><sheetView workbookViewId="0">${pane}</sheetView></sheetViews>`
	const data = [headerRow(columns), ...rows.map((row, index) => dataRow(row, columns, index + 2))].join('')
	return `${XML_HEAD}<worksheet xmlns="${NS_MAIN}">${views}${columnWidths(rows, columns)}<sheetData>${data}</sheetData></worksheet>`
}

const STYLES_XML = [
	`${XML_HEAD}<styleSheet xmlns="${NS_MAIN}">`,
	'<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>',
	'<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>',
	'<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>',
	'<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>',
	'<cellXfs count="4"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>',
	'<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>',
	'<xf numFmtId="14" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>',
	'<xf numFmtId="22" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs>',
	'<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>',
].join('')

const CONTENT_TYPES_XML = [
	`${XML_HEAD}<Types xmlns="${NS_TYPES}">`,
	'<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>',
	'<Default Extension="xml" ContentType="application/xml"/>',
	`<Override PartName="/xl/workbook.xml" ContentType="${MIME_PREFIX}.sheet.main+xml"/>`,
	`<Override PartName="/xl/worksheets/sheet1.xml" ContentType="${MIME_PREFIX}.worksheet+xml"/>`,
	`<Override PartName="/xl/styles.xml" ContentType="${MIME_PREFIX}.styles+xml"/>`,
	'</Types>',
].join('')

const ROOT_RELS_XML = `${XML_HEAD}<Relationships xmlns="${NS_PKG_REL}"><Relationship Id="rId1" Type="${NS_REL}/officeDocument" Target="xl/workbook.xml"/></Relationships>`

const WORKBOOK_RELS_XML = [
	`${XML_HEAD}<Relationships xmlns="${NS_PKG_REL}">`,
	`<Relationship Id="rId1" Type="${NS_REL}/worksheet" Target="worksheets/sheet1.xml"/>`,
	`<Relationship Id="rId2" Type="${NS_REL}/styles" Target="styles.xml"/>`,
	'</Relationships>',
].join('')

function workbookXml(sheetName: string): string {
	const sheet = `<sheet name="${escapeXml(sheetName)}" sheetId="1" r:id="rId1"/>`
	return `${XML_HEAD}<workbook xmlns="${NS_MAIN}" xmlns:r="${NS_REL}"><sheets>${sheet}</sheets></workbook>`
}

/** Таблица в байты книги XLSX: лист с заголовками колонок в первой строке */
function toXlsx(table: TableExportData, options: TableXlsxOptions = {}): Uint8Array<ArrayBuffer> {
	const encoder = new TextEncoder()
	const parts: Array<[string, string]> = [
		['[Content_Types].xml', CONTENT_TYPES_XML],
		['_rels/.rels', ROOT_RELS_XML],
		['xl/workbook.xml', workbookXml(sanitizeSheetName(options.sheetName))],
		['xl/_rels/workbook.xml.rels', WORKBOOK_RELS_XML],
		['xl/styles.xml', STYLES_XML],
		['xl/worksheets/sheet1.xml', sheetXml(table)],
	]
	return createZip(parts.map(([path, xml]) => ({ path, data: encoder.encode(xml) })))
}

export { columnName, toExcelSerial, toXlsx }
