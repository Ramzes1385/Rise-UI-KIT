import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import BaseTable from '../../ui/BaseTable.vue'
import type { BaseTableExpose, TableColumn, TableRow } from '../../types/BaseTable.types'

const COLUMNS: TableColumn[] = [{ key: 'name', label: 'Имя' }]

const rowsOf = (from: number, to: number): TableRow[] =>
	Array.from({ length: to - from + 1 }, (_, index) => ({ id: from + index, data: { name: `Строка ${from + index}` } }))

const names = (wrapper: ReturnType<typeof mount>): string[] => wrapper.findAll('tbody tr.base-table__tr').map(row => row.text())

function mountTable(props: Record<string, unknown> = {}) {
	return mount(BaseTable, {
		props: { columns: COLUMNS, rows: rowsOf(1, 10), pageSize: 3, ...props },
		global: { stubs: { transition: false } },
		attachTo: document.body,
	})
}

const pageButton = (wrapper: ReturnType<typeof mount>, label: string) =>
	wrapper.findAll('.base-pagination button').find(button => button.text() === label)

describe('BaseTable: v-model:page', () => {
	it('страница снаружи: показывает строки страницы из пропса', () => {
		const wrapper = mountTable({ page: 2 })
		expect(names(wrapper)).toEqual(['Строка 4', 'Строка 5', 'Строка 6'])
		wrapper.unmount()
	})

	it('клик по пагинации сообщает номер в update:page и page-change, а страницей остаётся проп', async () => {
		const wrapper = mountTable({ page: 2 })
		await pageButton(wrapper, '3')?.trigger('click')
		expect(wrapper.emitted('update:page')).toEqual([[3]])
		expect(wrapper.emitted('page-change')).toEqual([[3]])
		expect(names(wrapper)).toEqual(['Строка 4', 'Строка 5', 'Строка 6'])

		await wrapper.setProps({ page: 3 })
		expect(names(wrapper)).toEqual(['Строка 7', 'Строка 8', 'Строка 9'])
		expect(wrapper.emitted('update:page')).toHaveLength(1)
		wrapper.unmount()
	})

	it('без пропса страница внутренняя и тоже сообщается в update:page', async () => {
		const wrapper = mountTable()
		await pageButton(wrapper, '2')?.trigger('click')
		expect(wrapper.emitted('update:page')).toEqual([[2]])
		expect(names(wrapper)).toEqual(['Строка 4', 'Строка 5', 'Строка 6'])
		wrapper.unmount()
	})

	it('страница за пределами после уменьшения числа строк сдвигается на последнюю через update:page', async () => {
		const wrapper = mountTable({ page: 4 })
		await wrapper.setProps({ rows: rowsOf(1, 5) })
		await nextTick()
		expect(wrapper.emitted('update:page')).toEqual([[2]])
		wrapper.unmount()
	})

	it('пока строк нет (данные грузятся), управляемая страница не сбрасывается', async () => {
		const wrapper = mountTable({ page: 4, rows: [] })
		await nextTick()
		expect(wrapper.emitted('update:page')).toBeUndefined()
		wrapper.unmount()
	})
})

describe('BaseTable: v-model:pageSize', () => {
	it('выбор размера страницы сообщает update:pageSize и page-size-change', async () => {
		const wrapper = mountTable({ features: { pageSizeSelector: true }, pageSizeOptions: [3, 5] })
		wrapper.findComponent({ name: 'BaseSelect' }).vm.$emit('update:modelValue', '5')
		await nextTick()
		expect(wrapper.emitted('update:pageSize')).toEqual([[5]])
		expect(wrapper.emitted('page-size-change')).toEqual([[5]])
		wrapper.unmount()
	})
})

describe('BaseTable: totalRows (серверная пагинация)', () => {
	it('строки текущей страницы не нарезаются, число страниц и подпись считаются по totalRows', () => {
		const wrapper = mountTable({ rows: rowsOf(4, 6), totalRows: 10, page: 2 })
		expect(names(wrapper)).toEqual(['Строка 4', 'Строка 5', 'Строка 6'])
		const info = wrapper.find('.base-table__pagination-info').text()
		expect(info).toContain('4')
		expect(info).toContain('10')
		expect(pageButton(wrapper, '4')).toBeDefined()
		wrapper.unmount()
	})

	it('в режиме button кнопка «Загрузить ещё» остаётся, пока строк меньше totalRows', async () => {
		const wrapper = mountTable({ rows: rowsOf(1, 3), totalRows: 6, loadMode: 'button' })
		expect(wrapper.find('.base-table__load-more').exists()).toBe(true)
		await wrapper.find('.base-table__load-more button').trigger('click')
		expect(wrapper.find('.base-table__load-more').exists()).toBe(true)
		await wrapper.setProps({ rows: rowsOf(1, 6) })
		expect(wrapper.find('.base-table__load-more').exists()).toBe(false)
		wrapper.unmount()
	})
})

