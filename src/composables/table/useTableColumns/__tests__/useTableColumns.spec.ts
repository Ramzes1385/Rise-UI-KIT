import { nextTick, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { useTableColumns } from '../useTableColumns'
import type { BaseTableEmits, TableColumn, TableRow } from '@components/BaseTable/types/BaseTable.types'

type Flags = { resizable?: boolean; rowNumber?: boolean; selectable?: boolean; pageSize?: number }

function setup(initial: TableColumn[], rowsList: TableRow[] = [], flags: Flags = {}) {
	const columns = ref<TableColumn[]>(initial)
	const rows = ref<TableRow[]>(rowsList)
	const emit = vi.fn()
	const api = useTableColumns({
		columns,
		rows,
		isResizable: () => !!flags.resizable,
		hasRowNumber: () => !!flags.rowNumber,
		isSelectable: () => !!flags.selectable,
		pageSize: () => flags.pageSize ?? 0,
		emit: emit as unknown as BaseTableEmits,
	})
	return { columns, rows, emit, ...api }
}

const NAME: TableColumn = { key: 'name', label: 'Имя' }
const AGE: TableColumn = { key: 'age', label: 'Возраст', width: '80px' }

describe('useTableColumns', () => {
	it('видимые колонки — без скрытых, исходные объекты props не мутируются', () => {
		const hidden: TableColumn = { key: 'note', label: 'Заметка', isHidden: true }
		const source = [NAME, AGE, hidden]
		const ctx = setup(source)

		expect(ctx.visibleColumns.value.map(column => column.key)).toEqual(['name', 'age'])

		ctx.toggleColumnVisibility(NAME)
		expect(ctx.visibleColumns.value.map(column => column.key)).toEqual(['age'])
		expect(NAME.isHidden).toBeUndefined()
		expect(ctx.emit).toHaveBeenCalledWith('columns-change', [{ ...NAME, isHidden: true }, AGE, hidden])
	})

	it('снимок колонок — копии, а не внутренние объекты', () => {
		const ctx = setup([NAME])
		const snapshot = ctx.snapshotColumns()
		snapshot[0].label = 'Изменено'
		expect(ctx.localColumns.value[0].label).toBe('Имя')
	})

	it('фильтруемые колонки — видимые и без isFilterable: false', () => {
		const ctx = setup([NAME, { key: 'id', label: 'ID', isFilterable: false }, { key: 'x', label: 'X', isHidden: true }])
		expect(ctx.filterableColumns.value.map(column => column.key)).toEqual(['name'])
	})

	it('скелетон берёт размер страницы, без него — 5 строк', () => {
		expect(setup([NAME]).skeletonRows.value).toBe(5)
		expect(setup([NAME], [], { pageSize: 12 }).skeletonRows.value).toBe(12)
	})

	it('раскрываемые строки: isExpandable или непустые children', () => {
		expect(setup([NAME], [{ id: 1, data: {}, children: [] }]).hasExpandableRows.value).toBe(false)
		expect(setup([NAME], [{ id: 1, data: {}, isExpandable: true }]).hasExpandableRows.value).toBe(true)
		expect(setup([NAME], [{ id: 1, data: {}, children: [{ id: 2, data: {} }] }]).hasExpandableRows.value).toBe(true)
	})

	it('общее число колонок учитывает выбор, номер строки и раскрытие', () => {
		const ctx = setup([NAME, AGE], [{ id: 1, data: {}, isExpandable: true }], { selectable: true, rowNumber: true })
		expect(ctx.totalCols.value).toBe(5)
		expect(setup([NAME, AGE]).totalCols.value).toBe(2)
	})

	it('ресайз колонки — по флагу таблицы или колонки', () => {
		expect(setup([NAME]).isColumnResizable(NAME)).toBe(false)
		expect(setup([NAME]).isColumnResizable({ ...NAME, isResizable: true })).toBe(true)
		expect(setup([NAME], [], { resizable: true }).isColumnResizable(NAME)).toBe(true)
	})

	it('фиксированная раскладка — при ресайзе, flex или ширине', () => {
		expect(setup([NAME]).useFixedLayout.value).toBe(false)
		expect(setup([NAME], [], { resizable: true }).useFixedLayout.value).toBe(true)
		expect(setup([NAME, AGE]).useFixedLayout.value).toBe(true)
		expect(setup([{ ...NAME, flex: 1 }]).useFixedLayout.value).toBe(true)
	})

	it('ширины для colgroup и стиль min/max колонки', () => {
		const ctx = setup([NAME, AGE])
		expect(ctx.columnWidths.value).toEqual(['auto', '80px'])
		expect(ctx.getColumnStyle({ ...NAME, minWidth: '40px', maxWidth: '200px' })).toEqual({ minWidth: '40px', maxWidth: '200px' })
		expect(ctx.getColumnStyle(NAME)).toEqual({})
	})

	it('значение ячейки: форматтер, строка, пустое для null и undefined', () => {
		const ctx = setup([NAME])
		const row: TableRow = { id: 1, data: { name: 'Анна', age: 30, empty: null } }
		const formatter = vi.fn((value: unknown) => `${value} лет`)

		expect(ctx.formatCellValue({ key: 'age', label: 'Возраст', formatter }, row)).toBe('30 лет')
		expect(formatter).toHaveBeenCalledWith(30, row)
		expect(ctx.formatCellValue({ key: 'age', label: 'Возраст' }, row)).toBe('30')
		expect(ctx.formatCellValue({ key: 'empty', label: '' }, row)).toBe('')
		expect(ctx.formatCellValue({ key: 'missing', label: '' }, row)).toBe('')
	})

	it('пересоздание тех же колонок сохраняет скрытие и ширину, выбранные пользователем', async () => {
		const ctx = setup([NAME, AGE])
		ctx.toggleColumnVisibility(NAME)
		ctx.localColumns.value[1].width = '120px'

		ctx.columns.value = [{ ...NAME }, { ...AGE }]
		await nextTick()

		expect(ctx.localColumns.value[0].isHidden).toBe(true)
		expect(ctx.localColumns.value[1].width).toBe('120px')
	})

	it('изменённые родителем isHidden и width побеждают выбор пользователя', async () => {
		const ctx = setup([NAME, AGE])
		ctx.toggleColumnVisibility(NAME)
		ctx.localColumns.value[1].width = '120px'

		ctx.columns.value = [
			{ ...NAME, isHidden: false },
			{ ...AGE, width: '90px' },
		]
		await nextTick()

		expect(ctx.localColumns.value[0].isHidden).toBe(false)
		expect(ctx.localColumns.value[1].width).toBe('90px')
	})

	it('новая колонка от родителя берётся как есть', async () => {
		const ctx = setup([NAME])
		const extra: TableColumn = { key: 'city', label: 'Город', isHidden: true }

		ctx.columns.value = [NAME, extra]
		await nextTick()

		expect(ctx.localColumns.value[1]).toEqual(extra)
		expect(ctx.localColumns.value[1]).not.toBe(extra)
	})
})
