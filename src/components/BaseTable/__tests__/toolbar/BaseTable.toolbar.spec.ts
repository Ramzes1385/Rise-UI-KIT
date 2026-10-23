import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import BaseTable from '../../ui/BaseTable.vue'
import { BaseInput } from '@components/BaseInput'
import { BaseSelect } from '@components/BaseSelect'
import { BaseDatePicker } from '@components/BaseDatePicker'
import BaseTableToolbar from '../../ui/toolbar/BaseTableToolbar.vue'
import type { TableColumn, TableRow } from '../../types/BaseTable.types'
import type { BaseTableToolbarProps } from '../../types/toolbar/BaseTableToolbar.types'

const COLUMNS: TableColumn[] = [
	{ key: 'name', label: 'Имя' },
	{ key: 'age', label: 'Возраст', sortType: 'number' },
	{ key: 'born', label: 'Родился', sortType: 'date' },
	{ key: 'role', label: 'Роль', filterConfig: { type: 'select', options: [{ value: 'dev', label: 'Разработчик' }] } },
	{ key: 'tags', label: 'Теги', filterConfig: { type: 'multi-select', options: [{ value: 'a', label: 'Альфа' }] } },
]

const ROWS: TableRow[] = [
	{ id: 1, data: { name: 'Иван', age: 25, born: '2000-05-14', role: 'dev', tags: 'a' } },
	{ id: 2, data: { name: 'Мария', age: 30, born: '1995-01-02', role: 'qa', tags: 'b' } },
	{ id: 3, data: { name: 'Олег', age: 41, born: '1984-12-31', role: 'dev', tags: 'a' } },
]

const BASE: BaseTableToolbarProps = {
	showToolbar: true,
	hasSearch: true,
	hasFilters: true,
	hasColumnSettings: true,
	searchQuery: '',
	filterColumn: 'age',
	filterOperator: 'eq',
	filterValue: '',
	filterValueTo: '',
	filterValues: [],
	filterKind: 'number',
	filterSelectOptions: [],
	isRangeOperator: false,
	canAddFilter: false,
	filterColumnOptions: [{ value: 'age', label: 'Возраст' }],
	filterOperatorOptions: [{ value: 'eq', label: '=' }],
	activeFilters: [],
	columns: COLUMNS,
	isSettingsOpen: false,
	exportItems: [],
	isExportOpen: false,
	sizeScale: 100,
	getFilterLabel: () => '',
}

function mountToolbar(props: Partial<BaseTableToolbarProps> = {}) {
	return mount(BaseTableToolbar, { props: { ...BASE, ...props }, attachTo: document.body })
}

