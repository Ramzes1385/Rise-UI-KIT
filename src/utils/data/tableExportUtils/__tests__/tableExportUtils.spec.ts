import { setLocale } from '@/locales/state'
import { crc32, createZip } from '../zipStore'
import { columnName, toExcelSerial } from '../xlsxExport'
import { parseCsv, readZip } from './tableExport.test-utils'
import type { TableExportColumn, TableExportData } from '../types/tableExportUtils.types'
import { createTableExportBlob, downloadTableExport, tableExportFileName, toCsv, toXlsx } from '../tableExportUtils'

const { downloadFile } = vi.hoisted(() => ({ downloadFile: vi.fn() }))
vi.mock('@utils/media/fileUtils', () => ({ downloadFile }))

const columns: TableExportColumn[] = [
	{ key: 'name', label: 'Имя' },
	{ key: 'amount', label: 'Сумма' },
	{ key: 'date', label: 'Дата' },
]

const table = (rows: TableExportData['rows'], cols: TableExportColumn[] = columns): TableExportData => ({ rows, columns: cols })
const decode = (bytes: Uint8Array): string => new TextDecoder().decode(bytes)
const readBlob = async (blob: Blob): Promise<Uint8Array> =>
	new Uint8Array(
		await new Promise<ArrayBuffer>(resolve => {
			const reader = new FileReader()
			reader.onload = () => resolve(reader.result as ArrayBuffer)
			reader.readAsArrayBuffer(blob)
		}),
	)

function xlsxParts(data: TableExportData, sheetName?: string): Record<string, string> {
	return Object.fromEntries(readZip(toXlsx(data, { sheetName })).map(file => [file.path, decode(file.data)]))
}

function parseXml(xml: string): Document {
	const doc = new DOMParser().parseFromString(xml, 'application/xml')
	expect(doc.getElementsByTagName('parsererror')).toHaveLength(0)
	return doc
}

function sheetCells(data: TableExportData): Element[] {
	return [...parseXml(xlsxParts(data)['xl/worksheets/sheet1.xml']).getElementsByTagName('c')]
}

afterEach(() => {
	setLocale('ru')
	vi.restoreAllMocks()
})

