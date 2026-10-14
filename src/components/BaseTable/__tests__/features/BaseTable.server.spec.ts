import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import BaseTable from '../../ui/BaseTable.vue'
import type { TableColumn, TableRow } from '../../types/BaseTable.types'

const COLUMNS: TableColumn[] = [
	{ key: 'name', label: 'Имя', isSortable: true },
	{ key: 'age', label: 'Возраст', isSortable: true, sortType: 'number' },
]

const ROWS: TableRow[] = [
	{ id: 1, data: { name: 'Борис', age: 30 } },
	{ id: 2, data: { name: 'Анна', age: 25 } },
	{ id: 3, data: { name: 'Вика', age: 20 } },
]

const names = (wrapper: ReturnType<typeof mount>): string[] => wrapper.findAll('tbody tr.base-table__tr').map(row => row.text())

function mountTable(props: Record<string, unknown> = {}) {
	return mount(BaseTable, {
		props: { columns: COLUMNS, rows: ROWS, features: { search: true, filters: true }, searchDebounce: 100, ...props },
		global: { stubs: { transition: false } },
		attachTo: document.body,
	})
}

async function typeSearch(wrapper: ReturnType<typeof mount>, value: string): Promise<void> {
	await wrapper.find('.base-table__search input').setValue(value)
	vi.advanceTimersByTime(150)
}

describe('BaseTable: серверные поиск, фильтры и сортировка', () => {
	beforeEach(() => {
		vi.useFakeTimers()
	})
	afterEach(() => {
		vi.useRealTimers()
	})

	it('по умолчанию поиск применяется к переданным строкам', async () => {
		const wrapper = mountTable()
		await typeSearch(wrapper, 'Анна')
		expect(names(wrapper)).toEqual(['Анна25'])
		wrapper.unmount()
	})

	it('isManualFiltering: поиск только сообщается в search, строки остаются как переданы', async () => {
		const wrapper = mountTable({ isManualFiltering: true })
		await typeSearch(wrapper, 'Анна')
		expect(wrapper.emitted('search')).toEqual([['Анна']])
		expect(names(wrapper)).toEqual(['Борис30', 'Анна25', 'Вика20'])
		wrapper.unmount()
	})

	it('isManualFiltering: ответ сервера (новые rows) показывается как есть', async () => {
		const wrapper = mountTable({ isManualFiltering: true })
		await typeSearch(wrapper, 'Борис')
		await wrapper.setProps({ rows: [ROWS[0]] })
		expect(names(wrapper)).toEqual(['Борис30'])
		wrapper.unmount()
	})

	it('isManualFiltering: пустая страница при активном поиске — «Ничего не найдено», без поиска — «Нет данных»', async () => {
		const wrapper = mountTable({ isManualFiltering: true, rows: [] })
		expect(wrapper.find('.base-table__td--empty').text()).not.toContain('Ничего не найдено')
		await typeSearch(wrapper, 'zzz')
		expect(wrapper.find('.base-table__td--empty').text()).toContain('Ничего не найдено')
		wrapper.unmount()
	})

	it('без isManualFiltering пустая страница при поиске по пустым rows остаётся «Нет данных»', async () => {
		const wrapper = mountTable({ rows: [] })
		await typeSearch(wrapper, 'zzz')
		expect(wrapper.find('.base-table__td--empty').text()).not.toContain('Ничего не найдено')
		wrapper.unmount()
	})

	it('isManualSorting: сортировка сообщается в sort, порядок строк не меняется, aria-sort ставится', async () => {
		const wrapper = mountTable({ isManualSorting: true })
		await wrapper
			.findAll('th button')
			.find(button => button.text().includes('Возраст'))
			?.trigger('click')
		expect(wrapper.emitted('sort')).toEqual([[[{ key: 'age', direction: 'asc' }]]])
		expect(names(wrapper)).toEqual(['Борис30', 'Анна25', 'Вика20'])
		expect(
			wrapper
				.findAll('th')
				.find(th => th.text().includes('Возраст'))
				?.attributes('aria-sort'),
		).toBe('ascending')
		wrapper.unmount()
	})

	it('isManualSorting не отключает клиентский поиск', async () => {
		const wrapper = mountTable({ isManualSorting: true })
		await typeSearch(wrapper, 'Анна')
		expect(names(wrapper)).toEqual(['Анна25'])
		wrapper.unmount()
	})

	it('с totalRows и isManualFiltering страница не нарезается, поиск сбрасывает страницу', async () => {
		const wrapper = mountTable({ isManualFiltering: true, totalRows: 30, pageSize: 3, page: 2 })
		await typeSearch(wrapper, 'a')
		expect(wrapper.emitted('update:page')).toEqual([[1]])
		expect(names(wrapper)).toEqual(['Борис30', 'Анна25', 'Вика20'])
		wrapper.unmount()
	})
})