describe('BaseTable: тулбар', () => {
	it('панель — toolbar с именем, группа фильтра и поля подписаны', () => {
		const wrapper = mountToolbar()
		const toolbar = wrapper.get('[role="toolbar"]')
		expect(toolbar.attributes('aria-label')).toBe('Инструменты таблицы')
		expect(toolbar.attributes('aria-orientation')).toBe('horizontal')
		expect(wrapper.get('[role="group"]').attributes('aria-label')).toBe('Фильтр')
		const names = wrapper.findAll('[role="combobox"]').map(item => item.attributes('aria-label'))
		expect(names).toEqual(['Колонка фильтра', 'Условие фильтра'])
		expect(wrapper.get('input[type="number"]').attributes('aria-label') ?? wrapper.get('label').text()).toBeTruthy()
		wrapper.unmount()
	})

	it('одна точка Tab: остальные элементы tabindex=-1, стрелки переносят фокус', async () => {
		const wrapper = mountToolbar()
		await nextTick()
		const items = [...(wrapper.element as HTMLElement).querySelectorAll<HTMLElement>('[data-toolbar-item]')]
		expect(items.length).toBeGreaterThan(3)
		expect(items.filter(item => item.tabIndex === 0)).toHaveLength(1)
		expect(items[0].tabIndex).toBe(0)
		items[0].focus()
		items[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }))
		expect(document.activeElement).toBe(items[1])
		expect(items[1].tabIndex).toBe(0)
		expect(items[0].tabIndex).toBe(-1)
		wrapper.unmount()
	})

	it('меню «Колонки» есть среди кнопок панели', () => {
		const wrapper = mountToolbar()
		const menuButton = wrapper.findAll('button').find(button => button.text().includes('Колонки'))
		expect(menuButton).toBeTruthy()
		wrapper.unmount()
	})

	it('числа: оператор between показывает два поля number с именами «от» и «до»', () => {
		const wrapper = mountToolbar({ filterOperator: 'between', isRangeOperator: true })
		const inputs = wrapper.findAllComponents(BaseInput).filter(input => input.props('type') === 'number')
		expect(inputs).toHaveLength(2)
		expect(inputs.map(input => input.props('label'))).toEqual(['Значение фильтра от', 'Значение фильтра до'])
		inputs[0].vm.$emit('update:modelValue', '10')
		inputs[1].vm.$emit('update:modelValue', '20')
		expect(wrapper.emitted('update:filter-value')).toEqual([['10']])
		expect(wrapper.emitted('update:filter-value-to')).toEqual([['20']])
		inputs[1].vm.$emit('keydown', new KeyboardEvent('keydown', { key: 'Enter' }))
		expect(wrapper.emitted('add-filter')).toHaveLength(1)
		wrapper.unmount()
	})

	it('кнопка «Добавить» недоступна без полного значения, остаётся в обходе и не добавляет', async () => {
		const wrapper = mountToolbar({ canAddFilter: false })
		const add = wrapper.get('.base-table__filter-add-btn')
		expect(add.attributes('aria-disabled')).toBe('true')
		expect(add.attributes('disabled')).toBeUndefined()
		await add.trigger('click')
		expect(wrapper.emitted('add-filter')).toBeUndefined()
		await wrapper.setProps({ canAddFilter: true })
		await wrapper.get('.base-table__filter-add-btn').trigger('click')
		expect(wrapper.emitted('add-filter')).toHaveLength(1)
		wrapper.unmount()
	})

	it('текст: одно текстовое поле, Enter добавляет фильтр', () => {
		const wrapper = mountToolbar({ filterKind: 'text', filterPlaceholder: 'Имя…' })
		const inputs = wrapper.findAllComponents(BaseInput).filter(input => input.props('label') === 'Значение фильтра')
		expect(inputs).toHaveLength(1)
		expect(inputs[0].props('type')).toBe('text')
		expect(inputs[0].props('placeholder')).toBe('Имя…')
		inputs[0].vm.$emit('keydown', new KeyboardEvent('keydown', { key: 'Enter' }))
		expect(wrapper.emitted('add-filter')).toHaveLength(1)
		wrapper.unmount()
	})

	it('дата: календарь вместо текстового поля, значение уходит строкой ГГГГ-ММ-ДД', () => {
		const wrapper = mountToolbar({ filterKind: 'date', filterValue: '2025-05-14', filterValueTo: '2025-06-01', isRangeOperator: true })
		const pickers = wrapper.findAllComponents(BaseDatePicker)
		expect(pickers).toHaveLength(2)
		expect((pickers[0].props('modelValue') as Date).getDate()).toBe(14)
		expect((pickers[1].props('modelValue') as Date).getMonth()).toBe(5)
		pickers[0].vm.$emit('update:modelValue', new Date(2025, 0, 5))
		pickers[1].vm.$emit('update:modelValue', new Date(2025, 11, 31))
		pickers[0].vm.$emit('update:modelValue', null)
		expect(wrapper.emitted('update:filter-value')).toEqual([['2025-01-05'], ['']])
		expect(wrapper.emitted('update:filter-value-to')).toEqual([['2025-12-31']])
		expect(wrapper.findAllComponents(BaseInput).filter(input => input.props('type') === 'number')).toHaveLength(0)
		wrapper.unmount()
	})

	it('дата: пустое значение — поле без даты, один выбор без диапазона', () => {
		const wrapper = mountToolbar({ filterKind: 'date', filterValue: '' })
		const pickers = wrapper.findAllComponents(BaseDatePicker)
		expect(pickers).toHaveLength(1)
		expect(pickers[0].props('modelValue')).toBeNull()
		wrapper.unmount()
	})

	it('select и multi-select: варианты из filterConfig, значения уходят строками', () => {
		const options = [{ value: 'dev', label: 'Разработчик' }]
		const single = mountToolbar({ filterKind: 'select', filterSelectOptions: options, filterValue: 'dev' })
		const select = single.findAllComponents(BaseSelect)[2]
		expect(select.props('options')).toEqual(options)
		expect(select.props('isMultiple')).toBeFalsy()
		expect(select.props('placeholder')).toBe('Выберите…')
		select.vm.$emit('update:modelValue', 'qa')
		expect(single.emitted('update:filter-value')).toEqual([['qa']])
		single.unmount()

		const multi = mountToolbar({ filterKind: 'multi-select', filterSelectOptions: options, filterValues: ['dev'] })
		const list = multi.findAllComponents(BaseSelect)[2]
		expect(list.props('isMultiple')).toBe(true)
		expect(list.props('modelValue')).toEqual(['dev'])
		list.vm.$emit('update:modelValue', ['dev', 1])
		expect(multi.emitted('update:filter-values')).toEqual([[['dev', '1']]])
		multi.unmount()
	})

	it('select: пустой выбор уходит пустой строкой', () => {
		const wrapper = mountToolbar({ filterKind: 'select', filterSelectOptions: [] })
		wrapper.findAllComponents(BaseSelect)[2].vm.$emit('update:modelValue', [])
		expect(wrapper.emitted('update:filter-value')).toEqual([['']])
		wrapper.unmount()
	})
})