describe('tableExportUtils — CSV', () => {
	it('по умолчанию: метка UTF-8, разделитель «;» и десятичная запятая для русского, CRLF', () => {
		const csv = toCsv(table([{ name: 'Ёлка', amount: 1.5, date: new Date(2026, 9, 5) }]))
		expect(csv.charCodeAt(0)).toBe(0xfeff)
		expect(csv).toBe('﻿Имя;Сумма;Дата\r\nЁлка;1,5;2026-10-05\r\n')
		expect(parseCsv(csv.slice(1), ';')).toEqual([
			['Имя', 'Сумма', 'Дата'],
			['Ёлка', '1,5', '2026-10-05'],
		])
	})

	it('кириллица в байтах UTF-8 с меткой EF BB BF — Excel и LibreOffice читают как UTF-8', async () => {
		const bytes = await readBlob(createTableExportBlob('csv', table([{ name: 'Привет', amount: 2, date: null }])))
		expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf])
		const text = new TextDecoder('utf-8', { ignoreBOM: true }).decode(bytes.slice(3))
		expect(parseCsv(text, ';')[1]).toEqual(['Привет', '2', ''])
	})

	it('язык кита en: разделитель «,» и десятичная точка; явный язык важнее языка кита', () => {
		setLocale('en')
		expect(toCsv(table([{ name: 'a', amount: 1.5 }]), { hasBom: false })).toBe('Имя,Сумма,Дата\r\na,1.5,\r\n')
		expect(toCsv(table([{ name: 'a', amount: 1.5 }]), { hasBom: false, locale: 'de-DE' })).toBe('Имя;Сумма;Дата\r\na;1,5;\r\n')
	})

	it('свой разделитель; совпадение с десятичным знаком даёт точку', () => {
		expect(toCsv(table([{ amount: 1.5 }]), { delimiter: '\t', hasBom: false })).toBe('Имя\tСумма\tДата\r\n\t1,5\t\r\n')
		expect(toCsv(table([{ amount: 1.5 }]), { delimiter: ',', hasBom: false })).toBe('Имя,Сумма,Дата\r\n,1.5,\r\n')
	})

	it('язык без десятичного знака в Intl — точка', () => {
		vi.spyOn(Intl.NumberFormat.prototype, 'formatToParts').mockReturnValue([{ type: 'integer', value: '1' }])
		expect(toCsv(table([{ amount: 2.5 }]), { hasBom: false })).toBe('Имя,Сумма,Дата\r\n,2.5,\r\n')
	})

	it('экранирование: разделитель, кавычки, переводы строк и пробелы по краям — в кавычках', () => {
		const rows = [
			{ name: 'a;b', amount: 'say "hi"', date: 'line1\nline2' },
			{ name: ' x', amount: 'y ', date: 'r\rn' },
		]
		const csv = toCsv(table(rows), { hasBom: false })
		expect(csv).toBe('Имя;Сумма;Дата\r\n"a;b";"say ""hi""";"line1\nline2"\r\n" x";"y ";"r\rn"\r\n')
		expect(parseCsv(csv, ';').slice(1)).toEqual([
			['a;b', 'say "hi"', 'line1\nline2'],
			[' x', 'y ', 'r\rn'],
		])
	})

	it('защита от формул: текст с = + - @ табуляции получает апостроф; числа — нет; можно выключить', () => {
		const rows = [
			{ name: '=SUM(A1)', amount: -5, date: '+1' },
			{ name: '@x', amount: '-2', date: '\tt' },
		]
		expect(toCsv(table(rows), { hasBom: false })).toBe("Имя;Сумма;Дата\r\n'=SUM(A1);-5;'+1\r\n'@x;'-2;'\tt\r\n")
		expect(toCsv(table(rows), { hasBom: false, isFormulaSafe: false })).toBe('Имя;Сумма;Дата\r\n=SUM(A1);-5;+1\r\n@x;-2;"\tt"\r\n')
	})

	it('значения: пусто для null, undefined, NaN, Infinity и неверной даты; дата со временем; логическое и объект — текстом', () => {
		const rows = [
			{ name: null, amount: Number.NaN, date: new Date('мусор') },
			{ name: undefined, amount: Number.POSITIVE_INFINITY, date: new Date(2026, 0, 2, 9, 5, 7) },
			{ name: true, amount: 0, date: { toString: () => 'obj' } },
		]
		expect(toCsv(table(rows), { hasBom: false })).toBe('Имя;Сумма;Дата\r\n;;\r\n;;2026-01-02 09:05:07\r\ntrue;0;obj\r\n')
	})

	it('без строк и без колонок', () => {
		expect(toCsv(table([]), { hasBom: false })).toBe('Имя;Сумма;Дата\r\n')
		expect(toCsv(table([{ a: 1 }], []), { hasBom: false })).toBe('\r\n\r\n')
	})
})

describe('tableExportUtils — ZIP без сжатия', () => {
	it('crc32 по контрольному значению «123456789» и пустому входу', () => {
		expect(crc32(new TextEncoder().encode('123456789'))).toBe(0xcbf43926)
		expect(crc32(new Uint8Array())).toBe(0)
	})

	it('архив читается по центральному каталогу: метод STORE, флаг UTF-8, содержимое без изменений', () => {
		const zip = createZip([
			{ path: 'a.txt', data: new TextEncoder().encode('привет') },
			{ path: 'папка/б.xml', data: new Uint8Array([1, 2, 3]) },
		])
		const files = readZip(zip)
		expect(files.map(file => file.path)).toEqual(['a.txt', 'папка/б.xml'])
		expect(files.map(file => file.method)).toEqual([0, 0])
		expect(files.every(file => file.flags === 0x0800)).toBe(true)
		expect(decode(files[0].data)).toBe('привет')
		expect([...files[1].data]).toEqual([1, 2, 3])
	})

	it('одинаковый вход — одинаковые байты; пустой архив — только запись конца', () => {
		const entries = [{ path: 'x', data: new Uint8Array([7]) }]
		expect(createZip(entries)).toEqual(createZip(entries))
		const empty = createZip([])
		expect(empty).toHaveLength(22)
		expect(readZip(empty)).toEqual([])
	})
})

