import { toCsv } from './csvExport'
import { toXlsx } from './xlsxExport'
/** Утилиты: выгрузка таблицы в файл CSV или XLSX и скачивание через Blob */
import { downloadFile } from '@utils/media/fileUtils'
import type { TableExportData, TableExportFormat, TableExportOptions } from './types/tableExportUtils.types'

const MIME_TYPES: Record<TableExportFormat, string> = {
	csv: 'text/csv;charset=utf-8',
	xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
}

const DEFAULT_FILE_NAME = 'table'

/** Файл выгрузки: CSV — текст с меткой UTF-8, XLSX — книга Excel */
function createTableExportBlob(format: TableExportFormat, table: TableExportData, options: TableExportOptions = {}): Blob {
	const content = format === 'csv' ? toCsv(table, options) : toXlsx(table, options)
	return new Blob([content], { type: MIME_TYPES[format] })
}

/** Имя файла с расширением формата: `report` → `report.xlsx`; уже с расширением — без изменений */
function tableExportFileName(format: TableExportFormat, fileName = DEFAULT_FILE_NAME): string {
	const base = fileName.trim() || DEFAULT_FILE_NAME
	return base.toLowerCase().endsWith(`.${format}`) ? base : `${base}.${format}`
}

/** Скачивает таблицу файлом CSV или XLSX */
function downloadTableExport(format: TableExportFormat, table: TableExportData, options: TableExportOptions = {}): void {
	const url = URL.createObjectURL(createTableExportBlob(format, table, options))
	downloadFile(url, tableExportFileName(format, options.fileName))
	setTimeout(() => URL.revokeObjectURL(url))
}

export { createTableExportBlob, downloadTableExport, tableExportFileName, toCsv, toXlsx }