describe('BaseTable: v-model:selectedIds', () => {
	const checkboxes = (wrapper: ReturnType<typeof mount>) => wrapper.findAll('tbody input[type="checkbox"]')
	const checkedList = (wrapper: ReturnType<typeof mount>): boolean[] =>
		checkboxes(wrapper).map(box => (box.element as HTMLInputElement).checked)

	it('выбор снаружи: отмечает строки из пропса, а isSelected строк не учитывается', () => {
		const rows = rowsOf(1, 3).map(row => ({ ...row, isSelected: row.id === 1 }))
		const wrapper = mountTable({ rows, selectedIds: [2], behavior: { selectable: true }, pageSize: 0 })
		expect(checkedList(wrapper)).toEqual([false, true, false])
		wrapper.unmount()
	})

	it('клик по чекбоксу сообщает новый набор и не меняет выбор сам; id других страниц сохраняются', async () => {
		const wrapper = mountTable({ rows: rowsOf(1, 3), selectedIds: [99], behavior: { selectable: true }, pageSize: 0 })
		await checkboxes(wrapper)[0].setValue(true)
		expect(wrapper.emitted('update:selectedIds')).toEqual([[[99, 1]]])
		expect(wrapper.emitted('select')?.[0][0]).toEqual([expect.objectContaining({ id: 1 })])

		await wrapper.setProps({ selectedIds: [99, 1] })
		expect(checkedList(wrapper)[0]).toBe(true)
		wrapper.unmount()
	})

	it('смена rows не сбрасывает управляемый выбор', async () => {
		const wrapper = mountTable({ rows: rowsOf(1, 3), selectedIds: [1], behavior: { selectable: true }, pageSize: 0 })
		await wrapper.setProps({ rows: rowsOf(4, 6) })
		expect(wrapper.emitted('update:selectedIds')).toBeUndefined()
		expect(wrapper.emitted('select')).toBeUndefined()
		wrapper.unmount()
	})

	it('без пропса выбор внутренний и сообщается в update:selectedIds', async () => {
		const wrapper = mountTable({ rows: rowsOf(1, 3), behavior: { selectable: true }, pageSize: 0 })
		await checkboxes(wrapper)[1].setValue(true)
		expect(wrapper.emitted('update:selectedIds')).toEqual([[[2]]])
		expect(checkedList(wrapper)[1]).toBe(true)
		wrapper.unmount()
	})

	it('clearSelection снимает внутренний выбор, сообщает пустой набор и ничего не делает без выбора', async () => {
		const wrapper = mountTable({ rows: rowsOf(1, 3), behavior: { selectable: true }, pageSize: 0 })
		const expose = wrapper.vm as unknown as BaseTableExpose
		expose.clearSelection()
		expect(wrapper.emitted('update:selectedIds')).toBeUndefined()

		await checkboxes(wrapper)[0].setValue(true)
		expose.clearSelection()
		await nextTick()
		expect(wrapper.emitted('update:selectedIds')?.at(-1)).toEqual([[]])
		expect(wrapper.emitted('select')?.at(-1)).toEqual([[]])
		expect(checkedList(wrapper).some(Boolean)).toBe(false)
		wrapper.unmount()
	})

	it('clearSelection при выборе снаружи сообщает пустой набор, а выбор остаётся за родителем', async () => {
		const wrapper = mountTable({ rows: rowsOf(1, 3), selectedIds: [1, 99], behavior: { selectable: true }, pageSize: 0 })
		const expose = wrapper.vm as unknown as BaseTableExpose
		expose.clearSelection()
		await nextTick()
		expect(wrapper.emitted('update:selectedIds')).toEqual([[[]]])
		expect(checkedList(wrapper)[0]).toBe(true)
		wrapper.unmount()
	})
})

describe('BaseTable: selectAllScope', () => {
	const selectedCount = (wrapper: ReturnType<typeof mount>): number => (wrapper.emitted('select')?.at(-1)?.[0] as TableRow[]).length

	async function selectAll(scope: string | undefined, props: Record<string, unknown> = {}) {
		const wrapper = mountTable({ behavior: { selectable: true }, selectAllScope: scope, ...props })
		await wrapper.find('thead input[type="checkbox"]').setValue(true)
		return wrapper
	}

	it('по умолчанию «Выбрать все» берёт строки после поиска и фильтров на всех страницах', async () => {
		const wrapper = await selectAll(undefined)
		expect(selectedCount(wrapper)).toBe(10)
		wrapper.unmount()
	})

	it('page — только показанные сейчас строки', async () => {
		const wrapper = await selectAll('page')
		expect(selectedCount(wrapper)).toBe(3)
		wrapper.unmount()
	})

	it('all — все переданные rows, даже скрытые поиском', async () => {
		vi.useFakeTimers()
		const wrapper = mountTable({ behavior: { selectable: true }, features: { search: true }, searchDebounce: 0, selectAllScope: 'all' })
		await wrapper.find('input[type="text"], input:not([type])').setValue('Строка 1')
		await vi.runAllTimersAsync()
		vi.useRealTimers()
		await wrapper.find('thead input[type="checkbox"]').setValue(true)
		expect(selectedCount(wrapper)).toBe(10)
		wrapper.unmount()
	})
})