describe('BaseTable: фильтры через тулбар', () => {
	interface Draft {
		column: string
		operator: string
		value: string
		valueTo?: string
	}

	async function addFilter(wrapper: ReturnType<typeof mount>, draft: Draft) {
		const toolbar = wrapper.findComponent(BaseTableToolbar)
		toolbar.vm.$emit('update:filter-column', draft.column)
		await nextTick()
		toolbar.vm.$emit('update:filter-operator', draft.operator)
		await nextTick()
		toolbar.vm.$emit('update:filter-value', draft.value)
		if (draft.valueTo !== undefined) toolbar.vm.$emit('update:filter-value-to', draft.valueTo)
		await nextTick()
		toolbar.vm.$emit('add-filter')
		await nextTick()
	}

	const names = (wrapper: ReturnType<typeof mount>): string[] => wrapper.findAll('tbody tr').map(row => row.findAll('td')[0].text())

	function mountTable() {
		return mount(BaseTable, { props: { columns: COLUMNS, rows: ROWS, features: { filters: true } }, attachTo: document.body })
	}

	it('число between и дата lt фильтруют строки и дают метки-чипы', async () => {
		const wrapper = mountTable()
		await addFilter(wrapper, { column: 'age', operator: 'between', value: '26', valueTo: '45' })
		expect(names(wrapper)).toEqual(['Мария', 'Олег'])
		await addFilter(wrapper, { column: 'born', operator: 'lt', value: '1990-01-01' })
		expect(names(wrapper)).toEqual(['Олег'])
		const chips = wrapper.findAll('.base-table__filter-tag').map(chip => chip.text())
		expect(chips[0]).toContain('Возраст: 26 – 45')
		expect(chips[1]).toContain('Родился')
		wrapper.unmount()
	})

	it('проп timeZone доходит до фильтра дат: сутки метки считаются в заданном поясе', async () => {
		const rows: TableRow[] = [{ id: 1, data: { name: 'Поздний', born: Date.UTC(2025, 4, 14, 22, 0) } }]
		const filtered = async (timeZone: string): Promise<string[]> => {
			const wrapper = mount(BaseTable, {
				props: { columns: COLUMNS, rows, timeZone, features: { filters: true } },
				attachTo: document.body,
			})
			await addFilter(wrapper, { column: 'born', operator: 'eq', value: '2025-05-14' })
			const result = names(wrapper)
			wrapper.unmount()
			return result
		}
		expect(await filtered('UTC')).toEqual(['Поздний'])
		expect(await filtered('Europe/Moscow')).toEqual(['Ничего не найдено'])
	})

	it('multi-select in и select ne', async () => {
		const wrapper = mountTable()
		const toolbar = wrapper.findComponent(BaseTableToolbar)
		toolbar.vm.$emit('update:filter-column', 'tags')
		await nextTick()
		toolbar.vm.$emit('update:filter-values', ['a'])
		await nextTick()
		toolbar.vm.$emit('add-filter')
		await nextTick()
		expect(names(wrapper)).toEqual(['Иван', 'Олег'])
		expect(wrapper.get('.base-table__filter-tag').text()).toContain('Теги ∈ Альфа')
		await addFilter(wrapper, { column: 'role', operator: 'ne', value: 'qa' })
		expect(names(wrapper)).toEqual(['Иван', 'Олег'])
		wrapper.unmount()
	})

	it('удаление чипа возвращает фокус на соседний чип, а с последнего — на панель', async () => {
		const wrapper = mountTable()
		await addFilter(wrapper, { column: 'name', operator: 'contains', value: 'и' })
		await addFilter(wrapper, { column: 'age', operator: 'gt', value: '1' })
		const remove = (): HTMLElement[] => [
			...(wrapper.element as HTMLElement).querySelectorAll<HTMLElement>('.base-table__filter-remove'),
		]
		expect(remove()).toHaveLength(2)
		remove()[0].click()
		await nextTick()
		await nextTick()
		expect(remove()).toHaveLength(1)
		expect(document.activeElement).toBe(remove()[0])
		remove()[0].click()
		await nextTick()
		await nextTick()
		expect(remove()).toHaveLength(0)
		expect(wrapper.element.contains(document.activeElement)).toBe(true)
		expect((document.activeElement as HTMLElement).tabIndex).toBe(0)
		wrapper.unmount()
	})

	it('Delete и Backspace на чипе удаляют его, фокус уходит на соседний чип', async () => {
		const wrapper = mountTable()
		await addFilter(wrapper, { column: 'name', operator: 'contains', value: 'и' })
		await addFilter(wrapper, { column: 'age', operator: 'gt', value: '1' })
		const remove = (): HTMLElement[] => [
			...(wrapper.element as HTMLElement).querySelectorAll<HTMLElement>('.base-table__filter-remove'),
		]
		remove()[0].focus()
		await wrapper.findAll('.base-table__filter-tag')[0].trigger('keydown', { key: 'Delete' })
		await nextTick()
		await nextTick()
		expect(remove()).toHaveLength(1)
		expect(document.activeElement).toBe(remove()[0])
		await wrapper.get('.base-table__filter-tag').trigger('keydown', { key: 'Backspace' })
		await nextTick()
		await nextTick()
		expect(remove()).toHaveLength(0)
		expect(wrapper.emitted('filter')?.at(-1)).toEqual([[]])
		wrapper.unmount()
	})

	it('смена колонки подставляет операторы типа, пустой фильтр не добавляется', async () => {
		const wrapper = mountTable()
		const toolbar = wrapper.findComponent(BaseTableToolbar)
		toolbar.vm.$emit('update:filter-column', 'age')
		await nextTick()
		expect(toolbar.props('filterKind')).toBe('number')
		expect(toolbar.props('filterOperator')).toBe('eq')
		expect(toolbar.props('canAddFilter')).toBe(false)
		toolbar.vm.$emit('add-filter')
		await nextTick()
		expect(wrapper.emitted('filter')).toBeUndefined()
		wrapper.unmount()
	})
})