describe('BaseTable: выбранные строки, скрытые поиском', () => {
	const status = (wrapper: ReturnType<typeof mount>): string => wrapper.find('.base-table__selection-status').text()

	beforeEach(() => {
		vi.useFakeTimers()
	})
	afterEach(() => {
		vi.useRealTimers()
	})

	it('без выбора live-область есть, но пуста', () => {
		const wrapper = mountTable({ behavior: { selectable: true } })
		const region = wrapper.find('.base-table__selection-status')
		expect(region.attributes('role')).toBe('status')
		expect(region.text()).toBe('')
		wrapper.unmount()
	})

	it('классы области — ui.selection-status и customClass.selectionStatus', () => {
		const wrapper = mountTable({
			behavior: { selectable: true },
			ui: { 'selection-status': 'u-status' },
			customClass: { selectionStatus: 'own-status' },
		})
		expect(wrapper.find('.base-table__selection-status').classes()).toEqual(expect.arrayContaining(['u-status', 'own-status']))
		wrapper.unmount()
	})

	it('без selectable области нет', () => {
		const wrapper = mountTable()
		expect(wrapper.find('.base-table__selection-status').exists()).toBe(false)
		wrapper.unmount()
	})

	it('выбранная и затем скрытая поиском строка попадает в счётчик и остаётся в выборе', async () => {
		const wrapper = mountTable({ behavior: { selectable: true } })
		await wrapper.findAll('tbody input[type="checkbox"]')[0].setValue(true)
		await typeSearch(wrapper, 'Анна')
		expect(status(wrapper)).toBe('Выбрано 1 скрытая строка — она остаётся в выборе')
		await typeSearch(wrapper, '')
		expect(status(wrapper)).toBe('')
		wrapper.unmount()
	})

	it('форма числительного: 2 и 5 скрытых строк', async () => {
		const rows = Array.from({ length: 6 }, (_, index) => ({
			id: index + 1,
			data: { name: `Имя ${index + 1}`, age: index },
			isSelected: true,
		}))
		const wrapper = mountTable({
			behavior: { selectable: true },
			rows: [...rows, { id: 99, data: { name: 'Найти', age: 1 } }],
			pageSize: 0,
		})
		await typeSearch(wrapper, 'Найти')
		expect(status(wrapper)).toContain('Выбрано 6 скрытых строк')
		await wrapper.setProps({ rows: [...rows.slice(0, 2), { id: 99, data: { name: 'Найти', age: 1 } }] })
		await nextTick()
		expect(status(wrapper)).toContain('Выбрано 2 скрытые строки')
		wrapper.unmount()
	})

	it('payload select после ввода в поиск сохраняет скрытые выбранные строки (решение: выбор не снимается)', async () => {
		const wrapper = mountTable({ behavior: { selectable: true } })
		await wrapper.findAll('tbody input[type="checkbox"]')[0].setValue(true)
		await typeSearch(wrapper, 'Анна')
		await wrapper.findAll('tbody input[type="checkbox"]')[0].setValue(true)
		const last = wrapper.emitted('select')?.at(-1)?.[0] as TableRow[]
		expect(last.map(row => row.id)).toEqual([1, 2])
		wrapper.unmount()
	})
})
