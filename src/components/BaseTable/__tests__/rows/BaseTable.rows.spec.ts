import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import BaseTable from '../../ui/BaseTable.vue'
import type { TableColumn, TableRow } from '../../types/BaseTable.types'

const COLUMNS: TableColumn[] = [
	{ key: 'name', label: 'Имя', isSortable: true },
	{ key: 'date', label: 'Дата', isSortable: true, sortType: 'date' },
]

const ROWS: TableRow[] = [
	{ id: 1, data: { name: 'Анна', date: '15.03.2024' }, isExpandable: true },
	{ id: 2, data: { name: 'Борис', date: '01.02.2024' }, isExpandable: true },
	{ id: 3, data: { name: 'Вера', date: '20.12.2023' } },
]

const names = (wrapper: ReturnType<typeof mount>): string[] =>
	wrapper.findAll('tbody tr.base-table__tr').map(
		row =>
			row
				.findAll('td')
				.map(cell => cell.text())
				.find(Boolean) ?? '',
	)

function mountTable(props: Record<string, unknown> = {}) {
	return mount(BaseTable, {
		props: { columns: COLUMNS, rows: ROWS, ...props },
		slots: { 'expanded-content': '<p class="details">Подробности</p>' },
		global: { stubs: { transition: false } },
		attachTo: document.body,
	})
}

describe('BaseTable: раскрытие строк', () => {
	beforeEach(() => {
		document.documentElement.setAttribute('data-rise-reduced-motion', 'always')
	})
	afterEach(() => {
		document.documentElement.removeAttribute('data-rise-reduced-motion')
	})

	it('у свёрнутой раскрываемой строки нет пустого tr, он появляется при раскрытии и исчезает после сворачивания', async () => {
		const wrapper = mountTable()
		expect(wrapper.findAll('tr.base-table__tr--expanded-content')).toHaveLength(0)

		const [button] = wrapper.findAll('.base-table__expand-btn')
		await button.trigger('click')
		await nextTick()
		expect(wrapper.findAll('tr.base-table__tr--expanded-content')).toHaveLength(1)
		expect(wrapper.find('.details').exists()).toBe(true)

		await button.trigger('click')
		await nextTick()
		await nextTick()
		expect(wrapper.find('.details').exists()).toBe(false)
		expect(wrapper.findAll('tr.base-table__tr--expanded-content')).toHaveLength(0)
		wrapper.unmount()
	})

	it('строка, раскрытая при загрузке, сразу с содержимым', () => {
		const wrapper = mountTable({ rows: [{ ...ROWS[0], isExpanded: true }, ROWS[1]] })
		expect(wrapper.findAll('tr.base-table__tr--expanded-content')).toHaveLength(1)
		expect(wrapper.find('.details').exists()).toBe(true)
		wrapper.unmount()
	})

	it('v-model:expandedIds: набор снаружи, клик сообщает новый набор и ничего не меняет сам', async () => {
		const wrapper = mountTable({ expandedIds: [2] })
		expect(wrapper.findAll('.details')).toHaveLength(1)
		const buttons = wrapper.findAll('.base-table__expand-btn')
		expect(buttons.map(item => item.attributes('aria-expanded'))).toEqual(['false', 'true'])

		await buttons[0].trigger('click')
		expect(wrapper.emitted('update:expandedIds')).toEqual([[[2, 1]]])
		expect(wrapper.emitted('expand')).toHaveLength(1)
		expect(wrapper.findAll('.details')).toHaveLength(1)

		await wrapper.setProps({ expandedIds: [2, 1] })
		await nextTick()
		expect(wrapper.findAll('.details')).toHaveLength(2)
		wrapper.unmount()
	})

	it('кнопка раскрытия отключённой строки недоступна', () => {
		const wrapper = mountTable({ rows: [{ ...ROWS[0], isDisabled: true }] })
		expect(wrapper.get('.base-table__expand-btn').attributes('disabled')).toBeDefined()
		wrapper.unmount()
	})

	it('одинаковые id строк предупреждают в консоли один раз на id', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		const wrapper = mountTable({ rows: [ROWS[0], { ...ROWS[0] }, { ...ROWS[0] }, ROWS[1]] })
		expect(warn).toHaveBeenCalledTimes(1)
		expect(warn.mock.calls[0][0]).toContain('«1»')
		wrapper.unmount()
		warn.mockRestore()
	})
})

