import '@testing-library/jest-dom/vitest'
import { mount } from '@vue/test-utils'
import BaseTable from '../../ui/BaseTable.vue'
import { defineComponent, h, nextTick, ref } from 'vue'
import BaseTableToolbar from '../../ui/toolbar/BaseTableToolbar.vue'
import type { TableColumn, TableRow } from '../../types/BaseTable.types'

const COLUMNS: TableColumn[] = [
	{ key: 'name', label: 'Имя', isSortable: true },
	{ key: 'age', label: 'Возраст' },
]

const ROWS: TableRow[] = [
	{ id: 1, data: { name: 'Анна', age: 31 }, isExpandable: true },
	{ id: 2, data: { name: 'Борис', age: 28 }, isExpandable: true },
	{ id: 3, data: { name: 'Вера', age: 45 } },
]

const cells = (wrapper: ReturnType<typeof mount>, column: number): string[] =>
	wrapper.findAll('tbody tr.base-table__tr').map(row => row.findAll('td:not(.base-table__td--expand)')[column].text())

describe('BaseTable: слоты передаются строкам напрямую (TBL-18)', () => {
	it('ввод в поле фильтра не перерисовывает строки: слот ячейки не вызывается заново', async () => {
		const cell = vi.fn((props: { value: unknown }) => `[${props.value}]`)
		const wrapper = mount(BaseTable, {
			props: { columns: COLUMNS, rows: ROWS, features: { filters: true } },
			slots: { 'cell-name': cell },
			attachTo: document.body,
		})
		const calls = cell.mock.calls.length
		expect(calls).toBeGreaterThanOrEqual(ROWS.length)
		expect(cells(wrapper, 0)).toEqual(['[Анна]', '[Борис]', '[Вера]'])

		const toolbar = wrapper.findComponent(BaseTableToolbar)
		toolbar.vm.$emit('update:filter-value', 'Ан')
		await nextTick()
		toolbar.vm.$emit('update:filter-value', 'Анна')
		await nextTick()

		expect(cell.mock.calls.length).toBe(calls)
		wrapper.unmount()
	})

	it('реактивное значение в слоте обновляет только свою ячейку', async () => {
		const suffix = ref('!')
		const wrapper = mount(BaseTable, {
			props: { columns: COLUMNS, rows: ROWS },
			slots: { 'cell-name': (props: { value: unknown }) => `${props.value}${suffix.value}` },
		})
		expect(cells(wrapper, 0)).toEqual(['Анна!', 'Борис!', 'Вера!'])
		suffix.value = '?'
		await nextTick()
		expect(cells(wrapper, 0)).toEqual(['Анна?', 'Борис?', 'Вера?'])
		wrapper.unmount()
	})

	it('слот, пересозданный родителем с другим замыканием, заменяет содержимое ячеек, заголовка и пустой таблицы', async () => {
		const Parent = defineComponent({
			props: { label: { type: String, required: true }, rows: { type: Array, required: true } },
			setup(props) {
				return () => {
					const label = props.label
					return h(
						BaseTable,
						{ columns: COLUMNS, rows: props.rows as TableRow[] },
						{
							'cell-name': (args: { value: unknown }) => `${label}:${args.value}`,
							'header-name': () => `Имя ${label}`,
							empty: () => `Пусто ${label}`,
						},
					)
				}
			},
		})
		const wrapper = mount(Parent, { props: { label: 'a', rows: ROWS } })
		expect(cells(wrapper, 0)).toEqual(['a:Анна', 'a:Борис', 'a:Вера'])
		expect(wrapper.get('th.base-table__th--left').text()).toContain('Имя a')

		await wrapper.setProps({ label: 'b' })
		expect(cells(wrapper, 0)).toEqual(['b:Анна', 'b:Борис', 'b:Вера'])
		expect(wrapper.get('th.base-table__th--left').text()).toContain('Имя b')

		await wrapper.setProps({ rows: [] })
		expect(wrapper.get('tbody').text()).toContain('Пусто b')
		await wrapper.setProps({ label: 'c' })
		expect(wrapper.get('tbody').text()).toContain('Пусто c')
		wrapper.unmount()
	})

	it('слот, добавленный и снятый после монтирования, появляется и исчезает', async () => {
		const isShown = ref(false)
		const Parent = defineComponent({
			setup() {
				return () =>
					h(
						BaseTable,
						{ columns: COLUMNS, rows: ROWS },
						isShown.value ? { 'cell-age': (args: { value: unknown }) => `${args.value} лет` } : {},
					)
			},
		})
		const wrapper = mount(Parent)
		expect(cells(wrapper, 1)).toEqual(['31', '28', '45'])
		isShown.value = true
		await nextTick()
		expect(cells(wrapper, 1)).toEqual(['31 лет', '28 лет', '45 лет'])
		isShown.value = false
		await nextTick()
		expect(cells(wrapper, 1)).toEqual(['31', '28', '45'])
		wrapper.unmount()
	})

	it('слот expanded-content получает строку и выводится у раскрытой', async () => {
		document.documentElement.setAttribute('data-rise-reduced-motion', 'always')
		const wrapper = mount(BaseTable, {
			props: { columns: COLUMNS, rows: ROWS, expandedIds: [2] },
			slots: { 'expanded-content': (props: { row: TableRow }) => `Детали ${props.row.data.name}` },
			global: { stubs: { transition: false } },
		})
		expect(wrapper.findAll('tr.base-table__tr--expanded-content')).toHaveLength(1)
		expect(wrapper.get('tr.base-table__tr--expanded-content').text()).toBe('Детали Борис')
		wrapper.unmount()
		document.documentElement.removeAttribute('data-rise-reduced-motion')
	})

	it('слоты вложенных строк берутся у приложения: ячейки дочерних строк', () => {
		const rows: TableRow[] = [
			{ id: 1, data: { name: 'Группа', age: 0 }, children: [{ id: 11, data: { name: 'Дочерняя', age: 5 } }], isExpanded: true },
		]
		const wrapper = mount(BaseTable, {
			props: { columns: COLUMNS, rows },
			slots: { 'cell-name': (props: { value: unknown }) => `<${props.value}>` },
		})
		expect(wrapper.findAll('tbody tr.base-table__tr--child td').map(cell => cell.text())).toContain('<Дочерняя>')
		wrapper.unmount()
	})
})
