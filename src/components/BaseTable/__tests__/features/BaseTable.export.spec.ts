import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import BaseTable from '../../ui/BaseTable.vue'
import { flushPromises, mount } from '@vue/test-utils'
import { downloadTableExport } from '@utils/data/tableExportUtils'
import type { BaseTableExpose, BaseTableProps, TableColumn, TableExportEvent, TableRow } from '../../types/BaseTable.types'

vi.mock('@utils/data/tableExportUtils', async importOriginal => ({
	...(await importOriginal<typeof import('@utils/data/tableExportUtils')>()),
	downloadTableExport: vi.fn(),
}))

const columns: TableColumn[] = [
	{ key: 'name', label: 'Имя', isSortable: true },
	{ key: 'amount', label: 'Сумма', formatter: value => `${value} ₽` },
	{ key: 'note', label: 'Заметка', isHidden: true },
	{ key: 'date', label: 'Дата', formatter: () => 'текст', exportValue: (value, row) => new Date(String(value ?? row.id)) },
]

const rows: TableRow[] = [
	{ id: 1, data: { name: 'Борис', amount: 20, note: 'б', date: '2026-01-02' } },
	{ id: 2, data: { name: 'Анна', amount: 10, note: 'а', date: '2026-01-01' } },
	{ id: 3, data: { name: 'Вера', amount: 30, note: 'в', date: '2026-01-03' } },
]

const download = vi.mocked(downloadTableExport)

function mountTable(props: Partial<BaseTableProps> = {}) {
	return mount(BaseTable, {
		props: { columns, rows, features: { export: true }, ...props },
		attachTo: document.body,
	})
}

const expose = (wrapper: ReturnType<typeof mountTable>): BaseTableExpose => wrapper.vm as unknown as BaseTableExpose
const exportedNames = (): unknown[] => download.mock.lastCall?.[1].rows.map(row => row.name) ?? []

afterEach(() => {
	download.mockClear()
	document.body.innerHTML = ''
})

describe('BaseTable — экспорт', () => {
	it('без features.export кнопки и панели инструментов нет', () => {
		const wrapper = mountTable({ features: {} })
		expect(wrapper.find('.base-table__export').exists()).toBe(false)
		expect(wrapper.find('.base-table__toolbar').exists()).toBe(false)
		wrapper.unmount()
	})

	it('кнопка «Экспорт» открывает меню форматов; пункт скачивает файл', async () => {
		const wrapper = mountTable({ exportOptions: { fileName: 'отчёт' }, customClass: { export: 'my-export' } })
		const block = wrapper.find('.base-table__export')
		expect(block.classes()).toContain('my-export')
		const button = block.find('button')
		expect(button.text()).toContain('Экспорт')
		await button.trigger('click')
		await flushPromises()
		const items = [...document.querySelectorAll<HTMLElement>('[role="menuitem"]')]
		expect(items.map(item => item.textContent?.trim())).toEqual(['CSV', 'Excel (XLSX)'])
		items[1].click()
		await flushPromises()
		const [payload] = wrapper.emitted('export')?.[0] as [TableExportEvent]
		expect(payload.format).toBe('xlsx')
		expect(payload.rows.map(row => row.id)).toEqual([1, 2, 3])
		expect(payload.columns.map(column => column.key)).toEqual(['name', 'amount', 'date'])
		expect(download).toHaveBeenCalledWith(
			'xlsx',
			{
				rows: [
					{ name: 'Борис', amount: '20 ₽', date: new Date('2026-01-02') },
					{ name: 'Анна', amount: '10 ₽', date: new Date('2026-01-01') },
					{ name: 'Вера', amount: '30 ₽', date: new Date('2026-01-03') },
				],
				columns: payload.columns,
			},
			{ fileName: 'отчёт' },
		)
		wrapper.unmount()
	})

	it('массив форматов — только названные', () => {
		const wrapper = mountTable({ features: { export: ['csv'] } })
		expect((wrapper.findComponent({ name: 'BaseTableToolbar' }).props('exportItems') as unknown[]).length).toBe(1)
		wrapper.unmount()
	})

	it('exportData: сортировка, все страницы, скрытые колонки по желанию, настройки вызова важнее exportOptions', async () => {
		const wrapper = mountTable({ pageSize: 2, exportOptions: { fileName: 'a', sheetName: 'Лист' } })
		await wrapper.find('.base-table__th button').trigger('click')
		await nextTick()
		expect(expose(wrapper).exportData('csv', { fileName: 'b' })).toBe(true)
		expect(exportedNames()).toEqual(['Анна', 'Борис', 'Вера'])
		expect(download.mock.lastCall?.[2]).toEqual({ fileName: 'b', sheetName: 'Лист' })
		expose(wrapper).exportData('csv', { visibleColumnsOnly: false })
		expect(download.mock.lastCall?.[1].columns.map(column => column.key)).toEqual(['name', 'amount', 'note', 'date'])
		expect(download.mock.lastCall?.[1].rows[0]).toEqual({ name: 'Анна', amount: '10 ₽', note: 'а', date: new Date('2026-01-01') })
		wrapper.unmount()
	})

	it('выбранные строки: подсказка в меню и выгрузка только их; onlySelected: false — все', async () => {
		const selected = rows.map(row => ({ ...row, isSelected: row.id === 3 }))
		const wrapper = mountTable({ rows: selected, behavior: { selectable: true } })
		const items = wrapper.findComponent({ name: 'BaseTableToolbar' }).props('exportItems') as Array<{ type?: string; label: string }>
		expect(items[0]).toEqual({ type: 'label', label: 'Только выбранные строки: 1' })
		expose(wrapper).exportData('xlsx')
		expect(exportedNames()).toEqual(['Вера'])
		expose(wrapper).exportData('xlsx', { onlySelected: false })
		expect(exportedNames()).toEqual(['Борис', 'Анна', 'Вера'])
		wrapper.unmount()
	})

	it('preventDefault в обработчике export отменяет скачивание', () => {
		const wrapper = mountTable({ onExport: (event: TableExportEvent) => event.preventDefault() } as Partial<BaseTableProps>)
		expect(expose(wrapper).exportData('csv')).toBe(false)
		expect(download).not.toHaveBeenCalled()
		wrapper.unmount()
	})
})