describe('BaseTable: сортировка — язык и sortAccessor', () => {
	it('sortAccessor задаёт значение для сортировки, sortType применяется к нему', async () => {
		const toIso = (row: TableRow): string => String(row.data.date).split('.').reverse().join('-')
		const columns: TableColumn[] = [COLUMNS[0], { ...COLUMNS[1], sortAccessor: toIso }]
		const wrapper = mountTable({ columns })
		await wrapper.findAll('th')[2].get('button').trigger('click')
		expect(names(wrapper)).toEqual(['Вера', 'Борис', 'Анна'])
		await wrapper.findAll('th')[2].get('button').trigger('click')
		expect(names(wrapper)).toEqual(['Анна', 'Борис', 'Вера'])
		wrapper.unmount()
	})

	it('sortLocale меняет порядок строк с буквами, которых нет в языке кита', async () => {
		const rows: TableRow[] = ['z', 'ä', 'a'].map((name, index) => ({ id: index + 1, data: { name } }))
		const wrapper = mountTable({ rows, sortLocale: 'sv' })
		await wrapper.get('th button').trigger('click')
		expect(names(wrapper)).toEqual(['a', 'z', 'ä'])
		await wrapper.setProps({ sortLocale: 'de' })
		expect(names(wrapper)).toEqual(['a', 'ä', 'z'])
		wrapper.unmount()
	})
})

describe('BaseTable: режим строк по слушателю row-click', () => {
	it('слушатель, добавленный и снятый после создания, включает и выключает режим', async () => {
		const wrapper = mountTable()
		expect(wrapper.find('tr[data-row-interactive]').exists()).toBe(false)

		await wrapper.setProps({ 'onRow-click': vi.fn() })
		expect(wrapper.findAll('tr[data-row-interactive]')).toHaveLength(ROWS.length)

		await wrapper.setProps({ 'onRow-click': undefined })
		expect(wrapper.find('tr[data-row-interactive]').exists()).toBe(false)
		wrapper.unmount()
	})

	it('isRowInteractive задаёт режим явно: true без слушателя включает, false со слушателем выключает', async () => {
		const forced = mountTable({ isRowInteractive: true })
		expect(forced.findAll('tr[data-row-interactive]')).toHaveLength(ROWS.length)
		forced.unmount()

		const off = mountTable({ isRowInteractive: false, 'onRow-click': vi.fn() })
		expect(off.find('tr[data-row-interactive]').exists()).toBe(false)
		off.unmount()
	})
})

describe('BaseTable: подгрузка прокруткой без height', () => {
	const MANY: TableRow[] = Array.from({ length: 12 }, (_, index) => ({
		id: index + 1,
		data: { name: `Имя ${index + 1}`, date: '2024-01-01' },
	}))
	const observers: Array<{ callback: IntersectionObserverCallback; options?: IntersectionObserverInit }> = []

	class FakeIntersectionObserver {
		constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
			observers.push({ callback, options })
		}
		observe = vi.fn()
		unobserve = vi.fn()
		disconnect = vi.fn()
	}

	beforeEach(() => {
		observers.length = 0
		vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
	})
	afterEach(() => {
		vi.unstubAllGlobals()
	})

	const reach = (): void =>
		observers.at(-1)!.callback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)

	it('метка в конце списка, наблюдатель на окне; попадание метки в область подгружает строки', async () => {
		const wrapper = mountTable({ rows: MANY, loadMode: 'infinite', pageSize: 4 })
		await nextTick()
		expect(wrapper.find('.base-table__sentinel').exists()).toBe(true)
		expect(observers.at(-1)!.options).toEqual({ root: null, rootMargin: '0px 0px 50px 0px' })
		expect(names(wrapper)).toHaveLength(4)

		reach()
		await nextTick()
		expect(wrapper.emitted('load-more')).toHaveLength(1)
		expect(names(wrapper)).toHaveLength(8)
		wrapper.unmount()
	})

	it('с height корень наблюдателя — обёртка; пока идёт загрузка и когда строк больше нет, метка не подгружает', async () => {
		const wrapper = mountTable({ rows: MANY.slice(0, 4), loadMode: 'infinite', pageSize: 4, height: '200px', isLoading: true })
		await nextTick()
		expect(observers.at(-1)!.options?.root).toBe(wrapper.get('.base-table__wrapper').element)
		reach()
		expect(wrapper.emitted('load-more')).toBeUndefined()
		await wrapper.setProps({ isLoading: false })
		reach()
		expect(wrapper.emitted('load-more')).toBeUndefined()
		wrapper.unmount()
	})

	it('пока работает наблюдатель, прокрутка обёртки подгрузку не вызывает; в других режимах метки нет', async () => {
		const wrapper = mountTable({ rows: MANY, loadMode: 'infinite', pageSize: 4, height: '200px' })
		await nextTick()
		await wrapper.get('.base-table__wrapper').trigger('scroll')
		expect(wrapper.emitted('load-more')).toBeUndefined()
		await wrapper.setProps({ loadMode: 'button' })
		expect(wrapper.find('.base-table__sentinel').exists()).toBe(false)
		wrapper.unmount()
	})
})