describe('tableExportUtils — XLSX', () => {
	it('columnName и toExcelSerial', () => {
		expect([0, 25, 26, 51, 701, 702].map(columnName)).toEqual(['A', 'Z', 'AA', 'AZ', 'ZZ', 'AAA'])
		expect(toExcelSerial(new Date(2026, 0, 1))).toBe(46023)
		expect(toExcelSerial(new Date(1900, 0, 1))).toBe(2)
		expect(toExcelSerial(new Date(2026, 0, 1, 12))).toBe(46023.5)
	})

	it('пакет OOXML (ECMA-376, часть 2): все части на месте, XML разбирается, связи указывают на существующие части', () => {
		const parts = xlsxParts(table([{ name: 'a', amount: 1, date: null }]))
		expect(Object.keys(parts)).toEqual([
			'[Content_Types].xml',
			'_rels/.rels',
			'xl/workbook.xml',
			'xl/_rels/workbook.xml.rels',
			'xl/styles.xml',
			'xl/worksheets/sheet1.xml',
		])
		Object.values(parts).forEach(xml => {
			expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>')).toBe(true)
			parseXml(xml)
		})
		const overrides = [...parseXml(parts['[Content_Types].xml']).getElementsByTagName('Override')].map(node =>
			node.getAttribute('PartName'),
		)
		expect(overrides).toEqual(['/xl/workbook.xml', '/xl/worksheets/sheet1.xml', '/xl/styles.xml'])
		const rootTarget = parseXml(parts['_rels/.rels']).getElementsByTagName('Relationship')[0].getAttribute('Target')
		expect(parts[rootTarget as string]).toBeDefined()
		const targets = [...parseXml(parts['xl/_rels/workbook.xml.rels']).getElementsByTagName('Relationship')].map(
			node => `xl/${node.getAttribute('Target')}`,
		)
		targets.forEach(target => expect(parts[target]).toBeDefined())
		const sheet = parseXml(parts['xl/workbook.xml']).getElementsByTagName('sheet')[0]
		expect(sheet.getAttribute('r:id')).toBe('rId1')
		const styles = parseXml(parts['xl/styles.xml'])
		expect(styles.getElementsByTagName('cellXfs')[0].getAttribute('count')).toBe('4')
		expect(styles.getElementsByTagName('cellXfs')[0].children).toHaveLength(4)
	})

	it('лист: заголовки жирным и закреплены, значения своими типами', () => {
		const rows = [
			{ name: 'Ёлка & <ель> "1"', amount: 12.5, date: new Date(2026, 0, 1) },
			{ name: true, amount: -3, date: new Date(2026, 0, 1, 12) },
			{ name: false, amount: Number.NaN, date: new Date('мусор') },
			{ name: '', amount: null, date: undefined },
		]
		const sheet = parseXml(xlsxParts(table(rows))['xl/worksheets/sheet1.xml'])
		expect(sheet.getElementsByTagName('pane')[0].getAttribute('state')).toBe('frozen')
		const cells = Object.fromEntries([...sheet.getElementsByTagName('c')].map(cell => [cell.getAttribute('r'), cell]))
		expect(Object.keys(cells)).toEqual(['A1', 'B1', 'C1', 'A2', 'B2', 'C2', 'A3', 'B3', 'C3', 'A4'])
		expect(cells.A1.getAttribute('s')).toBe('1')
		expect(cells.A1.getAttribute('t')).toBe('inlineStr')
		expect(cells.A1.textContent).toBe('Имя')
		expect(cells.A2.textContent).toBe('Ёлка & <ель> "1"')
		expect(cells.B2.getAttribute('t')).toBeNull()
		expect(cells.B2.textContent).toBe('12.5')
		expect(cells.C2.getAttribute('s')).toBe('2')
		expect(cells.C2.textContent).toBe('46023')
		expect(cells.A3.getAttribute('t')).toBe('b')
		expect(cells.A3.textContent).toBe('1')
		expect(cells.B3.textContent).toBe('-3')
		expect(cells.C3.getAttribute('s')).toBe('3')
		expect(cells.C3.textContent).toBe('46023.5')
		expect(cells.A4.textContent).toBe('0')
		expect(sheet.getElementsByTagName('row')).toHaveLength(5)
	})

	it('текст: недопустимые в XML знаки убираются, длина — до 32767, xml:space="preserve"', () => {
		const [, , cell, long] = sheetCells(table([{ name: ' a\u0001b\u000Bc￾ ', amount: 'x'.repeat(40000) }], columns.slice(0, 2)))
		expect(cell.textContent).toBe(' abc ')
		expect(cell.getElementsByTagName('t')[0].getAttribute('xml:space')).toBe('preserve')
		expect(long.textContent).toHaveLength(32767)
	})

	it('ширина колонок: от 8 до 60 знаков по самому длинному значению, дата — 18', () => {
		const rows = [{ name: 'x'.repeat(100), amount: null, date: new Date(2026, 0, 1) }]
		const sheet = parseXml(xlsxParts(table(rows))['xl/worksheets/sheet1.xml'])
		const widths = [...sheet.getElementsByTagName('col')].map(col => col.getAttribute('width'))
		expect(widths).toEqual(['60', '8', '20'])
		expect(parseXml(xlsxParts(table([], []))['xl/worksheets/sheet1.xml']).getElementsByTagName('cols')).toHaveLength(0)
	})

	it('имя листа: по умолчанию Sheet1, запрещённые знаки и апострофы по краям убираются, до 31 знака', () => {
		const name = (value?: string): string | null =>
			parseXml(xlsxParts(table([]), value)['xl/workbook.xml'])
				.getElementsByTagName('sheet')[0]
				.getAttribute('name')
		expect(name()).toBe('Sheet1')
		expect(name("'[]:*?/\\'")).toBe('Sheet1')
		expect(name('Отчёт: 2026/10 & «итоги»')).toBe('Отчёт  2026 10 & «итоги»')
		expect(name('я'.repeat(40))).toHaveLength(31)
	})

	it('Blob XLSX: тип книги Excel и архив внутри', async () => {
		const blob = createTableExportBlob('xlsx', table([{ name: 'a' }]), { sheetName: 'Лист' })
		expect(blob.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
		expect(readZip(await readBlob(blob))).toHaveLength(6)
		expect(readZip(toXlsx(table([])))).toHaveLength(6)
	})
})

describe('tableExportUtils — файл', () => {
	it('tableExportFileName: расширение формата, без двойного расширения, пустое имя — table', () => {
		expect(tableExportFileName('csv')).toBe('table.csv')
		expect(tableExportFileName('xlsx', 'Отчёт')).toBe('Отчёт.xlsx')
		expect(tableExportFileName('xlsx', 'report.XLSX')).toBe('report.XLSX')
		expect(tableExportFileName('csv', '  ')).toBe('table.csv')
	})

	it('createTableExportBlob CSV: тип text/csv с кодировкой', () => {
		expect(createTableExportBlob('csv', table([])).type).toBe('text/csv;charset=utf-8')
	})

	it('downloadTableExport: ссылка Blob, имя файла и освобождение ссылки', () => {
		vi.useFakeTimers()
		const create = vi.fn(() => 'blob:x')
		const revoke = vi.fn()
		vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke }))
		downloadTableExport('xlsx', table([{ name: 'a' }]), { fileName: 'отчёт' })
		expect(create).toHaveBeenCalledWith(expect.any(Blob))
		expect(downloadFile).toHaveBeenCalledWith('blob:x', 'отчёт.xlsx')
		expect(revoke).not.toHaveBeenCalled()
		vi.runAllTimers()
		expect(revoke).toHaveBeenCalledWith('blob:x')
		downloadTableExport('csv', table([]))
		expect(downloadFile).toHaveBeenLastCalledWith('blob:x', 'table.csv')
		vi.useRealTimers()
		vi.unstubAllGlobals()
	})
})
