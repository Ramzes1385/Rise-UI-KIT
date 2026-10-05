import { computed, ref } from 'vue'
import type { ComputedRef } from 'vue'
import { formatMessage } from '@/locales/state'
import { TABLE_EXPORT_TEXT } from '@/locales/messages'
import type { DropdownMenuItem } from '@components/BaseDropdownMenu'
import type { TableExportFormat, TableExportRow } from '@utils/data/tableExportUtils'
import { downloadTableExport, TABLE_EXPORT_FORMATS } from '@utils/data/tableExportUtils'
import type { BaseTableEmits, TableColumn, TableExportDataOptions, TableExportSource, TableProps, TableRow } from '../types/BaseTable.types'

const FORMAT_LABELS: Record<TableExportFormat, () => string> = {
	csv: () => TABLE_EXPORT_TEXT.CSV,
	xlsx: () => TABLE_EXPORT_TEXT.XLSX,
}

function exportFormats(props: TableProps): ComputedRef<TableExportFormat[]> {
	return computed(() => {
		const value = props.features?.export
		if (!value) return []
		return TABLE_EXPORT_FORMATS.filter(format => value === true || value.includes(format))
	})
}

function toExportRow(row: TableRow, columns: TableColumn[]): TableExportRow {
	return Object.fromEntries(
		columns.map(column => {
			const value = row.data[column.key]
			return [column.key, column.formatter ? column.formatter(value, row) : value]
		}),
	)
}

export function useBaseTableExport(props: TableProps, emit: BaseTableEmits, source: TableExportSource) {
	const formats = exportFormats(props)
	const isExportOpen = ref(false)
	const selectedRows = computed(() => source.processedRows.value.filter(source.isSelected))

	function exportData(format: TableExportFormat, options: TableExportDataOptions = {}): boolean {
		const { onlySelected = selectedRows.value.length > 0, visibleColumnsOnly = true, ...fileOptions } = options
		const rows = onlySelected ? selectedRows.value : source.processedRows.value
		const columns = (visibleColumnsOnly ? source.visibleColumns : source.localColumns).value
		let isPrevented = false
		emit('export', { format, rows, columns, preventDefault: () => (isPrevented = true) })
		if (isPrevented) return false
		const table = { rows: rows.map(row => toExportRow(row, columns)), columns }
		downloadTableExport(format, table, { ...props.exportOptions, ...fileOptions })
		return true
	}

	const exportItems = computed<DropdownMenuItem[]>(() => {
		const items = formats.value.map<DropdownMenuItem>(format => ({
			label: FORMAT_LABELS[format](),
			onSelect: () => exportData(format),
		}))
		const count = selectedRows.value.length
		return count > 0 ? [{ type: 'label', label: formatMessage(TABLE_EXPORT_TEXT.SELECTED, { n: count }) }, ...items] : items
	})

	return { hasExport: computed(() => formats.value.length > 0), isExportOpen, exportItems, exportData }
}
